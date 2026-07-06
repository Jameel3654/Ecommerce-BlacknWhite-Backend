import { Order, User } from '../models/index.js';
import { verifyGoogleIdToken } from '../services/google-auth.service.js';
import { env } from '../config/env.js';
import { signAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';

const issueAuthResponse = (user, res, statusCode = 200) => {
  const token = signAccessToken({ id: user.id, role: user.role, email: user.email });
  const safeUser = user.toJSON();
  delete safeUser.passwordHash;

  res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
};

const adminEmails = () =>
  (env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: adminEmails().includes(email.toLowerCase()) ? 'admin' : 'user',
  });

  issueAuthResponse(user, res, 201);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !user.passwordHash || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  issueAuthResponse(user, res);
};

export const googleSignIn = async (req, res) => {
  const { idToken } = req.body;
  const googleProfile = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ where: { email: googleProfile.email } });

  if (!user) {
    user = await User.create({
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      avatar: googleProfile.avatar,
      role: adminEmails().includes(googleProfile.email.toLowerCase()) ? 'admin' : 'user',
    });
  } else if (!user.googleId || !user.avatar) {
    await user.update({
      googleId: user.googleId || googleProfile.googleId,
      avatar: user.avatar || googleProfile.avatar,
    });
  }

  issueAuthResponse(user, res);
};

export const listUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Order, attributes: ['id', 'totalAmount', 'status', 'createdAt'] }],
    order: [['createdAt', 'DESC']],
  });

  res.json({ success: true, users });
};
