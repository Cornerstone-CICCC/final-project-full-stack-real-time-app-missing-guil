import express from "express";

import {
  getAllUsers,
  getUser
} from "../controller/UserController.ts";


import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {GET} /users/ - Get all users (for searching and adding to chats)
 */
router.get("/", authMiddleware, getAllUsers);

router.get("/:name", authMiddleware, getUser);

export default router;
