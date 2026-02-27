import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { calculateTurn } from "./utils/gameUtils";
import { initialState } from "./state/initialState";
import type { GameState, ActionType } from "./types";

interface PlayerActionPayload {
    action: ActionType;
    fireCount: number;
}

async function startServer() {
  const app = express();
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

  const broadcastPublicRooms = () => {
    io.emit("PUBLIC_ROOMS_UPDATE", Array.from(publicRoomCodes));
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

    io.to(roomCode).emit("ROOM_STATE_UPDATE", resultState);

    setTimeout(() => {
        const currentRoomState = rooms.get(roomCode);
        if (!currentRoomState) return;

        if (currentRoomState.gameResult) {
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
        };
        rooms.set(roomCode, nextTurnState);
        
        io.to(roomCode).emit("ROOM_STATE_UPDATE", nextTurnState);
    }, 2500);
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("GET_PUBLIC_ROOMS", () => {
      socket.emit("PUBLIC_ROOMS_UPDATE", Array.from(publicRoomCodes));
    });

    socket.on("CREATE_ROOM", (isPublic: boolean, sessionId: string, callback: (roomCode: string) => void) => {
      const roomCode = `PVP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const newRoomState: GameState = {
          ...initialState,
          gameMode: 'pvp',
          roomCode,
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
      callback(roomCode);
    });

    socket.on("JOIN_ROOM", (roomCode: string, sessionId: string, callback: (success: boolean, state?: GameState) => void) => {
      const room = rooms.get(roomCode);
      if (room && !room.opponentJoined) {
          room.opponentJoined = true;
          
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
      
      io.to(roomCode).emit("ROOM_STATE_UPDATE", room);

      if (room.playerAction && room.enemyAction) {
          room.turnInProgress = true;
          processPvpTurn(roomCode);
      }
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
