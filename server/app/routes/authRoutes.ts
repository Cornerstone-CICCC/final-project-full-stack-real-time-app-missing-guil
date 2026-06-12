
import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controller/AuthController.ts";


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
router.get("/logout", logoutUser);

export default router;
