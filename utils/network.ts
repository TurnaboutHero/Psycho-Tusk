import { io, Socket } from 'socket.io-client';
import type { GameState, ActionType } from '../types';

interface PlayerActionPayload {
    action: ActionType;
    fireCount: number;
}

class NetworkService {
    private socket: Socket | null = null;
    private listeners: ((update: any) => void)[] = [];
    private publicRoomCodes: string[] = [];
    private sessionId: string;
    private userId: string | null = null;

    constructor() {
        // Get or create session ID for reconnection
        let storedSessionId = localStorage.getItem('pvp_session_id');
        if (!storedSessionId) {
            storedSessionId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('pvp_session_id', storedSessionId);
        }
        this.sessionId = storedSessionId;
        this.connect();
    }

    private connect() {
        if (!this.socket) {
            // Connect to the same host/port the app is running on
            this.socket = io({
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
            });

            this.socket.on('connect', () => {
                console.log('Connected to server with ID:', this.socket?.id);
                this.notify({ type: 'CONNECTION_STATUS', payload: true });
                if (this.userId) {
                    this.socket?.emit('REGISTER_USER', this.userId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.notify({ type: 'CONNECTION_STATUS', payload: false });
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection error:', err);
            });

            this.socket.on('PUBLIC_ROOMS_UPDATE', (rooms: string[]) => {
                this.publicRoomCodes = rooms;
                this.notify({ type: 'PUBLIC_ROOMS_UPDATE', payload: rooms });
            });

            this.socket.on('ROOM_STATE_UPDATE', (state: GameState) => {
                this.notify({ type: 'ROOM_STATE_UPDATE', payload: state });
            });

            this.socket.on('EMOTE_RECEIVED', (playerId: 'player1' | 'player2', emote: string) => {
                this.notify({ type: 'EMOTE_RECEIVED', payload: { playerId, emote } });
            });

            this.socket.on('MATCH_FOUND', (payload: { roomCode: string, playerId: 'player1' | 'player2', state: GameState }) => {
                this.notify({ type: 'MATCH_FOUND', payload });
            });

            this.socket.on('MATCHMAKING_STARTED', () => {
                this.notify({ type: 'MATCHMAKING_STARTED' });
            });

            this.socket.on('MATCHMAKING_CANCELLED', () => {
                this.notify({ type: 'MATCHMAKING_CANCELLED' });
            });
        }
    }

    private notify(update: any) {
        this.listeners.forEach(listener => listener(update));
    }

    // --- Public API ---

    public createRoom(isPublic: boolean): Promise<{ roomCode: string; state: GameState }> {
        return new Promise((resolve) => {
            if (!this.socket) this.connect();
            this.socket?.emit('CREATE_ROOM', isPublic, this.sessionId, (roomCode: string, state: GameState) => {
                resolve({ roomCode, state });
            });
        });
    }

    public joinRoom(roomCode: string): Promise<{ success: boolean; state?: GameState }> {
        return new Promise((resolve) => {
            if (!this.socket) this.connect();
            this.socket?.emit('JOIN_ROOM', roomCode, this.sessionId, (success: boolean, state?: GameState) => {
                resolve({ success, state });
            });
        });
    }

    public reconnect(): Promise<{ success: boolean; state?: GameState; playerId?: 'player1' | 'player2' }> {
        return new Promise((resolve) => {
            if (!this.socket) this.connect();
            this.socket?.emit('RECONNECT', this.sessionId, (success: boolean, state?: GameState, playerId?: 'player1' | 'player2') => {
                resolve({ success, state, playerId });
            });
        });
    }

    public findMatch() {
        if (!this.socket) this.connect();
        this.socket?.emit('FIND_MATCH', this.sessionId);
    }

    public cancelMatch() {
        if (!this.socket) this.connect();
        this.socket?.emit('CANCEL_MATCH');
    }

    public sendAction(roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) {
        if (!this.socket) this.connect();
        this.socket?.emit('SEND_ACTION', roomCode, playerId, payload);
    }

    public sendEmote(roomCode: string, playerId: 'player1' | 'player2', emote: string) {
        if (!this.socket) this.connect();
        this.socket?.emit('SEND_EMOTE', roomCode, playerId, emote);
    }

    public leaveRoom(roomCode: string) {
        if (!this.socket) this.connect();
        this.socket?.emit('LEAVE_ROOM', roomCode, this.sessionId);
    }
    
    public getPublicRooms(): string[] {
        if (!this.socket) this.connect();
        this.socket?.emit('GET_PUBLIC_ROOMS');
        return [...this.publicRoomCodes];
    }
    
    public onStateUpdate(callback: (update: any) => void): () => void {
        this.listeners.push(callback);
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public registerUser(userId: string) {
        this.userId = userId;
        if (!this.socket) this.connect();
        this.socket?.emit('REGISTER_USER', userId);
    }
}

export const networkService = new NetworkService();