// Imports for express
import express from "express";
import * as fs from "fs";
import * as path from "path";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import cors from "cors";

// Imports for socket.io
import { Server } from "socket.io";
import { createServer } from "http";
import { registerChatSockets } from "./sockets/chatSockets.ts";

// Imports for routes
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import chatRoutes from "./routes/chatRoutes.ts";

const PORT = process.env.PORT || 3000;

const app = express();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// CORS configuration
app.use(cors({ origin: "http://localhost:4321", credentials: true }));

//parsers
const sessionMiddleware = cookieSession({
  name: "session",
  keys: ["key1", "key2", "key3"],
  maxAge: 1 * 2 * 60 * 1000, // 2mins
});

// Parsers para Express
app.use(cookieParser("our unique encryption algorithm"));
app.use(sessionMiddleware);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

// Socket.io setup
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4321",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Make the Socket.io instance globally available to Express controllers
app.set("io", io);

// Middleware to integrate cookie sessions with Socket.io connections
io.use((socket, next) => {
  // @ts-ignore
  sessionMiddleware(socket.request, {}, next);
});

registerChatSockets(io);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}..."`);
});

process.on("SIGINT", () => {
  console.log("Server is closing.... now");
  process.exit();
});
