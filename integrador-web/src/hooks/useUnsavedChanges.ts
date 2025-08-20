import { useState, useRef, useCallback } from 'react'

export interface UseUnsavedChangesProps<T> {
    isOpen: boolean
    initialData?: T
    getCurrentData: () => T
    isEqual?: (a: T, b: T) => boolean
    onClose: () => void
}

export function useUnsavedChanges<T>({
    isOpen,
    initialData,
    getCurrentData,
    isEqual,
    onClose
}: UseUnsavedChangesProps<T>) {
    const [confirmDiscard, setConfirmDiscard] = useState<boolean>(false)
    const savedInitialData = useRef<T | null>(null)

    // Guardar datos iniciales cuando se abre el modal
    const initializeData = useCallback(() => {
        if (isOpen) {
            savedInitialData.current = initialData || null
            setConfirmDiscard(false)
        }
    }, [isOpen, initialData])

    // Función por defecto para comparar objetos (shallow comparison)
    const defaultIsEqual = useCallback((a: T, b: T): boolean => {
        if (a === b) return true
        if (!a || !b) return a === b

        const aKeys = Object.keys(a as any)
        const bKeys = Object.keys(b as any)

        if (aKeys.length !== bKeys.length) return false

        return aKeys.every(key => (a as any)[key] === (b as any)[key])
    }, [])

    // Detectar si hay cambios
    const isDirty = useCallback((): boolean => {
        if (!savedInitialData.current) return false

        const current = getCurrentData()
        const compareFn = isEqual || defaultIsEqual

        return !compareFn(current, savedInitialData.current)
    }, [getCurrentData, isEqual, defaultIsEqual])

    // Intentar cerrar el modal
    const tryClose = useCallback((): void => {
        if (isDirty()) {
            setConfirmDiscard(true)
        } else {
            onClose()
        }
    }, [isDirty, onClose])

    // Confirmar y cerrar descartando cambios
    const confirmAndClose = useCallback((): void => {
        setConfirmDiscard(false)
        onClose()
    }, [onClose])

    return {
        confirmDiscard,
        setConfirmDiscard,
        isDirty,
        tryClose,
        confirmAndClose,
        initializeData
    }
}

export default useUnsavedChanges
