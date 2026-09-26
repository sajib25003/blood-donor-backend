declare global {
  namespace Express {
    interface Request {
      user?: { id: string; userName: string; role: 'admin' };
    }
  }
}
export {};
