import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';
import { now } from 'mongoose';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../constants/index.js';

export const registerUser = async (user) => {
  const maybeUser = await UsersCollection.findOne({ email: user.email });

  if (maybeUser !== null) throw createHttpError(409, 'Email in use');

  user.password = await bcrypt.hash(user.password, 10);

  return await UsersCollection.create(user);
};

export const loginUser = async (email, password) => {
  const maybeUser = await UsersCollection.findOne({ email });

  if (maybeUser === null) throw createHttpError(404, 'User not found');

  const isMatch = await bcrypt.compare(password, maybeUser.password);

  if (isMatch === false) throw createHttpError(401, 'Unauthorized access');

  await SessionsCollection.deleteOne({ userId: maybeUser._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: maybeUser._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date(now) + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(Date(now) + REFRESH_TOKEN_TTL),
  });
};
