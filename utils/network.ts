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
            this.socket = io();

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

    public sendAction(roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) {
        if (!this.socket) this.connect();
        this.socket?.emit('SEND_ACTION', roomCode, playerId, payload);
    }

    public sendEmote(roomCode: string, playerId: 'player1' | 'player2', emote: string) {
        if (!this.socket) this.connect();
        this.socket?.emit('SEND_EMOTE', roomCode, playerId, emote);
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
}

export const networkService = new NetworkService();