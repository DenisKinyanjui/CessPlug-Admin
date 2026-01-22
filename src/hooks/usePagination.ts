// hooks/usePagination.ts - Reusable pagination hook

import { useState, useCallback, useEffect } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  setPagination: (pagination: Partial<PaginationState>) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setLimit: (limit: number) => void;
  resetPagination: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialLimit = 10,
    onPageChange,
    onLimitChange
  } = options;

  const [pagination, setPaginationState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update pagination state
  const setPagination = useCallback((newPagination: Partial<PaginationState>) => {
    setPaginationState(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setPaginationState(prev => ({
        ...prev,
        page
      }));
      onPageChange?.(page);
    }
  }, [pagination.pages, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      const nextPage = pagination.page + 1;
      goToPage(nextPage);
    }
  }, [pagination.page, pagination.pages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      const prevPage = pagination.page - 1;
      goToPage(prevPage);
    }
  }, [pagination.page, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(pagination.pages);
  }, [pagination.pages, goToPage]);

  const setLimit = useCallback((limit: number) => {
    setPaginationState(prev => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when changing limit
      pages: Math.ceil(prev.total / limit)
    }));
    onLimitChange?.(limit);
  }, [onLimitChange]);

  const resetPagination = useCallback(() => {
    setPaginationState({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      pages: 0
    });
    setError(null);
  }, [initialPage, initialLimit]);

  // Computed values
  const canGoNext = pagination.page < pagination.pages;
  const canGoPrevious = pagination.page > 1;

  return {
    pagination,
    loading,
    error,
    setPagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setLimit,
    resetPagination,
    canGoNext,
    canGoPrevious
  };
};

// Additional hook for server-side pagination with data fetching
export interface UseServerPaginationOptions<T> extends UsePaginationOptions {
  fetchData: (page: number, limit: number, ...args: any[]) => Promise<{
    data: T[];
    pagination: PaginationState;
  }>;
  dependencies?: any[];
  autoFetch?: boolean;
}

export interface UseServerPaginationReturn<T> extends UsePaginationReturn {
  data: T[];
  fetchData: (page?: number, ...args: any[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useServerPagination = <T = any>(
  options: UseServerPaginationOptions<T>
): UseServerPaginationReturn<T> => {
  const {
    fetchData: fetchDataFn,
    dependencies = [],
    autoFetch = true,
    ...paginationOptions
  } = options;

  const paginationHook = usePagination(paginationOptions);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page?: number, ...args: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = page || paginationHook.pagination.page;
      const result = await fetchDataFn(currentPage, paginationHook.pagination.limit, ...args);

      setData(result.data);
      paginationHook.setPagination(result.pagination);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchDataFn, paginationHook]);

  const refresh = useCallback(async () => {
    await fetchData(paginationHook.pagination.page);
  }, [fetchData, paginationHook.pagination.page]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchData(1);
    }
  }, dependencies);

  // Enhanced goToPage that fetches data
  const enhancedGoToPage = useCallback(async (page: number) => {
    await fetchData(page);
  }, [fetchData]);

  return {
    ...paginationHook,
    data,
    loading,
    error,
    fetchData,
    refresh,
    goToPage: enhancedGoToPage
  };
};

// Utility functions for pagination calculations
export const getPaginationInfo = (pagination: PaginationState) => {
  const { page, limit, total } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  
  return {
    start,
    end,
    showing: `Showing ${start} to ${end} of ${total} results`,
    hasResults: total > 0,
    isEmpty: total === 0
  };
};

export const getPaginationRange = (currentPage: number, totalPages: number, delta: number = 2) => {
  const range = [];
  const rangeWithDots = [];
  
  // Calculate start and end pages
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);
  
  // Add pages to range
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  
  // Add first page and dots if necessary
  if (start > 1) {
    rangeWithDots.push(1);
    if (start > 2) {
      rangeWithDots.push('...');
    }
  }
  
  // Add main range
  rangeWithDots.push(...range);
  
  // Add last page and dots if necessary
  if (end < totalPages) {
    if (end < totalPages - 1) {
      rangeWithDots.push('...');
    }
    rangeWithDots.push(totalPages);
  }
  
  return rangeWithDots;
};