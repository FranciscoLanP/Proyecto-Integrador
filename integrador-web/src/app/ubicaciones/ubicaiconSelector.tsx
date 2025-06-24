'use client'

import React, { JSX, useEffect } from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Box
} from '@mui/material'
import { useFormContext, Controller } from 'react-hook-form'

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

    const provinciaId = watch('ubicacion.provincia')
    const municipioId = watch('ubicacion.municipio')
    const sectorId = watch('ubicacion.sector')
    const distritoId = watch('ubicacion.distrito')

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

    const filtMunicipios = municipios.filter(m => m.id_provincia === provinciaId)
    const filtSectores = sectores.filter(s => s.id_municipio === municipioId)
    const filtDistritos = distritos.filter(d => d.id_sector === sectorId)
    const filtBarrios = barrios.filter(b => b.id_distrito === distritoId)

    return (
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl
                fullWidth
                error={
                    typeof errors.ubicacion === 'object' &&
                    errors.ubicacion !== null &&
                    'provincia' in errors.ubicacion
                }
            >
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
                    {typeof errors.ubicacion === 'object' &&
                        errors.ubicacion !== null &&
                        'provincia' in errors.ubicacion
                        ? (errors.ubicacion.provincia as { message?: string })?.message
                        : ''}
                </FormHelperText>
            </FormControl>

            <FormControl
                fullWidth
                error={
                    typeof errors.ubicacion === 'object' &&
                    errors.ubicacion !== null &&
                    'municipio' in errors.ubicacion
                }
            >
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
                    {typeof errors.ubicacion === 'object' &&
                        errors.ubicacion !== null &&
                        'municipio' in errors.ubicacion
                        ? (errors.ubicacion.municipio as { message?: string })?.message
                        : ''}
                </FormHelperText>
            </FormControl>

            <FormControl
                fullWidth
                error={
                    typeof errors.ubicacion === 'object' &&
                    errors.ubicacion !== null &&
                    'sector' in errors.ubicacion
                }
            >
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
                    {typeof errors.ubicacion === 'object' &&
                        errors.ubicacion !== null &&
                        'sector' in errors.ubicacion
                        ? (errors.ubicacion.sector as { message?: string })?.message
                        : ''}
                </FormHelperText>
            </FormControl>

            <FormControl
                fullWidth
                error={
                    typeof errors.ubicacion === 'object' &&
                    errors.ubicacion !== null &&
                    'distrito' in errors.ubicacion
                }
            >
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
                    {typeof errors.ubicacion === 'object' &&
                        errors.ubicacion !== null &&
                        'distrito' in errors.ubicacion
                        ? (errors.ubicacion.distrito as { message?: string })?.message
                        : ''}
                </FormHelperText>
            </FormControl>

            <FormControl
                fullWidth
                error={
                    typeof errors.ubicacion === 'object' &&
                    errors.ubicacion !== null &&
                    'barrio' in errors.ubicacion
                }
            >
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
                    {typeof errors.ubicacion === 'object' &&
                        errors.ubicacion !== null &&
                        'barrio' in errors.ubicacion
                        ? (errors.ubicacion.barrio as { message?: string })?.message
                        : ''}
                </FormHelperText>
            </FormControl>
        </Box>
    )
}
