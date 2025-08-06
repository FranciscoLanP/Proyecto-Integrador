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

    const hasSecretQuestion = !!(user.secretQuestion && user.secretAnswer);

    return res.status(200).json({
      token,
      usuario: {
        username: user.username,
        role: user.role
      },
      hasSecretQuestion
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const { username, password, currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Contraseña actual requerida' });
    }

    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    // Preparar campos a actualizar
    const updateFields: any = {};

    if (username && username !== user.username) {
      // Verificar que el nuevo username no exista
      const existingUser = await Usuario.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
      }
      updateFields.username = username;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }
      // El middleware pre('save') se encargará del hash
      updateFields.password = password;
    }

    // Actualizar usuario (usando save() para activar middlewares)
    Object.assign(user, updateFields);
    const updatedUser = await user.save();

    if (!updatedUser) {
      return res.status(404).json({ message: 'Error al actualizar usuario' });
    }

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      usuario: {
        username: updatedUser.username,
        role: updatedUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getSecretQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Nombre de usuario requerido' });
    }

    const user = await Usuario.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      secretQuestion: user.secretQuestion
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { username, secretAnswer, newPassword } = req.body;

    if (!username || !secretAnswer || !newPassword) {
      return res.status(400).json({
        message: 'Usuario, respuesta secreta y nueva contraseña son requeridos'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await Usuario.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar respuesta secreta
    const isSecretAnswerValid = await user.compareSecretAnswer(secretAnswer);
    if (!isSecretAnswerValid) {
      return res.status(400).json({ message: 'Respuesta secreta incorrecta' });
    }

    // Actualizar contraseña (el middleware pre('save') se encargará del hash)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: 'Contraseña restablecida correctamente'
    });
  } catch (err) {
    next(err);
  }
};

export const setupSecretQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const userId = (req as any).user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const { secretQuestion, secretAnswer } = req.body;

    if (!secretQuestion || !secretAnswer) {
      return res.status(400).json({
        message: 'Pregunta secreta y respuesta son requeridas'
      });
    }

    const validQuestions = [
      '¿Cuál es el nombre de tu primera mascota?',
      '¿En qué ciudad naciste?',
      '¿Cuál es el nombre de tu escuela primaria?',
      '¿Cuál es tu comida favorita?',
      '¿Cuál es el nombre de tu mejor amigo de la infancia?'
    ];

    if (!validQuestions.includes(secretQuestion)) {
      return res.status(400).json({ message: 'Pregunta secreta no válida' });
    }

    if (secretAnswer.trim().length < 2) {
      return res.status(400).json({
        message: 'La respuesta debe tener al menos 2 caracteres'
      });
    }

    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar pregunta y respuesta secreta
    user.secretQuestion = secretQuestion;
    user.secretAnswer = secretAnswer; // Se hasheará automáticamente en el pre-save
    await user.save();

    return res.status(200).json({
      message: 'Pregunta secreta configurada correctamente',
      hasSecretQuestion: true
    });
  } catch (err) {
    next(err);
  }
};