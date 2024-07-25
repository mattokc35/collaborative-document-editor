import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as path from "path";
import config from "./config";

const databasePath = path.resolve(__dirname, "../database.sqlite");

const setupDatabase = async () => {
  const db = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      ownerId INTEGER NOT NULL,
      FOREIGN KEY (ownerId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      permission TEXT NOT NULL CHECK(permission IN ('VIEW', 'EDIT', 'DELETE')),
      FOREIGN KEY (documentId) REFERENCES documents (id),
      FOREIGN KEY (userId) REFERENCES users (id),
      UNIQUE(documentId, userId)
    );
  `);

  console.log("Database setup complete");
  await db.close();
};

setupDatabase().catch((err) => {
  console.error("Database setup failed", err);
});
