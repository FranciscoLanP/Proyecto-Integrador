// LocationSelector.tsx
'use client'

import React, { useEffect } from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Box
} from '@mui/material'

import { useCrud } from '../../hooks/useCrud'
import type {
    IProvincia,
    IMunicipio,
    ISector,
    IDistrito,
    IBarrio
} from '../types'

export function LocationSelector(): JSX.Element {
    const { control, watch, setValue, formState: { errors } } =
        useFormContext()

    const provCrud = useCrud<IProvincia>('provincias')
    const muniCrud = useCrud<IMunicipio>('municipios')
    const sectCrud = useCrud<ISector>('sectores')
    const distCrud = useCrud<IDistrito>('distritos')
    const barrCrud = useCrud<IBarrio>('barrios')

    const provincias = provCrud.allQuery.data || []
    const municipios = muniCrud.allQuery.data || []
    const sectores = sectCrud.allQuery.data || []
    const distritos = distCrud.allQuery.data || []
    const barrios = barrCrud.allQuery.data || []

    // Observar cambios en cada nivel
    const provinciaId = watch('ubicacion.provincia')
    const municipioId = watch('ubicacion.municipio')
    const sectorId = watch('ubicacion.sector')
    const distritoId = watch('ubicacion.distrito')

    // Al cambiar provincia, limpiar niveles inferiores
    useEffect(() => {
        setValue('ubicacion.municipio', '')
        setValue('ubicacion.sector', '')
        setValue('ubicacion.distrito', '')
        setValue('ubicacion.barrio', '')
    }, [provinciaId])

    useEffect(() => {
        setValue('ubicacion.sector', '')
        setValue('ubicacion.distrito', '')
        setValue('ubicacion.barrio', '')
    }, [municipioId])

    useEffect(() => {
        setValue('ubicacion.distrito', '')
        setValue('ubicacion.barrio', '')
    }, [sectorId])

    useEffect(() => {
        setValue('ubicacion.barrio', '')
    }, [distritoId])

    // Filtrar opciones según selección
    const filtMunicipios = municipios.filter(m => m.id_provincia === provinciaId)
    const filtSectores = sectores.filter(s => s.id_municipio === municipioId)
    const filtDistritos = distritos.filter(d => d.id_sector === sectorId)
    const filtBarrios = barrios.filter(b => b.id_distrito === distritoId)

    return (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {/* Provincia */}
            <FormControl fullWidth error={!!errors.ubicacion?.provincia}>
                <InputLabel>Provincia</InputLabel>
                <Controller
                    name="ubicacion.provincia"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Provincia">
                            {provincias.map(p => (
                                <MenuItem key={p._id} value={p._id}>
                                    {p.nombre_provincia}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText>
                    {errors.ubicacion?.provincia?.message as string}
                </FormHelperText>
            </FormControl>

            {/* Municipio */}
            <FormControl fullWidth error={!!errors.ubicacion?.municipio}>
                <InputLabel>Municipio</InputLabel>
                <Controller
                    name="ubicacion.municipio"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Municipio" disabled={!provinciaId}>
                            {filtMunicipios.map(m => (
                                <MenuItem key={m._id} value={m._id}>
                                    {m.nombre_municipio}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText>
                    {errors.ubicacion?.municipio?.message as string}
                </FormHelperText>
            </FormControl>

            {/* Sector */}
            <FormControl fullWidth error={!!errors.ubicacion?.sector}>
                <InputLabel>Sector</InputLabel>
                <Controller
                    name="ubicacion.sector"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Sector" disabled={!municipioId}>
                            {filtSectores.map(s => (
                                <MenuItem key={s._id} value={s._id}>
                                    {s.nombre_sector}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText>
                    {errors.ubicacion?.sector?.message as string}
                </FormHelperText>
            </FormControl>

            {/* Distrito */}
            <FormControl fullWidth error={!!errors.ubicacion?.distrito}>
                <InputLabel>Distrito</InputLabel>
                <Controller
                    name="ubicacion.distrito"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Distrito" disabled={!sectorId}>
                            {filtDistritos.map(d => (
                                <MenuItem key={d._id} value={d._id}>
                                    {d.nombre_distrito}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText>
                    {errors.ubicacion?.distrito?.message as string}
                </FormHelperText>
            </FormControl>

            {/* Barrio */}
            <FormControl fullWidth error={!!errors.ubicacion?.barrio}>
                <InputLabel>Barrio</InputLabel>
                <Controller
                    name="ubicacion.barrio"
                    control={control}
                    render={({ field }) => (
                        <Select {...field} label="Barrio" disabled={!distritoId}>
                            {filtBarrios.map(b => (
                                <MenuItem key={b._id} value={b._id}>
                                    {b.nombre_barrio}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                />
                <FormHelperText>
                    {errors.ubicacion?.barrio?.message as string}
                </FormHelperText>
            </FormControl>
        </Box>
    )
}
