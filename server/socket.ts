import { Server, Socket } from "socket.io";
import { GameState, ActionType } from "../types";
import { calculateTurn, getTurnDuration } from "../utils/gameUtils";
import { initialState } from "../state/initialState";
import { DatabaseAdapter } from "./db";

interface PlayerActionPayload {
    action: ActionType;
    fireCount: number;
}

export class SocketManager {
    private io: Server;
    private db: DatabaseAdapter;
    private rooms: Map<string, GameState>;
    private publicRoomCodes: Set<string>;
    private sessionToRoom: Map<string, { roomCode: string, playerId: 'player1' | 'player2' }>;
    private socketToUser: Map<string, string>;
    private matchmakingQueue: { socketId: string, userId: string, rating: number, joinTime: number, sessionId: string }[];
    private matchmakingInterval: NodeJS.Timeout | null = null;

    constructor(io: Server, db: DatabaseAdapter) {
        this.io = io;
        this.db = db;
        this.rooms = new Map();
        this.publicRoomCodes = new Set();
        this.sessionToRoom = new Map();
        this.socketToUser = new Map();
        this.matchmakingQueue = [];

        this.setupSocketEvents();
        this.startMatchmakingLoop();
    }

    private startMatchmakingLoop() {
        this.matchmakingInterval = setInterval(() => {
            this.processMatchmakingQueue();
        }, 5000);
    }

    private async processMatchmakingQueue() {
        if (this.matchmakingQueue.length < 2) return;

        const matchedIndices = new Set<number>();

        for (let i = 0; i < this.matchmakingQueue.length; i++) {
            if (matchedIndices.has(i)) continue;

            const player1 = this.matchmakingQueue[i];
            const timeInQueue1 = (Date.now() - player1.joinTime) / 1000;
            // Expand rating range over time: base 100 + 10 per second waiting
            const allowedDiff1 = 100 + (timeInQueue1 * 10);

            for (let j = i + 1; j < this.matchmakingQueue.length; j++) {
                if (matchedIndices.has(j)) continue;

                const player2 = this.matchmakingQueue[j];
                const ratingDiff = Math.abs(player1.rating - player2.rating);

                if (ratingDiff <= allowedDiff1) {
                    // Match found!
                    matchedIndices.add(i);
                    matchedIndices.add(j);
                    await this.createMatch(player1, player2);
                    break; 
                }
            }
        }

        // Remove matched players from queue
        this.matchmakingQueue = this.matchmakingQueue.filter((_, index) => !matchedIndices.has(index));
    }

