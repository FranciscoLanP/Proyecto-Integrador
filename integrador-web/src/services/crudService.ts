import { apiClient } from './apiClient'

export type CrudService<T> = {
    fetchAll: () => Promise<T[]>
    fetchById: (id: string) => Promise<T>
    create: (data: Partial<T>) => Promise<T>
    update: (id: string, data: Partial<T>) => Promise<T>
    remove: (id: string) => Promise<void>
}

export function createCrudService<T>(resource: string): CrudService<T> {
    const base = `/${resource}`
    return {
        fetchAll: () => apiClient.get<T[]>(base).then(r => r.data),
        fetchById: id => apiClient.get<T>(`${base}/${id}`).then(r => r.data),
        create: data => apiClient.post<T>(base, data).then(r => r.data),
        update: (id, data) => apiClient.put<T>(`${base}/${id}`, data).then(r => r.data),
        remove: id => apiClient.delete(`${base}/${id}`).then(() => { })
    }
}
