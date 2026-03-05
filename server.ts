import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { calculateTurn } from "./utils/gameUtils";
import { initialState } from "./state/initialState";
import type { GameState, ActionType } from "./types";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { calculateTurn } from "./utils/gameUtils";
import { initialState } from "./state/initialState";
import type { GameState, ActionType } from "./types";
import sqlite3 from 'sqlite3';
import admin from 'firebase-admin';

// --- Database Abstraction ---
interface User {
    id: string;
    username: string;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
}

interface DatabaseAdapter {
    getUser(username: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    createUser(username: string): Promise<User>;
    updateStats(winnerId: string | null, loserId: string | null, isDraw: boolean): Promise<void>;
    getLeaderboard(): Promise<User[]>;
}

// --- SQLite Implementation ---
class SQLiteAdapter implements DatabaseAdapter {
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

// --- Firebase Implementation ---
class FirebaseAdapter implements DatabaseAdapter {
    private db: admin.firestore.Firestore;

    constructor() {
        // Check if we have individual env vars or a service account file
        // For this environment, we expect individual env vars
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error("Missing Firebase credentials");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
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
                const ref = this.db.collection('users').doc(loserId);
                // Firestore doesn't have MAX() in update, so we need to read first or use a transaction.
                // For simplicity, we'll just decrement. A negative rating is theoretically possible here but rare.
                // To be safe, let's use a transaction for the loser.
            }
        }
        
        // Commit batch first for simple updates
        await batch.commit();

        // Handle loser rating floor logic separately if needed, or just accept negative for now.
        // Let's improve loser logic with a transaction.
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

// --- Initialize DB ---
let db: DatabaseAdapter;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    console.log("Initializing Firebase Adapter...");
    try {
        db = new FirebaseAdapter();
        console.log("Firebase initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize Firebase, falling back to SQLite:", e);
        db = new SQLiteAdapter();
    }
} else {
    console.log("Initializing SQLite Adapter...");
    db = new SQLiteAdapter();
}

interface PlayerActionPayload {
    action: ActionType;
    fireCount: number;
}

async function startServer() {
  const app = express();
  app.use(express.json()); // Enable JSON body parsing
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map<string, GameState>();
  const publicRoomCodes = new Set<string>();
  const sessionToRoom = new Map<string, { roomCode: string, playerId: 'player1' | 'player2' }>();
  // Map socket ID to User ID
  const socketToUser = new Map<string, string>();

  const broadcastPublicRooms = () => {
    io.emit("PUBLIC_ROOMS_UPDATE", Array.from(publicRoomCodes));
  };

  const updateStats = async (winnerId: string | null, loserId: string | null, isDraw: boolean) => {
      await db.updateStats(winnerId, loserId, isDraw);
  };

  const broadcastRoomState = async (roomCode: string) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const sockets = await io.in(roomCode).fetchSockets();
    
    for (const socket of sockets) {
        const pid = socket.data.playerId;
        // Create a shallow copy to modify for this specific player
        const personalizedState = { ...room };

        // If the turn is NOT in progress (i.e., planning phase), hide the opponent's action
        if (!room.turnInProgress) {
            if (pid === 'player1') {
                // Player 1 should not see Player 2's action yet
                personalizedState.enemyAction = null;
            } else if (pid === 'player2') {
                // Player 2 should not see Player 1's action yet
                personalizedState.playerAction = null;
            }
        }

        socket.emit("ROOM_STATE_UPDATE", personalizedState);
    }
  };

  const processPvpTurn = (roomCode: string) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const turnOutcome = calculateTurn(room);

    const resultState: GameState = {
        ...room,
        ...turnOutcome,
        turnInProgress: true,
    };
    rooms.set(roomCode, resultState);

    // Broadcast full state (with results) to everyone
    io.to(roomCode).emit("ROOM_STATE_UPDATE", resultState);

