import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  sub: string
  role: 'administrador' | 'empleado'
  iat: number
  exp: number
}

export const checkJwt = (req: Request, res: Response, next: NextFunction): void => {
  // Permitir preflight requests de CORS
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      message: 'Token de autorización no proporcionado',
      code: 'NO_TOKEN'
    });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'Formato de token inválido. Use: Bearer <token>',
      code: 'INVALID_TOKEN_FORMAT'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    res.status(401).json({
      message: 'Token vacío o inválido',
      code: 'EMPTY_TOKEN'
    });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Verificar que el token no haya expirado (verificación adicional)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      res.status(401).json({
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    // Agregar información del usuario a la request
    (req as any).user = {
      id: payload.sub,
      role: payload.role,
      sub: payload.sub  // Mantener compatibilidad
    };

    next();
  } catch (error: any) {
    console.error('Error verificando JWT:', error.message);

    let message = 'Token inválido';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado';
      code = 'MALFORMED_TOKEN';
    }

    res.status(401).json({ message, code });
    return;
  }
};
