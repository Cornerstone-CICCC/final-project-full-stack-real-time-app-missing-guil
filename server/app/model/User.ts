export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  status: "online" | "offline";
};

const users: User[] = [];

/**
 * @function createuser
 * @param {Omit<User, "id" | "status">} userData - The user data excluding id and status
 * @returns {User} The newly created user with id and default status
 * @description Creates a new user with a unique ID and sets the default status to "offline". The password should be hashed before calling this function.
 */
export const createuser = (userData: Omit<User, "id" | "status">): User => {
  const newUser: User = {
    id: crypto.randomUUID(),
    ...userData,
    status: "offline",
  };

  users.push(newUser);
  return newUser;
};

/**
 * @function findUserByName
 * @param {string} username - The username to search for
 * @returns {User | undefined} The user object if found, otherwise undefined
 * @description Searches the in-memory array for a user matching the provided username.
 */
export const findUserbyName = (username: string): User | undefined => {
  return users.find((user) => user.username === username);
};

/**
 * @function findUserByEmail
 * @param {string} email - The email address to search for
 * @returns {User | undefined} The user object if found, otherwise undefined
 * @description Searches the in-memory array for a user matching the provided email address.
 */
export const findUserbyEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

/**
 * @function findUserById
 * @param {string} userId - The unique ID of the user to search for
 * @returns {User | undefined} The user object if found, otherwise undefined
 * @description Searches the in-memory array for a user matching the provided unique user ID
 */
export const findUserById = (userId: string): User | undefined => {
  return users.find((user) => user.id === userId);
};

/**
 * @function updateUserStatus
 * @param {string} username - The username of the user to update
 * @param {"online" | "offline"} status - The new presence status to set
 * @returns {User | undefined} The updated user object if found, otherwise undefined
 * @description Updates the online/offline status of a user in memory. Useful for auth routes and socket connection life cycles.
 */
export const updateUserStatus = (
  userId: string,
  status: "online" | "offline",
): User | undefined => {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    return user;
  }
};

/**
 * @function findAllUsers
 * @returns {User[]} An array of all registered users
 * @description Retrieves all users stored in the server memory. Useful for fetching the global contacts list.
 */
export const findAllUsers = (): User[] => {
  return users;
};
