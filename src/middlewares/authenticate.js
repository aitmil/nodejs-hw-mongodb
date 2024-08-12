import createHttpError from 'http-errors';

import { UsersCollection } from '../models/user.js';
import { SessionsCollection } from '../models/session.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return next(createHttpError(401, 'Please provide Authorization header'));
  }

  const [bearer, accessToken] = authHeader.split(' ', 2);

  if (bearer !== 'Bearer' || !accessToken) {
    return next(createHttpError(401, 'Auth header should be type of Bearer'));
  }

  const session = await SessionsCollection.findOne({ accessToken });

  if (session === null) {
    console.log('Session not found for token:', accessToken);
    return next(createHttpError(401, 'Session not found'));
  }

  const accessTokenIsExpired =
    new Date() > new Date(session.accessTokenValidUntil);

  if (accessTokenIsExpired) {
    console.log('Access token expired for session:', session._id);
    return next(createHttpError(401, 'Access token expired'));
  }

  const user = await UsersCollection.findOne({ _id: session.userId });

  if (user === null) {
    console.log('User not found for session:', session._id);
    return next(createHttpError(401, 'Session not found'));
  }

  req.user = user;

  console.log('Authenticated user:', req.user);

  if (!req.user || !req.user._id) {
    console.log('User ID is undefined:', req.user);
    return next(createHttpError(401, 'Invalid user session'));
  }

  next();
};
