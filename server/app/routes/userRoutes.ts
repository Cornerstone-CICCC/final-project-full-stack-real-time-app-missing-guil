import express from "express";

import {
  getAllUsers,
  getUser,
  updateUser,
  getMyProfile
} from "../controller/UserController.ts";

import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {GET} /users/ - Get all users (for searching and adding to chats)
 */
router.get("/", authMiddleware, getAllUsers);

/**
 * @route {GET} /users/me - Get the current user's profile
 */
router.get("/me", authMiddleware, getMyProfile);

/**
 * @route {GET} /users/:name - Get a specific user by name
 */
router.get("/:name", authMiddleware, getUser);

/**
 * @route {PATCH} /users/profile - Update the current user's profile
 */
router.patch("/profile", authMiddleware, updateUser);

export default router;