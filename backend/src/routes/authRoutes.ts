import * as express from "express";
import { open } from "sqlite";
import * as sqlite3 from "sqlite3";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import config from "../db/config";
import * as path from "path";

const router = express.Router();
const databasePath = path.resolve(__dirname, "../database.sqlite"); //use relative path based on file location

const dbPromise = open({
  filename: databasePath,
  driver: sqlite3.Database,
});

//registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const db = await dbPromise;
  try {
    console.log("Attempting to register user...");

    //check if username already exists
    const existingUser = await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const result = await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    console.log("User registered successfully");
    res.status(201).json({ userId: result.lastID });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "User registration failed" });
  }
});

//login
router.post("/login", async (req, res) => {
  console.log("Login attempt received1");
  const { username, password } = req.body;
  const db = await dbPromise;

  try {
    console.log("Login attempt received");

    //check if the user exists
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) {
      console.warn(`Login failed: User not found for username ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`Login failed: Incorrect password for username ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //generate a JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    console.log(`Login successful for username ${username}`);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

export default router;
