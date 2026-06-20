import express from "express";
import { findAllUsers, findUserbyName, findUserById, updateUserData } from "../model/User.ts";
import { hashPassword, comparePassword } from "../utils/Crypto.ts";

/**
 * @function getAllUsers
 * @param {express.Request} req - The Express request object containing the user session
 * @param {express.Response} res - The Express response object used to send back the list of contacts
 * @returns {Promise<void>} Sends a JSON response with safe user profiles or an error message
 * @description Fetches all registered users from memory, excludes the current logged-in user, strips sensitive data, and returns the curated contact list.
 */
export const getAllUsers = async (
  req: express.Request,
  res: express.Response,
) => {
  const currentUserId = req.session?.userId;
  const allUsers = await findAllUsers();
  const filteredUsers = allUsers.filter((user) => user.id !== currentUserId);
  const safeUsers = filteredUsers.map(({ id, username, email, status }) => ({
    id,
    username,
    email,
    status,
  }));
  res.status(200).json(safeUsers);
};

export const getUser = async (req: express.Request, res: express.Response) => {
  try {
    const { name } = req.params as { name: string };
    const user = findUserbyName(name);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    if (user.id === req.session?.userId) {
      res.status(403).json({ error: "Same profile as logged." });
      return;
    }

    const { passwordHash, ...safeUserData } = user;
    res.status(200).json(safeUserData);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function updateUser
 * @param {express.Request} req - The Express request object containing update fields
 * @param {express.Response} res - The Express response object
 * @returns {Promise<void>} Sends a success message or an error status
 * @description Updates the user profile fields like username, email, or password after validation.
 */
export const updateUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { username, email, currentPassword, newPassword } = req.body;
    const user = findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required to update profile", field: "currentPassword" });
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password incorrect", field: "currentPassword" });
    }

    if (username && username.length > 15) {
      return res.status(400).json({ error: "Username must be 15 characters or less", field: "username" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format", field: "email" });
    }

    let passwordHash = user.passwordHash;
    if (newPassword) {
      const passRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,})/;
      if (!passRegex.test(newPassword)) {
        return res.status(400).json({ error: "New password does not meet requirements", field: "newPassword" });
      }
      passwordHash = await hashPassword(newPassword);
    }

    updateUserData(userId, {
      username: username || user.username,
      email: email || user.email,
      passwordHash: passwordHash,
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @function getMyProfile
 * @param {express.Request} req - The Express request object containing the user session
 * @param {express.Response} res - The Express response object
 * @returns {Promise<void>} Sends a JSON response with the current user's profile or an error message
 * @description Retrieves the authenticated user's profile information from memory, excluding sensitive data like passwordHash.
 */
export const getMyProfile = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const user = findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const { passwordHash, ...safeUserData } = user;
    return res.status(200).json(safeUserData);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};