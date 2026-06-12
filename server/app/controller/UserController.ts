import express from "express";

import { findAllUsers } from "../model/User.ts";

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
  // TODO: 1. Extract current user's userId from the active session.
  // TODO: 2. Check if the userId exists; if not, return a 401 Unauthorized status with an error message.
  // TODO: 3. Fetch all registered users from the data layer using `findAllUsers()`.
  // TODO: 4. Filter the array to exclude the current logged-in user so they do not see themselves in the contacts list.
  // TODO: 5. Map through the filtered users to omit sensitive data fields like `passwordHash`.
  // TODO: 6. Return the safe list of contacts in JSON format with a 200 OK status.
};
