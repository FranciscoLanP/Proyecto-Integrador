export interface IMarcaVehiculo {
  _id: string
  nombre_marca: string
}

export interface IColoresDatos {
  _id: string
  nombre_color: string
}

export interface ICliente {
  _id: string
  cedula: string
  rnc?: string
  nombre: string
  numero_telefono: string
  correo: string
  id_barrio?: string
}

export interface ITipoCliente {
  _id: string
  nombre_tipo_cliente: 'Individual' | 'Empresarial' | 'Aseguradora' | 'Gobierno'
}

export interface IClienteInformacion {
  _id: string
  id_cliente: string
  id_tipo_cliente: string
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