import { z } from 'zod'

export const clienteSchema = z.object({
  cedula: z
    .string()
    .regex(/^\d{3}-\d{7}-\d$/, 'Formato 000-0000000-0'),
  rnc: z
    .string()
    .regex(/^\d{3}-\d{6}$/, 'Formato 000-000000')
    .optional(),
  nombre: z.string().nonempty('Requerido'),
  numero_telefono: z
    .string()
    .regex(/^\(\d{3}\)-\d{3}-\d{4}$/, 'Formato (829)-123-4567'),
  correo: z.string().email('Email inválido'),
  ubicacion: z.object({
    provincia: z.string().nonempty('Requerido'),
    municipio: z.string().nonempty('Requerido'),
    sector: z.string().nonempty('Requerido'),
    distrito: z.string().nonempty('Requerido'),
    barrio: z.string().nonempty('Requerido')
  })
})

export type ClienteFormData = z.infer<typeof clienteSchema>
