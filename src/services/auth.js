import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';

export const registerUser = async (user) => {
  const maybeUser = await UsersCollection.findOne({ email: user.email });

  if (maybeUser !== null) throw createHttpError(409, 'Email in use');

  user.password = await bcrypt.hash(user.password, 10);

  return await UsersCollection.create(user);
};

export const loginUser = async (email, password) => {
  const maybeUser = await UsersCollection.findOne({ email });

  if (maybeUser === null) throw createHttpError(404, 'User not found');

  const isMatch = bcrypt.compare(password, maybeUser.password);

  if (isMatch === false) throw createHttpError(401, 'Unauthorized access');
};
