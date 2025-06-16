import { Request, Response, NextFunction } from 'express'
import { Usuarios } from '../models/usuarios'

export const getAllUsuarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { search } = req.query as { search?: string }
        const filter = search
            ? {
                $or: [
                    { nombre_usuario: { $regex: search, $options: 'i' } },
                    { rol: { $regex: search, $options: 'i' } },
                    { estado: { $regex: search, $options: 'i' } },
                    { id_cliente: search }
                ]
            }
            : {}
        const items = await Usuarios.find(filter)
        res.status(200).json(items)
    } catch (error) {
        next(error)
    }
}

export const getPaginatedUsuarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt((req.query.page as string) ?? '1', 10)
        const limit = parseInt((req.query.limit as string) ?? '10', 10)
        const { search } = req.query as { search?: string }
        const filter = search
            ? {
                $or: [
                    { nombre_usuario: { $regex: search, $options: 'i' } },
                    { rol: { $regex: search, $options: 'i' } },
                    { estado: { $regex: search, $options: 'i' } },
                    { id_cliente: search }
                ]
            }
            : {}
        const totalCount = await Usuarios.countDocuments(filter)
        const data = await Usuarios.find(filter).skip((page - 1) * limit).limit(limit)
        const totalPages = Math.ceil(totalCount / limit)
        res.status(200).json({ data, page, totalPages, totalCount })
    } catch (error) {
        next(error)
    }
}

export const getUsuarioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await Usuarios.findById(req.params.id)
        if (!item) {
            res.status(404).json({ message: 'Usuario no encontrado' })
            return
        }
        res.status(200).json(item)
    } catch (error) {
        next(error)
    }
}

export const createUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nombre_usuario, contrasena, id_cliente, rol, estado } = req.body
        const newItem = new Usuarios({ nombre_usuario, contrasena, id_cliente, rol, estado })
        const saved = await newItem.save()
        res.status(201).json(saved)
    } catch (error) {
        next(error)
    }
}

export const updateUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updated = await Usuarios.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!updated) {
            res.status(404).json({ message: 'Usuario no encontrado' })
            return
        }
        res.status(200).json(updated)
    } catch (error) {
        next(error)
    }
}

export const deleteUsuario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deleted = await Usuarios.findByIdAndDelete(req.params.id)
        if (!deleted) {
            res.status(404).json({ message: 'Usuario no encontrado' })
            return
        }
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
}
