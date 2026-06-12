import { Server, Socket } from "socket.io";
import { updateUserStatus } from "../model/User.ts";
import { addMessageToChat, getMessagesForChat, getChatbyId } from "../model/Chat.ts";
import * as ChatController from "../controller/ChatController.ts";

export const SOCKET_EVENTS = {
  JOIN_CHAT: "join_chat",
  SEND_MESSAGE: "send_message",
  TYPING: "typing",
  LEAVE_CHAT: "leave_chat",
} as const;

/**
 * @function registerChatSockets
 * @param {Server} io - The detached Socket.io server instance bound to the HTTP server
 * @returns {void}
 * @description Main orchestrator for real-time capabilities. Configures global connection listener, hooks up authentication validation, and dispatches conversation-specific messaging events.
 */
export function registerChatSockets(io: Server) {
  // TODO: 1. Configure the global connection event listener using `io.on("connection", (socket: Socket) => { ... })`.
  io.on("connection", (socket: Socket) => {
    
    // IDENTITY INITIALIZATION & HANDSHAKE
    ChatController.handleSocketConnect(socket, io);

    // =========================================================================
    // CONVERSATION MANAGEMENT EVENTS
    // =========================================================================

    // USER JOINS A CHAT ROOM
    socket.on(SOCKET_EVENTS.JOIN_CHAT, (payload: { chatId: string }) => {
      ChatController.handleJoinChat(socket, io, payload);
    });
    
    // USER LEAVES A CHAT ROOM
    socket.on(SOCKET_EVENTS.LEAVE_CHAT, (payload: { chatId: string }) => {
      ChatController.handleLeaveChat(socket, io, payload);
    });

    // =========================================================================
    // MESSAGING & INTERACTION EVENTS
    // =========================================================================

    // USER SENDS A MESSAGE TO A CHAT ROOM
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, (payload: { chatId: string, text: string }) => {
      ChatController.handleSendMessage(socket, io, payload);
    });

    // USER TYPING INDICATOR UPDATE
    socket.on(SOCKET_EVENTS.TYPING, (payload: { chatId: string, isTyping: boolean }) => {
      ChatController.handleTyping(socket, io, payload);
    });

    // =========================================================================
    // DISCONNECT LIFECYCLE EVENT
    // =========================================================================

    socket.on("disconnect", () => {
      ChatController.handleSocketDisconnect(socket, io);
    });
  });
}