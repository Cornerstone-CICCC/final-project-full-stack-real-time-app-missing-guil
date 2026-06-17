import express from "express";

import { Server, Socket } from "socket.io";
import { updateUserStatus, findUserById } from "../model/User.ts";

import { createChat, getChatsbyUserId, getChatbyId, getMessagesForChat, addMessageToChat, addParticipantToChat } from "../model/Chat.ts";

export const SOCKET_EVENTS = {
  MESSAGE_HISTORY: "message_history", // no sue
  NEW_MESSAGE: "new_message", // no use
  USER_PRESENCE: "user_presence", // no use
  USER_TYPING: "user_typing", // no use
} as const;

// =========================================================================
// REST API ENDPOINTS FOR CHAT MANAGEMENT
// =========================================================================

/**
 * @function getUserChats
 * @param {express.Request} req - The Express request object containing the user session
 * @param {express.Response} res - The Express response object used to send back the chat history channels
 * @returns {Promise<void>} Sends a JSON list of all active chats for the authenticated user
 * @description Retrieves all direct messages and group conversations linked to the authenticated user's ID from memory.
 */
export const getUserChats = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    // 1. Extract the `userId` from the current active session state.
    const userId = req.session?.userId;
    // 2. Query the data structures for all conversations mapped to the user by calling `getChatsByUserId(userId)`.
    const userChats = getChatsbyUserId(userId);
    // 3. Respond with the compiled list of direct and group chat structures in JSON format alongside a 200 OK status.
    res.status(200).json(userChats);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user chats" });
  }
};

/**
 * @function createGroupChat
 * @param {express.Request} req - The Express request object containing group configuration parameters within the body
 * @param {express.Response} res - The Express response object used to return the initialized group record
 * @returns {Promise<void>} Sends a JSON response with the newly generated group chat details
 * @description Compiles selected participant identifiers alongside the creator, creates a distinct room structure, and hooks up history records.
 */
