import { RequestHandler } from 'express';
import { TUserRole } from '../modules/user/user.interface';

const authorizeRoles = (...roles: TUserRole[]): RequestHandler => (req, res, next) => {
  if (!req.user) { res.status(401).json({ success: false, message: 'Login required.' }); return; }
  if (!roles.includes(req.user.role)) { res.status(403).json({ success: false, message: 'Forbidden.' }); return; }
  next();
};

export default authorizeRoles;
