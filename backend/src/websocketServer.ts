import * as WebSocket from "ws";
import { open } from "sqlite";
import * as sqlite3 from "sqlite3";
import * as path from "path";

const dbPromise = open({
  filename: path.resolve(__dirname, "./database.sqlite"),
  driver: sqlite3.Database,
});

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const { type, data } = JSON.parse(message.toString());

    if (type === "UPDATE_DOCUMENT") {
      const { documentId, content } = data;
      try {
        const db = await dbPromise;
        await db.run("UPDATE documents SET content = ? WHERE id = ?", [
          content,
          documentId,
        ]);
        //broadcast the update to all clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "DOCUMENT_UPDATE",
                data: { documentId, content },
              })
            );
          }
        });
      } catch (err) {
        console.error("Error updating document:", err);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

export default wss;
