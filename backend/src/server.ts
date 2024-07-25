import * as express from "express";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as WebSocket from "ws";
import wss from "./websocketServer";
import { open } from "sqlite";
import * as http from "http";
import * as sqlite3 from "sqlite3";
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import userRoutes from "./routes/userRoutes";
import authenticateToken from "./middleware/authMiddleware";
import * as path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

//handle WebSocket upgrades
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
const port = 5001;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/documents", authenticateToken, documentRoutes); //protect document routes
app.use("/api/users", authenticateToken, userRoutes);

const databasePath = path.resolve(__dirname, "./database.sqlite"); //use relative path based on file location

// WebSocket setup
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