    private async createMatch(p1: { socketId: string, userId: string, sessionId: string }, p2: { socketId: string, userId: string, sessionId: string }) {
        const roomCode = `RANKED-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        const newRoomState: GameState = {
            ...initialState,
            gameMode: 'pvp',
            roomCode,
            player1Id: p1.userId,
            player2Id: p2.userId,
            opponentJoined: true,
        };
        this.rooms.set(roomCode, newRoomState);

        const socket1 = this.io.sockets.sockets.get(p1.socketId);
        const socket2 = this.io.sockets.sockets.get(p2.socketId);

        if (socket1) {
            socket1.join(roomCode);
            socket1.data.roomCode = roomCode;
            socket1.data.playerId = 'player1';
            socket1.data.sessionId = p1.sessionId;
            this.sessionToRoom.set(p1.sessionId, { roomCode, playerId: 'player1' });
            socket1.emit("MATCH_FOUND", { roomCode, playerId: 'player1', state: newRoomState });
        }

        if (socket2) {
            socket2.join(roomCode);
            socket2.data.roomCode = roomCode;
            socket2.data.playerId = 'player2';
            socket2.data.sessionId = p2.sessionId;
            this.sessionToRoom.set(p2.sessionId, { roomCode, playerId: 'player2' });
            socket2.emit("MATCH_FOUND", { roomCode, playerId: 'player2', state: newRoomState });
        }
    }

    private broadcastPublicRooms() {
        this.io.emit("PUBLIC_ROOMS_UPDATE", Array.from(this.publicRoomCodes));
    }

    private async updateStats(winnerId: string | null, loserId: string | null, isDraw: boolean) {
        await this.db.updateStats(winnerId, loserId, isDraw);
    }

    private async broadcastRoomState(roomCode: string) {
        const room = this.rooms.get(roomCode);
        if (!room) return;

        const sockets = await this.io.in(roomCode).fetchSockets();
        
        for (const socket of sockets) {
            const pid = socket.data.playerId;
            const personalizedState = { ...room };

            if (!room.turnInProgress) {
                if (pid === 'player1') {
                    personalizedState.enemyAction = null;
                } else if (pid === 'player2') {
                    personalizedState.playerAction = null;
                }
            }

            socket.emit("ROOM_STATE_UPDATE", personalizedState);
        }
    }

    private processPvpTurn(roomCode: string) {
        const room = this.rooms.get(roomCode);
        if (!room) return;

        const turnOutcome = calculateTurn(room);

        const resultState: GameState = {
            ...room,
            ...turnOutcome,
            turnInProgress: true,
        };
        this.rooms.set(roomCode, resultState);

        this.io.to(roomCode).emit("ROOM_STATE_UPDATE", resultState);

        const duration = getTurnDuration(room.playerAction || undefined, room.enemyAction?.type || undefined, room.playerFireCount, room.enemyAction?.count || 0);

        setTimeout(() => {
            const currentRoomState = this.rooms.get(roomCode);
            if (!currentRoomState) return;

            if (currentRoomState.roomStatus === 'game_end') {
                const p1Id = currentRoomState.player1Id;
                const p2Id = currentRoomState.player2Id;

                if (p1Id && p2Id) {
                    if (currentRoomState.gameResult === '무승부!') {
                        this.updateStats(p1Id, p2Id, true);
                    } else if (currentRoomState.gameResult === '승리!') {
                         this.updateStats(p1Id, p2Id, false);
                    } else if (currentRoomState.gameResult === '패배!') {
                        this.updateStats(p2Id, p1Id, false);
                    }
                }

                setTimeout(() => {
                    this.rooms.delete(roomCode);
                    this.publicRoomCodes.delete(roomCode);
                    this.broadcastPublicRooms();
                }, 10000);
                return;
            }
            
            if (currentRoomState.roomStatus === 'round_end') {
                // Wait for players to click "Next Round"
                return;
            }

            const nextTurnState: GameState = {
                ...currentRoomState,
                playerAction: null,
                enemyAction: null,
                playerFireCount: 1,
                turnCount: currentRoomState.turnCount + 1,
                timeLeft: 15,
                turnInProgress: false,
                animation: null,
                showHitEffect: null,
                turnResult: '',
                playerDamageTaken: null,
                enemyDamageTaken: null,
            };
            this.rooms.set(roomCode, nextTurnState);
            
            this.io.to(roomCode).emit("ROOM_STATE_UPDATE", nextTurnState);
        }, duration);
    }

    private setupSocketEvents() {
        this.io.on("connection", (socket: Socket) => {
            console.log("User connected:", socket.id);

            socket.on("REGISTER_USER", (userId: string) => {
                this.socketToUser.set(socket.id, userId);
            });

            socket.on("NEXT_ROUND", (roomCode: string) => {
                const room = this.rooms.get(roomCode);
                if (!room || room.roomStatus !== 'round_end') return;

                const nextRoundState: GameState = {
                    ...room,
                    playerHealth: 5,
                    enemyHealth: 5,
                    playerBullets: 0,
                    enemyBullets: 0,
                    playerBlockLeft: 3,
                    enemyBlockLeft: 3,
                    playerAction: null,
                    enemyAction: null,
                    playerFireCount: 1,
                    turnCount: 1,
                    round: room.round + 1,
                    roomStatus: 'playing',
                    turnInProgress: false,
                    turnResult: '',
                    battleLog: [`라운드 ${room.round + 1} 시작!`],
                    playerDamageTaken: null,
                    enemyDamageTaken: null,
                    showHitEffect: null,
                };

                this.rooms.set(roomCode, nextRoundState);
                this.io.to(roomCode).emit("ROOM_STATE_UPDATE", nextRoundState);
            });

            socket.on("GET_PUBLIC_ROOMS", () => {
                socket.emit("PUBLIC_ROOMS_UPDATE", Array.from(this.publicRoomCodes));
            });

            socket.on("CREATE_ROOM", (isPublic: boolean, sessionId: string, callback: (roomCode: string, state: GameState) => void) => {
                const roomCode = `PVP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                const userId = this.socketToUser.get(socket.id);
                
                const newRoomState: GameState = {
                    ...initialState,
                    gameMode: 'pvp',
                    roomCode,
                    player1Id: userId,
                };
                this.rooms.set(roomCode, newRoomState);

                if (isPublic) {
                    this.publicRoomCodes.add(roomCode);
                    this.broadcastPublicRooms();
                }
                
                socket.join(roomCode);
                socket.data.roomCode = roomCode;
                socket.data.playerId = 'player1';
                socket.data.sessionId = sessionId;
                this.sessionToRoom.set(sessionId, { roomCode, playerId: 'player1' });
                callback(roomCode, newRoomState);
            });

            socket.on("JOIN_ROOM", (roomCode: string, sessionId: string, callback: (success: boolean, state?: GameState) => void) => {
                const room = this.rooms.get(roomCode);
                if (room && !room.opponentJoined) {
                    room.opponentJoined = true;
                    room.player2Id = this.socketToUser.get(socket.id);
                    
                    if (this.publicRoomCodes.has(roomCode)) {
                        this.publicRoomCodes.delete(roomCode);
                        this.broadcastPublicRooms();
                    }
                    
                    socket.join(roomCode);
                    socket.data.roomCode = roomCode;
                    socket.data.playerId = 'player2';
                    socket.data.sessionId = sessionId;
                    this.sessionToRoom.set(sessionId, { roomCode, playerId: 'player2' });
                    this.io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
                    callback(true, room);
                } else {
                    callback(false);
                }
            });

            socket.on("RECONNECT", (sessionId: string, callback: (success: boolean, state?: GameState, playerId?: 'player1' | 'player2') => void) => {
                const sessionInfo = this.sessionToRoom.get(sessionId);
                if (sessionInfo) {
                    const room = this.rooms.get(sessionInfo.roomCode);
                    if (room) {
                        socket.join(sessionInfo.roomCode);
                        socket.data.roomCode = sessionInfo.roomCode;
                        socket.data.playerId = sessionInfo.playerId;
                        socket.data.sessionId = sessionId;
                        
                        if (socket.data.disconnectTimeout) {
                            clearTimeout(socket.data.disconnectTimeout);
                            socket.data.disconnectTimeout = null;
                        }
                        
                        callback(true, room, sessionInfo.playerId);
                        return;
                    }
                }
                callback(false);
            });

            socket.on("SEND_EMOTE", (roomCode: string, playerId: 'player1' | 'player2', emote: string) => {
                this.io.to(roomCode).emit("EMOTE_RECEIVED", playerId, emote);
            });

            socket.on("SEND_ACTION", (roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) => {
                const room = this.rooms.get(roomCode);
                if (!room || room.turnInProgress) return;

                if (playerId === 'player1') {
                    room.playerAction = payload.action;
                    room.playerFireCount = payload.fireCount;
                } else {
                    room.enemyAction = { type: payload.action, count: payload.fireCount };
                }
                
                this.broadcastRoomState(roomCode);

                if (room.playerAction && room.enemyAction) {
                    room.turnInProgress = true;
                    this.processPvpTurn(roomCode);
                }
            });

            socket.on("LEAVE_ROOM", (roomCode: string, sessionId: string) => {
                const room = this.rooms.get(roomCode);
                if (room) {
                    if (!room.opponentJoined) {
                        this.rooms.delete(roomCode);
                        if (this.publicRoomCodes.has(roomCode)) {
                            this.publicRoomCodes.delete(roomCode);
                            this.broadcastPublicRooms();
                        }
                    } else {
                        room.gameResult = socket.data.playerId === 'player1' ? '플레이어 1이 나갔습니다.' : '플레이어 2가 나갔습니다.';
                        this.io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
                        setTimeout(() => {
                            this.rooms.delete(roomCode);
                            if (this.publicRoomCodes.has(roomCode)) {
                                this.publicRoomCodes.delete(roomCode);
                                this.broadcastPublicRooms();
                            }
                        }, 5000);
                    }
                }
                this.sessionToRoom.delete(sessionId);
                socket.leave(roomCode);
                socket.data.roomCode = null;
            });

            socket.on("FIND_MATCH", async (sessionId: string) => {
                const userId = this.socketToUser.get(socket.id);
                if (!userId) return;

                const user = await this.db.getUserById(userId);
                const rating = user ? user.rating : 1200;

                // Remove if already in queue to prevent duplicates
                this.matchmakingQueue = this.matchmakingQueue.filter(q => q.socketId !== socket.id);

                this.matchmakingQueue.push({
                    socketId: socket.id,
                    userId,
                    rating,
                    joinTime: Date.now(),
                    sessionId
                });

                socket.emit("MATCHMAKING_STARTED");
                this.processMatchmakingQueue();
            });

            socket.on("CANCEL_MATCH", () => {
                this.matchmakingQueue = this.matchmakingQueue.filter(q => q.socketId !== socket.id);
                socket.emit("MATCHMAKING_CANCELLED");
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
                
                // Remove from matchmaking queue
                this.matchmakingQueue = this.matchmakingQueue.filter(q => q.socketId !== socket.id);

                const roomCode = socket.data.roomCode;
                const sessionId = socket.data.sessionId;
                
                if (roomCode) {
                    const timeout = setTimeout(() => {
                        const room = this.rooms.get(roomCode);
                        if (room) {
                            room.gameResult = socket.data.playerId === 'player1' ? '플레이어 1 연결 끊김' : '플레이어 2 연결 끊김';
                            this.io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
                            
                            setTimeout(() => {
                                this.rooms.delete(roomCode);
                                if (this.publicRoomCodes.has(roomCode)) {
                                    this.publicRoomCodes.delete(roomCode);
                                    this.broadcastPublicRooms();
                                }
                                if (sessionId) this.sessionToRoom.delete(sessionId);
                            }, 5000);
                        }
                    }, 10000);
                    
                    socket.data.disconnectTimeout = timeout;
                }
            });
        });
    }
}
