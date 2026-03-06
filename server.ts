import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";
import { getDatabaseAdapter } from "./server/db";
import { createApiRouter } from "./server/api";
import { SocketManager } from "./server/socket";

async function startServer() {
  const app = express();
  app.use(express.json()); // Enable JSON body parsing
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Initialize Database
  const db = getDatabaseAdapter();

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize Socket Manager
  new SocketManager(io, db);

  // Initialize API Routes
  app.use("/api", createApiRouter(db));

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
