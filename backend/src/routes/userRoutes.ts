import { Router } from "express";
import { open } from "sqlite";
import * as sqlite3 from "sqlite3";
import * as path from "path";
import jwt from "jsonwebtoken";

const router = Router();
const dbPromise = open({
  filename: path.resolve(__dirname, "../database.sqlite"),
  driver: sqlite3.Database,
});

//middleware to authenticate token and extract user ID
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

//get user by username
router.get("/", async (req, res) => {
  const username = req.query.username as string;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const db = await dbPromise;
    const user = await db.get(
      "SELECT id, username FROM users WHERE username = ?",
      [username]
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
