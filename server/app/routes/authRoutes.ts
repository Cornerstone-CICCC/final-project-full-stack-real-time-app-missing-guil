import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controller/AuthController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = express.Router();

/**
 * @route {POST} /auth/register
 */
router.post("/register", registerUser);

/**
 * @route {POST} /auth/login
 */
router.post("/login", loginUser);

/**
 * @route {GET} /auth/logout
 */
router.post("/logout", authMiddleware, logoutUser);

export default router;
