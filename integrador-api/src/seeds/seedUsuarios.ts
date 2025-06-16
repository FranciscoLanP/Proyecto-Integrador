import { Usuarios, type IUsuarios } from '../models/usuarios'
import type { SeedContext } from './seedContext'

export const seedUsuarios = async (context: SeedContext): Promise<void> => {
  try {
    const usuariosData: Partial<IUsuarios>[] = [
      {
        nombre_usuario: 'admin',
        contrasena: 'admin123',
        id_cliente: context.cliente!._id,
        rol: 'Administrador',
        estado: 'Activo'
      }
    ]
    const [user] = await Usuarios.insertMany(usuariosData)
    console.log('Usuarios created:', user._id)
    context.usuarios = user as IUsuarios
  } catch (error) {
    console.error('Error seeding Usuarios:', error)
    throw error
  }
}
