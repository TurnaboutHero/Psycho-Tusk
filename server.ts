import express from "express";
import next from "next";
import { Server } from "socket.io";
import { createServer } from "http";
import { parse } from "url";
import { getDatabaseAdapter } from "./server/db";
import { createApiRouter } from "./server/api";
import { SocketManager } from "./server/socket";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function startServer() {
  await nextApp.prepare();

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

  // Next.js request handler
  app.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
