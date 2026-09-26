import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { UserModel } from '../modules/user/user.model';

if (!config.jwt_secret) throw new Error('JWT_SECRET is not defined.');
const JWT_SECRET = config.jwt_secret;

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    const token = req.cookies?.accessToken ?? bearer;
    if (typeof token !== 'string') {
      res.status(401).json({ success: false, message: 'Login required.' });
      return;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded.sub !== 'string')
      throw new Error('Invalid token subject.');
    const user = await UserModel.findOne({
      _id: decoded.sub,
      role: 'admin',
    }).select('userName role');
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: 'Admin account unavailable.' });
      return;
    }
    req.user = {
      id: user._id.toString(),
      userName: user.userName,
      role: user.role,
    };
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token.' });
  }
};

export default authMiddleware;
