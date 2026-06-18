import express from "express";

import { findAllUsers, findUserbyName } from "../model/User.ts";

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
  // 1. Extract current user's userId from the active session.
  const currentUserId = req.session?.userId;
  // 2. Fetch all registered users from the data layer using `findAllUsers()`.
  const allUsers = await findAllUsers();
  // 3. Filter the array to exclude the current logged-in user so they do not see themselves in the contacts list.
  const filteredUsers = allUsers.filter((user) => user.id !== currentUserId);
  // 4. Map through the filtered users to omit sensitive data fields like `passwordHash`.
  const safeUsers = filteredUsers.map(({ id, username, email, status }) => ({
    id,
    username,
    email,
    status,
  }));
  // 5. Return the safe list of contacts in JSON format with a 200 OK status.
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
