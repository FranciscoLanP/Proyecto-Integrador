
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
  tipo_cliente: ClienteTipo;
  location: {
    type: 'Point';
    coordinates: [number, number]; 
  };
  direccion?: string;
}

export interface IUbicacion {
  _id: string;
  userId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  direccion?: string;
  createdAt: string;
  updatedAt: string;
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
  id_modelo: string | IModelosDatos;
  id_color: string | IColoresDatos;
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
