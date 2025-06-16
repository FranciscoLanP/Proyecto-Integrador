import { useQuery, useMutation, useQueryClient } from 'react-query'
import type { CrudService } from '../services/crudService'
import { createCrudService } from '../services/crudService'

export function useCrud<T>(resource: string) {
    const svc: CrudService<T> = createCrudService(resource)
    const qc = useQueryClient()

    const allQuery = useQuery<T[], Error>(
        [resource],
        svc.fetchAll
    )

    const createM = useMutation(svc.create, {
        onSuccess: () => qc.invalidateQueries(resource)
    })

    const updateM = useMutation(
        ({ id, data }: { id: string; data: Partial<T> }) =>
            svc.update(id, data),
        { onSuccess: () => qc.invalidateQueries(resource) }
    )

    const deleteM = useMutation(svc.remove, {
        onSuccess: () => qc.invalidateQueries(resource)
    })

    return {
        allQuery,
        createM,
        updateM,
        deleteM,
        svc
    }
}
