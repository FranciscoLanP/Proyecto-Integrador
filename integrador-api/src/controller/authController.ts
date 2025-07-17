import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { sign, Secret, SignOptions } from 'jsonwebtoken';
import { Usuario } from '../models/usuarios';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password required' });
    }

    const user = await Usuario.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    const secretEnv = process.env.JWT_SECRET;
    if (!secretEnv) throw new Error('JWT_SECRET no está definido');
    const secret: Secret = secretEnv;

    const expiresInEnv = process.env.JWT_EXPIRES_IN ?? '1h';
    const expiresIn = expiresInEnv as SignOptions['expiresIn'];

    const options: SignOptions = { expiresIn };

    const payload = {
      sub: user.id,
      role: user.role
    };

    const token = sign(payload, secret, options);

    return res.status(200).json({
      token,
      usuario: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
