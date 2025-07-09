// src/app/types.ts

export interface IMarcaVehiculo {
  _id: string;
  nombre_marca: string;
}

export interface IColoresDatos {
  _id: string;
  nombre_color: string;
}

export type ClienteTipo = 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno';

export interface ICliente {
  _id: string;
  cedula: string;
  rnc?: string;
  nombre: string;
  numero_telefono: string;
  correo: string;
  id_barrio?: string;
  tipo_cliente: ClienteTipo;
}

export interface IProvincia {
  _id: string;
  nombre_provincia: string;
}

export interface IMunicipio {
  _id: string;
  nombre_municipio: string;
  id_provincia: string;
}

export interface ISector {
  _id: string;
  nombre_sector: string;
  id_municipio: string;
}

export interface IDistrito {
  _id: string;
  nombre_distrito: string;
  id_sector: string;
}

export interface IBarrio {
  _id: string;
  nombre_barrio: string;
  id_distrito: string;
}

export interface IModelosDatos {
  _id: string;
  nombre_modelo: string;
  id_marca: string;
}

export interface IVehiculoDatos {
  _id: string;
  chasis: string;

  id_cliente: string | ICliente;
  id_modelo:  string | IModelosDatos;
  id_color:   string | IColoresDatos;
  anio: number;
  activo?: boolean;
}

export interface IReciboVehiculo {
  _id: string;
  id_recepcion: string | IRecepcionVehiculo;
  observaciones?: string;
}
export interface IRecepcionVehiculo {
  _id: string;
  id_empleadoInformacion: string | IEmpleadoInformacion;
  id_vehiculo: string | IVehiculoDatos;
  comentario?: string;
  fecha: string; 
  problema_reportado?: string;
}
export interface ITipoEmpleado {
  _id: string;
  nombre_tipo_empleado: 'Empleado Asalariado' | 'Empleado por Trabajo';
}

export interface IEmpleadoInformacion {
  _id: string;
  id_cliente?: string | ICliente;
  id_tipo_empleado: string | ITipoEmpleado;
  nombre: string;
  telefono: string;
  correo: string;
}
export type Role = 'administrador' | 'empleado';

export interface IUsuario {
  _id: string;
  username: string;
  password?: string;
  role: Role;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
