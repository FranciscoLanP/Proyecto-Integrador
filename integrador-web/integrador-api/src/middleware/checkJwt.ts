import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  sub: string
  role: 'administrador'|'empleado'
  iat: number
  exp: number
}

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    ;(req as any).user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
}
