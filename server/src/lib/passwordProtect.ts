import { NextFunction, Request, Response } from 'express';
import { PASSWORD } from '../config/password';

const passwordProtect = (req: Request, res: Response, next: NextFunction) => {
  const auth = { login: 'admin', password: PASSWORD };
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64')
    .toString()
    .split(':');

  if (
    !login ||
    !password ||
    login !== auth.login ||
    password !== auth.password
  ) {
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
    return;
  }
  next();
};

export default passwordProtect;
