import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
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
 * @route {GET} /auth/me
 */
router.get("/me", checkAuth);

/**
 * @route {POST} /auth/logout
 */
router.get("/logout", authMiddleware, logoutUser);

export default router;