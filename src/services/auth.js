import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';

export const registerUser = async (user) => {
  const maybeUser = await UsersCollection.findOne({ email: user.email });

  if (maybeUser !== null) throw createHttpError(409, 'Email in use');

  user.password = await bcrypt.hash(user.password, 10);

  return await UsersCollection.create(user);
};
