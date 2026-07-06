import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const client = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

export const verifyGoogleIdToken = async (idToken) => {
  if (!client) {
    throw new ApiError(500, 'Google auth is not configured');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new ApiError(400, 'Google account email not available');
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || null,
    googleId: payload.sub,
  };
};
