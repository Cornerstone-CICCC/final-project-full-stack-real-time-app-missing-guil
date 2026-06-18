import express from "express";

import {
  getUserChats,
  createChats,
  joinGroupChat
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
 * @route {POST} /join - Join an existing chat (not implemented yet)
 */
router.post("/join", authMiddleware,  joinGroupChat);

export default router;
