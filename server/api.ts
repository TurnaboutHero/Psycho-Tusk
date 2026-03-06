import express, { Router } from 'express';
import { DatabaseAdapter } from './db';

export function createApiRouter(db: DatabaseAdapter): Router {
    const router = express.Router();

    router.get("/health", (req, res) => {
        res.json({ status: "ok" });
    });

    router.post("/user", async (req, res) => {
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

    router.get("/leaderboard", async (req, res) => {
        try {
            const rows = await db.getLeaderboard();
            res.json(rows);
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    router.get("/user/:id", async (req, res) => {
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

    return router;
}
