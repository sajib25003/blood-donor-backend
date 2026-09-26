import bcrypt from 'bcrypt';
import { RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { AuthServices } from './auth.service';

if (!config.jwt_secret) throw new Error('JWT_SECRET is not defined.');
const JWT_SECRET = config.jwt_secret;
const isProduction = config.node_env === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};
const clearAuthCookie = (res: Response) => res.clearCookie('accessToken', cookieOptions);

const loginUser: RequestHandler = async (req, res) => {
  try {
    const { userName, password } = req.body ?? {};
    if (typeof userName !== 'string' || !userName.trim() || typeof password !== 'string' || !password) {
      res.status(400).json({ success: false, message: 'userName and password are required.' });
      return;
    }
    const user = await AuthServices.getUserByUserNameFromDB(userName);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }
    const token = jwt.sign({ role: user.role }, JWT_SECRET, {
      subject: user._id.toString(), expiresIn: '1d',
    });
    res.cookie('accessToken', token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
      .json({ success: true, message: 'Login successful.', data: {
        user: { id: user._id.toString(), userName: user.userName, role: user.role },
      } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const user = req.user?.id && await AuthServices.getCurrentUserFromDB(req.user.id);
    if (!user) {
      clearAuthCookie(res);
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }
    res.json({ success: true, data: { user: {
      id: user._id.toString(), userName: user.userName, role: user.role,
    } } });
  } catch (error) {
    console.error('Current user error:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin.' });
  }
};

const logoutUser: RequestHandler = (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logout successful.' });
};

export const AuthController = { loginUser, getCurrentUser, logoutUser };
