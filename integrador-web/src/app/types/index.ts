// types.ts

export interface IMarcaVehiculo {
  _id: string
  nombre_marca: string
}

export interface IColoresDatos {
  _id: string
  nombre_color: string
}

export type ClienteTipo = 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno'

export interface ICliente {
  _id: string
  cedula: string
  rnc?: string
  nombre: string
  numero_telefono: string
  correo: string
  id_barrio?: string
  tipo_cliente: ClienteTipo
}

export interface IProvincia {
  _id: string
  nombre_provincia: string
}

export interface IMunicipio {
  _id: string
  nombre_municipio: string
  id_provincia: string
}

export interface ISector {
  _id: string
  nombre_sector: string
  id_municipio: string
}

export interface IDistrito {
  _id: string
  nombre_distrito: string
  id_sector: string
}

export interface IBarrio {
  _id: string
  nombre_barrio: string
  id_distrito: string
}

export interface IModelosDatos {
  _id: string
  nombre_modelo: string
  id_marca: string
}

export interface IVehiculoDatos {
  _id: string
  chasis: string
  id_cliente: string
  id_modelo: string
  id_color: string
  activo?: boolean
}

export type Role = 'administrador' | 'empleado'

export interface IUsuario {
  _id: string
  username: string
  password?: string
  role: Role
  activo: boolean
  createdAt?: string
  updatedAt?: string
}
