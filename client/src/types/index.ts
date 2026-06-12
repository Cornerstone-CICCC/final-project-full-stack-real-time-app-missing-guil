/**
 * @type UserStatus
 * @description - Represents the connection and tracking presence state of any system contact.
 */
export type UserStatus = "online" | "offline";

/**
 * @type User
 * @description - Baseline contract for user identity records inside the platform.
 */
export interface User {
  userId: string;
  username: string;
  status: UserStatus;
}

/**
 * @type ChatMessage
 * @description - Structure of a single live or historical chat message.
 */
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO date string representation
}

/**
 * @type ChatRoom
 * @description - Layout model for a conversation channel (Supports 1-on-1 private rooms or Group configurations).
 */
export interface ChatRoom {
  chatId: string;
  name: string;
  isGroup: boolean;
  participants: string[]; // Array of userIds
  lastMessage?: ChatMessage;
}

/**
 * @interface UserPresencePayload
 * @description - Payload structure for broadcasting user presence updates (e.g., online/offline status).
 */
export interface UserPresencePayload {
  userId: string;
  username: string;
  status: UserStatus;
}

/**
 * @interface UserTypingPayload
 * @description - Payload structure for broadcasting typing indicator updates within a chat room.
 */
export interface UserTypingPayload {
  chatId: string;
  user: string;
  isTyping: boolean;
}