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

    constructor() {
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
        }
    }

    private notify(update: any) {
        this.listeners.forEach(listener => listener(update));
    }

    // --- Public API ---

    public createRoom(isPublic: boolean): Promise<string> {
        return new Promise((resolve) => {
            if (!this.socket) this.connect();
            this.socket?.emit('CREATE_ROOM', isPublic, (roomCode: string) => {
                resolve(roomCode);
            });
        });
    }

    public joinRoom(roomCode: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.socket) this.connect();
            this.socket?.emit('JOIN_ROOM', roomCode, (success: boolean) => {
                resolve(success);
            });
        });
    }

    public sendAction(roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) {
        if (!this.socket) this.connect();
        this.socket?.emit('SEND_ACTION', roomCode, playerId, payload);
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