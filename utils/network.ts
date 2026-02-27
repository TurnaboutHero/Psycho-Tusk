import { initialState } from '../state/initialState';
import { calculateTurn } from './gameUtils';
import type { GameState, ActionType, EnemyDecision } from '../types';

interface PlayerActionPayload {
    action: ActionType;
    fireCount: number;
}

// This is a mock server. It now manages multiple rooms.
class NetworkService {
    private rooms: Map<string, GameState> = new Map();
    private publicRoomCodes: string[] = [];
    private listeners: ((update: any) => void)[] = [];

    // --- Private Methods ---

    private notify(update: any) {
        this.listeners.forEach(listener => listener(update));
    }

    private processPvpTurn(roomCode: string) {
        const room = this.rooms.get(roomCode);
        if (!room) return;

        // 1. Calculate the outcome based on the current state where both actions are set.
        const turnOutcome = calculateTurn(room);

        // 2. Create an intermediate state to show the result of the turn.
        // Actions are kept so the UI can display what happened.
        const resultState: GameState = {
            ...room,
            ...turnOutcome, // This applies health changes, new battle log message, animation, etc.
            turnInProgress: true,
        };
        this.rooms.set(roomCode, resultState);

        // 3. Notify clients immediately to show the turn result and animations.
        this.notify({ type: 'ROOM_STATE_UPDATE', payload: resultState });

        // 4. After a delay for players to see the result, create the final state for the next turn.
        setTimeout(() => {
            const currentRoomState = this.rooms.get(roomCode);
            if (!currentRoomState) return;

            // 5. If the game is over, we don't need to prepare a next turn.
            if (currentRoomState.gameResult) {
                 // Clean up finished game after a delay
                 setTimeout(() => {
                    this.rooms.delete(roomCode);
                    const publicIndex = this.publicRoomCodes.indexOf(roomCode);
                     if (publicIndex > -1) {
                         this.publicRoomCodes.splice(publicIndex, 1);
                         this.notify({ type: 'PUBLIC_ROOMS_UPDATE', payload: [...this.publicRoomCodes] });
                     }
                 }, 10000);
                return;
            }

            // 6. Prepare the state for the beginning of the next turn.
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
                turnResult: '', // Clear the message from the battlefield overlay
            };
            this.rooms.set(roomCode, nextTurnState);
            
            // 7. Notify clients of the new, clean state for the next turn.
            this.notify({ type: 'ROOM_STATE_UPDATE', payload: nextTurnState });
        }, 2500); // Wait 2.5 seconds for animations and result viewing.
    }

    // --- Public API ---

    public createRoom(isPublic: boolean): string {
        const roomCode = `PVP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const newRoomState: GameState = {
            ...initialState,
            gameMode: 'pvp',
            roomCode,
        };
        this.rooms.set(roomCode, newRoomState);

        if (isPublic) {
            this.publicRoomCodes.push(roomCode);
            this.notify({ type: 'PUBLIC_ROOMS_UPDATE', payload: [...this.publicRoomCodes] });
        }
        return roomCode;
    }

    public joinRoom(roomCode: string): boolean {
        const room = this.rooms.get(roomCode);
        if (room && !room.opponentJoined) {
            room.opponentJoined = true;
            
            // Remove from public list if it was there
            const publicIndex = this.publicRoomCodes.indexOf(roomCode);
            if (publicIndex > -1) {
                this.publicRoomCodes.splice(publicIndex, 1);
                this.notify({ type: 'PUBLIC_ROOMS_UPDATE', payload: [...this.publicRoomCodes] });
            }
            
            this.notify({ type: 'ROOM_STATE_UPDATE', payload: room });
            return true;
        }
        return false;
    }

    public sendAction(roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) {
        const room = this.rooms.get(roomCode);
        if (!room || room.turnInProgress) return;

        if (playerId === 'player1') {
            room.playerAction = payload.action;
            room.playerFireCount = payload.fireCount;
        } else {
            room.enemyAction = { type: payload.action, count: payload.fireCount };
        }
        
        // Notify players that a choice has been made
        this.notify({ type: 'ROOM_STATE_UPDATE', payload: room });

        // Once both players have acted, process the turn.
        if (room.playerAction && room.enemyAction) {
            room.turnInProgress = true;
            this.processPvpTurn(roomCode);
        }
    }
    
    public getPublicRooms(): string[] {
        return [...this.publicRoomCodes];
    }
    
    public onStateUpdate(callback: (update: any) => void): () => void {
        this.listeners.push(callback);
        
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    public disconnect() {
        // In a real app, this would handle socket disconnection. Here we just clear listeners.
        // Game rooms are cleared automatically when they end.
    }
}

export const networkService = new NetworkService();