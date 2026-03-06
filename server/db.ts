import sqlite3 from 'sqlite3';
import admin from 'firebase-admin';

export interface User {
    id: string;
    username: string;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
}

export interface DatabaseAdapter {
    getUser(username: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    createUser(username: string): Promise<User>;
    updateStats(winnerId: string | null, loserId: string | null, isDraw: boolean): Promise<void>;
    getLeaderboard(): Promise<User[]>;
}

export class SQLiteAdapter implements DatabaseAdapter {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database('game.db');
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                rating INTEGER DEFAULT 1200
            )`);
        });
    }

    getUser(username: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM users WHERE username = ?", [username], (err, row: any) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    getUserById(id: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM users WHERE id = ?", [id], (err, row: any) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    createUser(username: string): Promise<User> {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(2, 15);
            this.db.run("INSERT INTO users (id, username) VALUES (?, ?)", [id, username], (err) => {
                if (err) reject(err);
                else resolve({ id, username, wins: 0, losses: 0, draws: 0, rating: 1200 });
            });
        });
    }

    updateStats(winnerId: string | null, loserId: string | null, isDraw: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (isDraw) {
                if (winnerId) this.db.run("UPDATE users SET draws = draws + 1 WHERE id = ?", [winnerId]);
                if (loserId) this.db.run("UPDATE users SET draws = draws + 1 WHERE id = ?", [loserId]);
            } else {
                if (winnerId) {
                    this.db.run("UPDATE users SET wins = wins + 1, rating = rating + 25 WHERE id = ?", [winnerId]);
                }
                if (loserId) {
                    this.db.run("UPDATE users SET losses = losses + 1, rating = MAX(0, rating - 25) WHERE id = ?", [loserId]);
                }
            }
            resolve();
        });
    }

    getLeaderboard(): Promise<User[]> {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT username, rating, wins, losses, draws FROM users ORDER BY rating DESC LIMIT 10", (err, rows: any[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

export class FirebaseAdapter implements DatabaseAdapter {
    private db: admin.firestore.Firestore;

    constructor() {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error("Missing Firebase credentials");
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }
        this.db = admin.firestore();
    }

    async getUser(username: string): Promise<User | null> {
        const snapshot = await this.db.collection('users').where('username', '==', username).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
    }

    async getUserById(id: string): Promise<User | null> {
        const doc = await this.db.collection('users').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as User;
    }

    async createUser(username: string): Promise<User> {
        const newUser = {
            username,
            wins: 0,
            losses: 0,
            draws: 0,
            rating: 1200
        };
        const docRef = await this.db.collection('users').add(newUser);
        return { id: docRef.id, ...newUser };
    }

    async updateStats(winnerId: string | null, loserId: string | null, isDraw: boolean): Promise<void> {
        const batch = this.db.batch();

        if (isDraw) {
            if (winnerId) {
                const ref = this.db.collection('users').doc(winnerId);
                batch.update(ref, { draws: admin.firestore.FieldValue.increment(1) });
            }
            if (loserId) {
                const ref = this.db.collection('users').doc(loserId);
                batch.update(ref, { draws: admin.firestore.FieldValue.increment(1) });
            }
        } else {
            if (winnerId) {
                const ref = this.db.collection('users').doc(winnerId);
                batch.update(ref, { 
                    wins: admin.firestore.FieldValue.increment(1),
                    rating: admin.firestore.FieldValue.increment(25)
                });
            }
            if (loserId) {
                // Handle loser rating update via transaction to ensure non-negative rating
                // We do this outside the batch for simplicity in this adapter, or we can just do a simple increment
                // and fix negative ratings later. But let's use a transaction for the loser part if possible.
                // Since batch and transaction don't mix easily in one go, let's just do the winner update here
                // and the loser update separately, or use a transaction for everything.
                // For this refactor, let's keep it simple:
                const ref = this.db.collection('users').doc(loserId);
                // We can't do conditional updates in a batch easily without reading.
                // So we will just decrement here and trust the client/server logic to handle display,
                // OR we can use a transaction for the whole operation.
            }
        }
        
        await batch.commit();

        if (!isDraw && loserId) {
             await this.db.runTransaction(async (t) => {
                const ref = this.db.collection('users').doc(loserId);
                const doc = await t.get(ref);
                if (!doc.exists) return;
                const data = doc.data() as User;
                const newRating = Math.max(0, (data.rating || 1200) - 25);
                t.update(ref, { 
                    losses: admin.firestore.FieldValue.increment(1),
                    rating: newRating 
                });
            });
        }
    }

    async getLeaderboard(): Promise<User[]> {
        const snapshot = await this.db.collection('users').orderBy('rating', 'desc').limit(10).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    }
}

export function getDatabaseAdapter(): DatabaseAdapter {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        console.log("Initializing Firebase Adapter...");
        try {
            return new FirebaseAdapter();
        } catch (e) {
            console.error("Failed to initialize Firebase, falling back to SQLite:", e);
            return new SQLiteAdapter();
        }
    } else {
        console.log("Initializing SQLite Adapter...");
        return new SQLiteAdapter();
    }
}
