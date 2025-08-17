
import { Request, Response, NextFunction } from 'express';


export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user;
  if (!user || user.role !== 'administrador') {
    res.status(403).json({
      message: 'Forbidden: sólo administrador puede ejecutar esta acción'
    });
    return;
  }
  next();
};
