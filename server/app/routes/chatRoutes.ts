import express from "express";

import {
  getUserChats,
  createGroupChat,
  joinGroupChat
} from "../controller/ChatController.ts";

import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {GET} /chat/ - Get all chats for the authenticated user
 */
router.get("/", authMiddleware,  getUserChats);
/**
 * @route {POST} /chat/group - Create a new group chat
 */
router.post("/group", authMiddleware,  createGroupChat); 
/**
 * @route {POST} /join - Join an existing chat (not implemented yet)
 */
router.post("/join", authMiddleware,  joinGroupChat);

export default router;
