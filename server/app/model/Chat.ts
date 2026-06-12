export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  sentAt: Date;
};

export type Chat = {
  id: string;
  name: string | null; // null for direct messages
  isGroupChat: boolean;
  participantIds: string[]; // list of user IDs
};
const chats: Chat[] = [];
const messages: Record<string, ChatMessage[]> = {}; // chatId -> messages

/**
 * @function createChat
 * @param {string | null} name - The name of the group chat, or null for direct messages
 * @param {boolean} isGroupChat - Flag indicating if the conversation is a group chat
 * @param {string[]} participantIds - Array of user IDs participating in this chat
 * @returns {Chat} The newly created chat room object
 * @description Creates a new chat room (either direct or group) with a unique ID and initializes its empty message history in memory.
 */
export const createChat = (
  name: string | null,
  isGroupChat: boolean,
  participantIds: string[],
): Chat => {
  const newChat: Chat = {
    id: crypto.randomUUID(),
    name,
    isGroupChat,
    participantIds,
  };
  chats.push(newChat);
  messages[newChat.id] = [];
  return newChat;
};

/**
 * @function getChatsByUserId
 * @param {string} userId - The unique ID of the user
 * @returns {Chat[]} An array of chats where the user is a participant
 * @description Filters and returns all direct messages and group chats that include the specified user ID.
 */
export const getChatsbyUserId = (userId: string): Chat[] => {
  return chats.filter((chat) => chat.participantIds.includes(userId));
};

/**
 * @function getChatById
 * @param {string} chatId - The unique ID of the chat room
 * @returns {Chat | undefined} The chat object if found, otherwise undefined
 * @description Searches the in-memory array for a specific chat room matching the provided chat ID.
 */
export const getChatbyId = (chatId: string): Chat | undefined => {
  return chats.find((chat) => chat.id === chatId);
};

/**
 * @function addMessageToChat
 * @param {string} chatId - The ID of the chat room where the message belongs
 * @param {string} senderId - The ID of the user sending the message
 * @param {string} text - The actual message content
 * @returns {ChatMessage} The newly created message object with a timestamp
 * @description Appends a new message to the chat room's history record in memory. Initializes the array if it does not exist.
 */
export const addMessageToChat = (
  chatId: string,
  senderId: string,
  text: string,
): ChatMessage => {
  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    chatId,
    senderId,
    text,
    sentAt: new Date(),
  };
  if (!messages[chatId]) {
    messages[chatId] = [];
  }
  messages[chatId].push(newMessage);
  return newMessage;
};

/**
 * @function getMessagesForChat
 * @param {string} chatId - The unique ID of the chat room
 * @returns {ChatMessage[]} An array of messages belonging to the chat room, or an empty array if none exist
 * @description Retrieves the full conversation history from memory for a specific chat room ID.
 */
export function getMessagesForChat(chatId: string): ChatMessage[] {
  return messages[chatId] || [];
}