export const createGroupChat = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    // 1. Extract the group `name` and member credentials from `req.body`
    const { name, participantIds } = req.body;

    // 2. Capture the `userId` of the requesting user from the active session
    const userId = (req as any).session?.userId;

    // Security check: Make sure the user is actually logged in
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Please log in first." });
      return;
    }

    // 3. Enforce payload structural validation
    if (!name || typeof name !== "string" || !Array.isArray(participantIds)) {
      res
        .status(400)
        .json({
          error: "Bad Request: Invalid group name or participant list.",
        });
      return;
    }

    if (name.trim() === "") {
      res
        .status(400)
        .json({ error: "Bad Request: Group name cannot be empty." });
      return;
    }

    if (participantIds.length === 0) {
      res
        .status(400)
        .json({
          error:
            "Bad Request: At least one participant is required to create a group chat.",
        });
      return;
    }

    if (participantIds.includes(userId)) {
      res
        .status(400)
        .json({
          error:
            "Bad Request: Creator should not be included in the participant list.",
        });
      return;
    }

    if (new Set(participantIds).size !== participantIds.length) {
      res
        .status(400)
        .json({ error: "Bad Request: Duplicate participant IDs detected." });
      return;
    }

    // 3.5 Validate that all participantIds correspond to existing users (optional but recommended for data integrity)
    if (!participantIds.every((id) => findUserById(id))) {
      res
        .status(400)
        .json({
          error: "Bad Request: One or more participant IDs are invalid.",
        });
      return;
    }

    // 4. Merge creator's `userId` with `participantIds` and remove duplicates
    // Using Set ensures that if the creator accidentally included themselves in the participantIds, they aren't added twice.
    const uniqueParticipants = Array.from(new Set([userId, ...participantIds]));

    // 5. Invoke the model constructor to instantiate the group chat
    // We pass the clean data to the Model layer here.
    const newChat = createChat(name, true, uniqueParticipants);

    // 6. Dispatch the resulting group object payload
    res.status(201).json(newChat);
  } catch (error) {
    console.error("[ChatController] Error in createGroupChat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const joinGroupChat = async (req: express.Request, res: express.Response) => {
  try {
    const { chatId } = req.body;
    const userId = (req as any).session?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: Please log in first." });
      return;
    }
    if (!chatId || typeof chatId !== "string") {
      res.status(400).json({ error: "Bad Request: Invalid chat ID." });
      return;
    }
    const chat = getChatbyId(chatId);
    if (!chat) {
      res.status(404).json({ error: "Not Found: Chat does not exist." });
      return;
    }
    if (!chat.isGroupChat) {
      res.status(400).json({ error: "Bad Request: Cannot join a direct message chat." });
      return;
    } 

    if (chat.participantIds.includes(userId)) {
      res.status(400).json({ error: "Bad Request: User is already a participant of this chat." });
      return;
    }

    chat.participantIds.push(userId);
    const updatedChat = addParticipantToChat(chatId, userId);
    // req.app.get("io").to(chatId).emit("user_joined_group", { chatId, userId });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
  
}; 

// =========================================================================
// CONVERSATION MANAGEMENT EVENTS (SOCKET.IO)
// =========================================================================

/**
 * @function handleSocketConnect
 * @param {Socket} socket - The connected client socket instance
 * @param {Server} io - The global Socket.io server instance
 * @returns {void}
 * @description Controller logic for initializing a user's real-time session, binding identity data, and broadcasting their online status.
 */
export const handleSocketConnect = (socket: Socket, io: Server): void => {
  // - Extract `userId` and `username` from the connection handshake options or session cookies.
  // - Bind these values securely to the socket instance data space (`socket.data.userId` and `socket.data.username`) for subsequent event lookup context.
  // - Invoke `updateUserStatus(username, "online")` to explicitly synchronize memory data state.
  // - Broadcast presence payload globally via `socket.broadcast.emit("user_presence", { username, status: "online" })` to visually update remote Astro client views.
  const session = (socket.request as any).session;
  const userId = session?.userId || socket.handshake.auth?.userId;
  const username = session?.username || socket.handshake.auth?.username;

  // Validate the presence of essential identity parameters; if missing, terminate the connection immediately to prevent unauthorized access.
  if (!userId || !username) {
    console.warn(
      `[Socket Warning] Connection rejected: Missing identity parameters.`,
    );
    socket.disconnect(true);
    return;
  }

  // Bind user identity to the socket instance for future reference in event handlers
  socket.data.userId = userId;
  socket.data.username = username;

  console.log(`[Socket Connected] User "${username}" linked.`);

  // Update user status in memory
  updateUserStatus(username, "online");

  // Broadcast presence update to all other clients
  socket.broadcast.emit(SOCKET_EVENTS.USER_PRESENCE, {
    userId: socket.data.userId,
    username: socket.data.username,
    status: "online",
  });
};

/**
 * @function handleJoinChat
 * @param {Socket} socket - The client socket instance initiating the room connection
 * @param {Server} io - The global Socket.io server instance
 * @param {Object} payload - Event payload parameters
 * @param {string} payload.chatId - Unique chat identification room token
 * @returns {void}
 * @description Validates room allocation requests, anchors the socket context down onto channels, and forces historical logs delivery.
 */
export const handleJoinChat = (
  socket: Socket,
  io: Server,
  payload: { chatId: string },
): void => {
  //  1. Extract `chatId` from payload and validate target room existence 
  const { chatId } = payload;

  const chat = getChatbyId(chatId);
  if (!chat) {
    console.error(`[Socket Error] Chat room ${chatId} not found.`);
    return;
  }

  // 2. Force current socket execution instance context to enter the room block
  socket.join(chatId);
  console.log(`[Socket Joined] User ${socket.data.username} joined room: ${chatId}`);

  // 3. Retrieve historical messaging datasets
  const messages = getMessagesForChat(chatId);

  // 4. Dispatch history array packet exclusively backwards to the caller 
  socket.emit(SOCKET_EVENTS.MESSAGE_HISTORY, messages);
};

/**
 * @function handleLeaveChat
 * @param {Socket} socket - The client socket instance executing the departure intent
 * @param {Server} io - The global Socket.io server instance
 * @param {Object} payload - Event payload parameters
 * @param {string} payload.chatId - Unique chat identification room token
 * @returns {void}
 * @description Tears down the socket mapping loop from active specific channel rooms to isolate communication updates.
 */
export const handleLeaveChat = (
  socket: Socket,
  io: Server,
  payload: { chatId: string },
): void => {
  // 1. Extract `chatId` from payload parameters.
  const { chatId } = payload;

  if (!chatId) return;

  // 2. Revoke room subscription channels by invoking `socket.leave(chatId)`.
  socket.leave(chatId);
  console.log(`[Socket Left] User ${socket.data.username} left room: ${chatId}`);
};

/**
 * @function handleSendMessage
 * @param {Socket} socket - The source sender client socket instance context
 * @param {Server} io - The global Socket.io server instance
 * @param {Object} payload - Event payload parameters
 * @param {string} payload.chatId - Destination target conversation channel identifier
 * @param {string} payload.text - Raw textual string contents
 * @returns {void}
 * @description Processes incoming text messages, updates memory history models, and mirrors data packages globally to target channels.
 */
export const handleSendMessage = (
  socket: Socket,
  io: Server,
  payload: { chatId: string; text: string },
): void => {
  // 1. Extract `chatId` and `text` from the payload
  const { chatId, text } = payload;

  // 2. Capture authenticated sender details from the socket context
  const senderId = socket.data.userId;

  if (!senderId || !text) {
     console.error(`[Socket Error] Missing senderId or text for message.`);
     return;
  }

  // 3. Commit text to memory via Model
  const newMessage = addMessageToChat(chatId, senderId, text);

  // 4. Disseminate message downstream across all room connections
  io.to(chatId).emit(SOCKET_EVENTS.NEW_MESSAGE, newMessage);
  
  console.log(`[Socket Message] ${socket.data.username} sent a message to ${chatId}`);
};
/**
 * @function handleTyping
 * @param {Socket} socket - The client socket instance modifying typing states
 * @param {Server} io - The global Socket.io server instance
 * @param {Object} payload - Event payload parameters
 * @param {string} payload.chatId - Active chat room selection tracking token
 * @param {boolean} payload.isTyping - Status flag representing composition changes
 * @returns {void}
 * @description Forwards visual user typing state markers back onto alternative channel room peers for client display synchronization.
 */
export const handleTyping = (
  socket: Socket,
  io: Server,
  payload: { chatId: string; isTyping: boolean },
): void => {
  // 1. Extract structural properties `chatId` and `isTyping` from the transaction payload.
  const { chatId, isTyping } = payload;

  if (!chatId) return;

  // 2. Relay typing state broadcast safely to neighboring participants.
  // Using `socket.to(chatId)` ensures the sender does NOT receive their own typing event.
  socket.to(chatId).emit(SOCKET_EVENTS.USER_TYPING, { 
    chatId, 
    username: socket.data.username, 
    isTyping 
  });
};

/**
 * @function handleSocketDisconnet
 * @param {Socket} socket - The client socket instance going through connection drop cycles
 * @param {Server} io - The global Socket.io server instance
 * @returns {void}
 * @description Handles graceful connection breakdowns, reverses network session indices to offline status flags, and warns active system instances.
 */
export const handleSocketDisconnect = (socket: Socket, io: Server): void => {
  const username = socket.data.username;

  if (username) {
    updateUserStatus(username, "offline");

    io.emit("user_presence", {
      userId: socket.data.userId,
      username: username,
      status: "offline",
    });
  }
};
