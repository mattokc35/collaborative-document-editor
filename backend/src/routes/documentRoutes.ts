import * as express from "express";
import { open } from "sqlite";
import * as sqlite3 from "sqlite3";
import authenticateToken from "../middleware/authMiddleware";
import { UserRequest } from "../middleware/authMiddleware";
import config from "../db/config";
import * as path from "path";

const router = express.Router();
const databasePath = path.resolve(__dirname, "../database.sqlite"); //use relative path based on file location

const dbPromise = open({
  filename: databasePath,
  driver: sqlite3.Database,
});

router.use(authenticateToken);

//create Document
router.post("/", async (req: UserRequest, res) => {
  const { title, content } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = await dbPromise;

  try {
    const result = await db.run(
      "INSERT INTO documents (title, content, ownerId) VALUES (?, ?, ?)",
      [title, content, userId]
    );

    await db.run(
      "INSERT INTO permissions (documentId, userId, permission) VALUES (?, ?, ?)",
      [result.lastID, userId, "EDIT"]
    );

    res.status(201).json({ documentId: result.lastID });
  } catch (error) {
    console.error("Failed to create document:", error);
    res.status(500).json({ error: "Document creation failed" });
  }
});

//get documents
router.get("/", async (req: UserRequest, res) => {
  const userId = req.userId; //get userId from request context or token
  const db = await dbPromise;
  try {
    const documents = await db.all(
      `
      SELECT d.id, d.title, d.content
      FROM documents d
      INNER JOIN permissions p ON d.id = p.documentId
      WHERE p.userId = ? AND p.permission IN ('VIEW', 'EDIT')
    `,
      [userId]
    );
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
});

//get document by ID
router.get("/:id", async (req: UserRequest, res) => {
  const { id } = req.params;
  const userId = req.userId; //get userId from request context or token
  const db = await dbPromise;
  try {
    const document = await db.get(
      `
      SELECT d.id, d.title, d.content
      FROM documents d
      INNER JOIN permissions p ON d.id = p.documentId
      WHERE d.id = ? AND p.userId = ? AND p.permission IN ('VIEW', 'EDIT')
    `,
      [id, userId]
    );
    if (document) {
      res.json(document);
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve document" });
  }
});

//update document
router.put("/:id", async (req: UserRequest, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.userId; // Get userId from request context or token
  const db = await dbPromise;
  try {
    const permission = await db.get(
      "SELECT * FROM permissions WHERE documentId = ? AND userId = ? AND permission = ?",
      [id, userId, "EDIT"]
    );
    if (permission) {
      await db.run("UPDATE documents SET title = ?, content = ? WHERE id = ?", [
        title,
        content,
        id,
      ]);
      res.status(204).end();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update document" });
  }
});

//delete document
router.delete("/:id", async (req: UserRequest, res) => {
  const { id } = req.params;
  const userId = req.userId; //get userId from request context or token
  const db = await dbPromise;
  try {
    const permission = await db.get(
      "SELECT * FROM permissions WHERE documentId = ? AND userId = ? AND permission = ?",
      [id, userId, "EDIT"]
    );
    if (permission) {
      await db.run("DELETE FROM documents WHERE id = ?", [id]);
      await db.run("DELETE FROM permissions WHERE documentId = ?", [id]);
      res.status(204).end();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

//share document
router.post("/:id/share", async (req: UserRequest, res) => {
  const { id } = req.params;
  const { userId, permission } = req.body; //permission should be 'VIEW', 'EDIT', or 'DELETE'
  const db = await dbPromise;
  try {
    await db.run(
      "INSERT INTO permissions (documentId, userId, permission) VALUES (?, ?, ?)",
      [id, userId, permission]
    );
    res.status(201).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to share document" });
  }
});

//revoke document access
router.delete("/:id/share", async (req: UserRequest, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const db = await dbPromise;
  try {
    await db.run(
      "DELETE FROM permissions WHERE documentId = ? AND userId = ?",
      [id, userId]
    );
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke document access" });
  }
});

router.get("/:id/shared-users", async (req: UserRequest, res) => {
  console.log("Fetching shared users...");
  const { id } = req.params;
  console.log(`Fetching shared users for document ID: ${id}`);

  const db = await dbPromise;
  try {
    const userIdsResult = await db.all(
      "SELECT userId FROM permissions WHERE documentId = ?",
      [id]
    );

    console.log(
      `User IDs found: ${userIdsResult.map((row) => row.userId).join(", ")}`
    );

    const userIds = userIdsResult.map((row: any) => row.userId);

    if (userIds.length === 0) {
      return res.json([]); //no shared users
    }

    const users = await db.all(
      `SELECT id, username FROM users WHERE id IN (${userIds
        .map(() => "?")
        .join(",")})`,
      userIds
    );

    console.log(
      `Users found: ${users.map((user) => user.username).join(", ")}`
    );

    res.json(users);
  } catch (error) {
    console.error("Failed to retrieve shared users:", error);
    res.status(500).json({ error: "Failed to retrieve shared users" });
  }
});

export default router;
