import path from 'node:path';
import fs from 'node:fs/promises';

import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  SMTP,
  TEMPLATE_DIR,
} from '../constants/index.js';
import { sendEmail } from '../utils/sendEmail.js';
import { env } from '../utils/env.js';

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
  return SessionsCollection.deleteOne({ _id: sessionId });
};

export const sendResetEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (user === null) {
    createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    env('JWT_SECRET'),
    { expiresIn: '15m' },
  );

  const templateFile = path.join(TEMPLATE_DIR, 'reset-password-email.html');
  const templateSource = await fs.readFile(templateFile, { encoding: 'utf-8' });
  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
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
