import express from "express";

import {
  getAllUsers,
  getUser,
  updateUser
} from "../controller/UserController.ts";


import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {GET} /users/ - Get all users (for searching and adding to chats)
 */
router.get("/", authMiddleware, getAllUsers);

router.get("/:name", authMiddleware, getUser);

/**
 * @route {PATCH} /users/profile - Update the current user's profile
 */
router.patch("/profile", authMiddleware, updateUser);

export default router;
