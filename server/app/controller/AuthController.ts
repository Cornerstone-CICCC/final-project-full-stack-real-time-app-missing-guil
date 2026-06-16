import express from "express";
import { hashPassword, comparePassword } from "../utils/Crypto.ts";
import {
  createuser,
  findUserbyName,
  findUserbyEmail,
  updateUserStatus,
} from "../model/User.ts";

/**
 * @function registerUser
 * @param {express.Request} req - The Express request object containing username, email, and raw password in the body
 * @param {express.Response} res - The Express response object used to return the newly created user profile
 * @returns {Promise<void>} Sends a JSON response with the safe user object or an error message
 * @description Validates the registration payload, checks for duplicates, hashes the password, and stores the user profile in memory.
 */
export const registerUser = async (
  req: express.Request,
  res: express.Response,
) => {
  // TODO: 1. Extract `username`, `email`, and `password` fields from `req.body`.
  const { username, email, password } = req.body;

  // TODO: 2. Validate that none of the three required fields are missing or empty (return 400 Bad Request if validation fails).
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // TODO: 3. Verify if the username or email is already taken using `findUserbyName` and `findUserbyEmail` (return 409 Conflict if a duplicate is found).
  if (findUserbyName(username) || findUserbyEmail(email)) {
    return res.status(409).json({ error: "Username or Email already exists" });
  }

  // TODO: 4. Hash the raw password asynchronously using `hashPassword(password)`.
  const passwordHash = await hashPassword(password);

  // TODO: 5. Persist the new user credentials by calling `createUser({ username, email, passwordHash })`.
  const newUser = createuser({ username, email, passwordHash });

  // TODO: 6. Return the newly created user object, omitting the `passwordHash` field, alongside a 201 Created status.
  const { passwordHash: _, ...userWithoutHash } = newUser;
  return res.status(201).json(userWithoutHash);
};

/**
 * @function loginUser
 * @param {express.Request} req - The Express request object containing username and raw password in the body
 * @param {express.Response} res - The Express response object used to acknowledge the session activation
 * @returns {Promise<void>} Sends a JSON confirmation message or an authentication error
 * @description Verifies user credentials against stored memory, updates presence status to online, and initializes the session store.
 */
export const loginUser = async (
  req: express.Request,
  res: express.Response,
) => {
  // TODO: 1. Extract `username` and `password` from `req.body`.
  const { email, password } = req.body;

  // TODO: 2. Validate that both fields are present and not empty strings (return 400 Bad Request if missing).
  if (!email || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // TODO: 3. Look up the user record by username using `findUserByName` or using `findUserbyEmail` (return 401 Unauthorized if the user does not exist).
  const user = findUserbyEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // TODO: 4. Compare the provided password with the stored hash using `comparePassword(password, user.passwordHash)` (return 401 Unauthorized if verification fails).
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // TODO: 5. Transition the user's presence state to online by executing `updateUserStatus(username, "online")`.
  updateUserStatus(user.id, "online");

  // TODO: 6. Populate the session store `req.session` with identifying data including `userId` and `username`.
  // @ts-ignore
  req.session.userId = user.id;
  // @ts-ignore
  req.session.username = user.username;

  // TODO: 7. Dispatch a success response in JSON format with a 200 OK status.
  return res.status(200).json({ message: "Login successful" });
};

/**
 * @function logoutUser
 * @param {express.Request} req - The Express request object containing the session to be cleared
 * @param {express.Response} res - The Express response object used to acknowledge session termination
 * @returns {Promise<void>} Sends a JSON message confirming the successful logout
 * @description Changes the logged-in user's presence status to offline in memory and clears the active session state.
 */
export const logoutUser = async (
  req: express.Request,
  res: express.Response,
) => {
  // TODO: 1. Retrieve the `username` saved inside the active session store.
  // @ts-ignore
  const username = req.session?.username;

  // TODO: 2. If the username is present, change their memory presence status to offline using `updateUserStatus(username, "offline")`.
  if (username) {
    const user = findUserbyName(username);
    if (user) {
      updateUserStatus(user.id, "offline");
    }
  }

  // TODO: 3. Destroy the active session state by setting `req.session = null`.
  // @ts-ignore
  req.session = null;

  // TODO: 4. Send back a success JSON message indicating the logout process was completed with a 200 OK status.
  return res.status(200).json({ message: "Logout successful" });
};