import { io, Socket } from "socket.io-client";

export const SOCKET_EVENTS = {
  JOIN_CHAT: "join_chat",
  SEND_MESSAGE: "send_message",
  TYPING: "typing",
  LEAVE_CHAT: "leave_chat",
  MESSAGE_HISTORY: "message_history",
  NEW_MESSAGE: "new_message",
  USER_PRESENCE: "user_presence",
  USER_TYPING: "user_typing",
} as const;

let socket: Socket | null = null;

/**
 * @function initializeSocket
 * @param {string} serverUrl - The base URL of the backend Express server
 * @returns {Socket | null} The singleton Socket.io client instance, or null if executed server-side
 * @description Initializes a secure, single-instance WebSocket tunnel. Ensures credentials/cookies are forwarded and prevents connection leaks.
 */
export function initializeSocket(serverUrl: string): Socket | null {
  // 1. Lifecycle Guard: Check if execution environment is server-side (`typeof window === 'undefined'`); if so, return null.
  // 2. Singleton Check: If a active `socket` instance already exists in memory, return it immediately to prevent duplicate tunnels.
  // 3. Connection Setup: Instantiate connection using `io(serverUrl, { withCredentials: true })` to allow session cookie synchronization.
  // 4. Registry: Store the newly built connection engine inside the local `socket` variable and return it.
  if (typeof window === "undefined") return null;
  
  if (!socket) {
    socket = io(serverUrl, {
      withCredentials: true,
    });
  }
  
  return socket;
}

/**
 * @function disconnectSocket
 * @returns {void}
 * @description Safely terminates the active WebSocket connection and flushes the singleton reference pipeline.
 */
export function disconnectSocket(): void {
  // 1. Inspection: Check if the local `socket` variable holds an active connection instance.
  // 2. Teardown: Invoke `.disconnect()` on the instance engine to gracefully sever the connection.
  // 3. Cleanup: Reset the local pointer variable to `null` to ensure fresh subsequent initialization pipelines.
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}