    setTimeout(() => {
        const currentRoomState = rooms.get(roomCode);
        if (!currentRoomState) return;

        if (currentRoomState.gameResult) {
            // Game Over - Record Stats
            // We need to know who is who.
            // In room state, we don't store user IDs directly, but we can retrieve them from sockets if they are still connected,
            // OR we should store user IDs in the room state.
            // For now, let's try to get them from the room object if we add them, or just use the socket mapping if available.
            // Better approach: Add player1Id and player2Id to GameState (server-side only or public).
            // Let's assume we add them to the room object when creating/joining.
            
            const p1Id = currentRoomState.player1Id;
            const p2Id = currentRoomState.player2Id;

            if (p1Id && p2Id) {
                if (currentRoomState.gameResult === '무승부!') {
                    updateStats(p1Id, p2Id, true);
                } else if (currentRoomState.gameResult === '승리!') {
                     // '승리!' means 'Enemy' died, so Player 1 won? 
                     // Wait, calculateTurn logic:
                     // if (enemyHealth <= 0) gameResult = '승리!'; -> Player 1 wins
                     // if (playerHealth <= 0) gameResult = '패배!'; -> Player 1 loses
                     if (currentRoomState.gameResult === '승리!') {
                         updateStats(p1Id, p2Id, false);
                     } else {
                         updateStats(p2Id, p1Id, false);
                     }
                } else if (currentRoomState.gameResult === '패배!') {
                    updateStats(p2Id, p1Id, false);
                } else if (currentRoomState.gameResult.includes('플레이어 1')) {
                    // Player 1 disconnected/left -> Player 2 wins
                    updateStats(p2Id, p1Id, false);
                } else if (currentRoomState.gameResult.includes('플레이어 2')) {
                    // Player 2 disconnected/left -> Player 1 wins
                    updateStats(p1Id, p2Id, false);
                }
            }

            setTimeout(() => {
                rooms.delete(roomCode);
                publicRoomCodes.delete(roomCode);
                broadcastPublicRooms();
            }, 10000);
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
        rooms.set(roomCode, nextTurnState);
        
        // Broadcast new turn state (actions are null, so safe to broadcast to all)
        io.to(roomCode).emit("ROOM_STATE_UPDATE", nextTurnState);
    }, 2500);
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("REGISTER_USER", (userId: string) => {
        socketToUser.set(socket.id, userId);
    });

    socket.on("GET_PUBLIC_ROOMS", () => {
      socket.emit("PUBLIC_ROOMS_UPDATE", Array.from(publicRoomCodes));
    });

    socket.on("CREATE_ROOM", (isPublic: boolean, sessionId: string, callback: (roomCode: string, state: GameState) => void) => {
      const roomCode = `PVP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const userId = socketToUser.get(socket.id);
      
      const newRoomState: GameState = {
          ...initialState,
          gameMode: 'pvp',
          roomCode,
          player1Id: userId, // Store User ID
      };
      rooms.set(roomCode, newRoomState);

      if (isPublic) {
          publicRoomCodes.add(roomCode);
          broadcastPublicRooms();
      }
      
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerId = 'player1';
      socket.data.sessionId = sessionId;
      sessionToRoom.set(sessionId, { roomCode, playerId: 'player1' });
      callback(roomCode, newRoomState);
    });

    socket.on("JOIN_ROOM", (roomCode: string, sessionId: string, callback: (success: boolean, state?: GameState) => void) => {
      const room = rooms.get(roomCode);
      if (room && !room.opponentJoined) {
          room.opponentJoined = true;
          room.player2Id = socketToUser.get(socket.id); // Store User ID
          
          if (publicRoomCodes.has(roomCode)) {
              publicRoomCodes.delete(roomCode);
              broadcastPublicRooms();
          }
          
          socket.join(roomCode);
          socket.data.roomCode = roomCode;
          socket.data.playerId = 'player2';
          socket.data.sessionId = sessionId;
          sessionToRoom.set(sessionId, { roomCode, playerId: 'player2' });
          io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
          callback(true, room);
      } else {
          callback(false);
      }
    });

    socket.on("RECONNECT", (sessionId: string, callback: (success: boolean, state?: GameState, playerId?: 'player1' | 'player2') => void) => {
      const sessionInfo = sessionToRoom.get(sessionId);
      if (sessionInfo) {
        const room = rooms.get(sessionInfo.roomCode);
        if (room) {
          socket.join(sessionInfo.roomCode);
          socket.data.roomCode = sessionInfo.roomCode;
          socket.data.playerId = sessionInfo.playerId;
          socket.data.sessionId = sessionId;
          
          // Clear any pending disconnect timeouts
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
      io.to(roomCode).emit("EMOTE_RECEIVED", playerId, emote);
    });

    socket.on("SEND_ACTION", (roomCode: string, playerId: 'player1' | 'player2', payload: PlayerActionPayload) => {
      const room = rooms.get(roomCode);
      if (!room || room.turnInProgress) return;

      if (playerId === 'player1') {
          room.playerAction = payload.action;
          room.playerFireCount = payload.fireCount;
      } else {
          room.enemyAction = { type: payload.action, count: payload.fireCount };
      }
      
      // Use broadcastRoomState to send masked updates
      broadcastRoomState(roomCode);

      if (room.playerAction && room.enemyAction) {
          room.turnInProgress = true;
          processPvpTurn(roomCode);
      }
    });

    socket.on("LEAVE_ROOM", (roomCode: string, sessionId: string) => {
      const room = rooms.get(roomCode);
      if (room) {
          if (!room.opponentJoined) {
              rooms.delete(roomCode);
              if (publicRoomCodes.has(roomCode)) {
                  publicRoomCodes.delete(roomCode);
                  broadcastPublicRooms();
              }
          } else {
              room.gameResult = socket.data.playerId === 'player1' ? '플레이어 1이 나갔습니다.' : '플레이어 2가 나갔습니다.';
              io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
              setTimeout(() => {
                  rooms.delete(roomCode);
                  if (publicRoomCodes.has(roomCode)) {
                      publicRoomCodes.delete(roomCode);
                      broadcastPublicRooms();
                  }
              }, 5000);
          }
      }
      sessionToRoom.delete(sessionId);
      socket.leave(roomCode);
      socket.data.roomCode = null;
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const roomCode = socket.data.roomCode;
      const sessionId = socket.data.sessionId;
      
      if (roomCode) {
          // Give the player 10 seconds to reconnect before ending the game
          const timeout = setTimeout(() => {
              const room = rooms.get(roomCode);
              if (room) {
                  room.gameResult = socket.data.playerId === 'player1' ? '플레이어 1 연결 끊김' : '플레이어 2 연결 끊김';
                  io.to(roomCode).emit("ROOM_STATE_UPDATE", room);
                  
                  setTimeout(() => {
                      rooms.delete(roomCode);
                      if (publicRoomCodes.has(roomCode)) {
                          publicRoomCodes.delete(roomCode);
                          broadcastPublicRooms();
                      }
                      if (sessionId) sessionToRoom.delete(sessionId);
                  }, 5000);
              }
          }, 10000);
          
          socket.data.disconnectTimeout = timeout;
      }
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User Registration / Login
  app.post("/api/user", async (req, res) => {
      const { username } = req.body;
      if (!username) {
          res.status(400).json({ error: "Username is required" });
          return;
      }

      try {
          let user = await db.getUser(username);
          if (!user) {
              user = await db.createUser(username);
          }
          res.json(user);
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });

  // Get Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
      try {
          const rows = await db.getLeaderboard();
          res.json(rows);
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });
  
  // Get User Stats
  app.get("/api/user/:id", async (req, res) => {
      try {
          const user = await db.getUserById(req.params.id);
          if (user) {
              res.json(user);
          } else {
              res.status(404).json({ error: "User not found" });
          }
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
            server: httpServer
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
