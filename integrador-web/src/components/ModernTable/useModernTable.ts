import { useState, useMemo } from 'react';

export interface UseModernTableOptions<T = any> {
    data: T[];
    searchFields?: (keyof T)[];
    initialRowsPerPage?: number;
    enableSearch?: boolean;
    enablePagination?: boolean;
}

export interface UseModernTableReturn<T = any> {
    filteredData: T[];
    paginatedData: T[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rows: number) => void;
    totalPages: number;
    totalRows: number;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageChange: (event: unknown, newPage: number) => void;
    handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    resetFilters: () => void;
}

export function useModernTable<T = any>({
    data,
    searchFields = [],
    initialRowsPerPage = 10,
    enableSearch = true,
    enablePagination = true
}: UseModernTableOptions<T>): UseModernTableReturn<T> {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const filteredData = useMemo(() => {
        if (!enableSearch || !searchQuery.trim()) {
            return data;
        }

        const query = searchQuery.toLowerCase().trim();

        return data.filter((item) => {
            if (searchFields.length === 0) {
                return Object.values(item as any).some((value) => {
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(query);
                });
            }

            return searchFields.some((field) => {
                const value = item[field];
                if (value == null) return false;
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [data, searchQuery, searchFields, enableSearch]);

    const paginatedData = useMemo(() => {
        if (!enablePagination) {
            return filteredData;
        }

        const startIndex = page * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, page, rowsPerPage, enablePagination]);

    const totalPages = useMemo(() => {
        if (!enablePagination) return 1;
        return Math.ceil(filteredData.length / rowsPerPage);
    }, [filteredData.length, rowsPerPage, enablePagination]);

    const totalRows = filteredData.length;

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    const resetFilters = () => {
        setSearchQuery('');
        setPage(0);
    };

    return {
        filteredData,
        paginatedData,
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalPages,
        totalRows,
        handleSearchChange,
        handlePageChange,
        handleRowsPerPageChange,
        resetFilters
    };
}

export interface UseTableSelectionOptions<T = any> {
    data: T[];
    getItemId: (item: T) => string | number;
}

export interface UseTableSelectionReturn<T = any> {
    selectedItems: Set<string | number>;
    isSelected: (id: string | number) => boolean;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    handleSelectOne: (id: string | number) => void;
    handleSelectAll: () => void;
    clearSelection: () => void;
    getSelectedData: () => T[];
}

export function useTableSelection<T = any>({
    data,
    getItemId
}: UseTableSelectionOptions<T>): UseTableSelectionReturn<T> {
    const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

    const isSelected = (id: string | number) => selectedItems.has(id);

    const isAllSelected = data.length > 0 && selectedItems.size === data.length;

    const isIndeterminate = selectedItems.size > 0 && selectedItems.size < data.length;

    const handleSelectOne = (id: string | number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems(new Set());
        } else {
            const allIds = data.map(getItemId);
            setSelectedItems(new Set(allIds));
        }
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    const getSelectedData = () => {
        return data.filter(item => selectedItems.has(getItemId(item)));
    };

    return {
        selectedItems,
        isSelected,
        isAllSelected,
        isIndeterminate,
        handleSelectOne,
        handleSelectAll,
        clearSelection,
        getSelectedData
    };
}

export interface UseSortingOptions<T = any> {
    data: T[];
    defaultSort?: keyof T;
    defaultOrder?: 'asc' | 'desc';
}

export interface UseSortingReturn<T = any> {
    sortedData: T[];
    sortField: keyof T | null;
    sortOrder: 'asc' | 'desc';
    handleSort: (field: keyof T) => void;
    resetSort: () => void;
}

export function useSorting<T = any>({
    data,
    defaultSort,
    defaultOrder = 'asc'
}: UseSortingOptions<T>): UseSortingReturn<T> {
    const [sortField, setSortField] = useState<keyof T | null>(defaultSort || null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultOrder);

    const sortedData = useMemo(() => {
        if (!sortField) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
            if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

            let comparison = 0;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [data, sortField, sortOrder]);

    const handleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const resetSort = () => {
        setSortField(defaultSort || null);
        setSortOrder(defaultOrder);
    };

    return {
        sortedData,
        sortField,
        sortOrder,
        handleSort,
        resetSort
    };
}
