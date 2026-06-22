import express from "express";

import {
  getUserChats,
  createChats,
  joinGroupChat,
  leaveGroupChat
} from "../controller/ChatController.ts";

import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {GET} /chat/ - Get all chats for the authenticated user
 */
router.get("/", authMiddleware,  getUserChats);
/**
 * @route {POST} /chat/create - Create a new chat
 */
router.post("/create", authMiddleware,  createChats); 
/**
 * @route {POST} /join - Join an existing chat 
 */
router.post("/join", authMiddleware,  joinGroupChat);

/**
 * @route {POST} /leave - Leave a chat
 */
router.post("/leave", authMiddleware,  leaveGroupChat);

export default router;
