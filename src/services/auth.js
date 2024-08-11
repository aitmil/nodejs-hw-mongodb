import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';
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

  const newSession = createSession();

  console.log('New session:', newSession);

  console.log('ACCESS_TOKEN_TTL:', ACCESS_TOKEN_TTL);
  console.log('REFRESH_TOKEN_TTL:', REFRESH_TOKEN_TTL);

  await SessionsCollection.deleteOne({ userId: maybeUser._id });

  const session = await SessionsCollection.create({
    userId: maybeUser._id,
    ...newSession,
  });

  console.log('Created session:', session);
  return session;
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (session === null) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, 'Session token is expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = (sessionId) => {
  SessionsCollection.deleteOne({ _id: sessionId });
};

// -----------------------------------------------

function createSession() {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
  };
}
