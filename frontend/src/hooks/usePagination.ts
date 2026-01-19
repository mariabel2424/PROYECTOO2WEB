'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PaginatedResponse, PaginationParams } from '@/types';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

export function usePagination<T>(
  fetcher: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  options: UsePaginationOptions = {}
) {
  const { initialPage = 1, initialPerPage = 10 } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetcher({
        page,
        per_page: perPage,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      // Asegurar que data sea siempre un array
      setData(Array.isArray(response.data) ? response.data : []);
      setTotal(response.total || 0);
      setLastPage(response.last_page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      setData([]); // Resetear data en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, page, perPage, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(Math.max(1, Math.min(newPage, lastPage)));
    },
    [lastPage]
  );

  const nextPage = useCallback(() => {
    if (page < lastPage) setPage((p) => p + 1);
  }, [page, lastPage]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage((p) => p - 1);
  }, [page]);

  const changePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (field: string) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setPage(1);
    },
    [sortBy]
  );

  return {
    data,
    isLoading,
    error,
    page,
    perPage,
    total,
    lastPage,
    search,
    sortBy,
    sortOrder,
    goToPage,
    nextPage,
    prevPage,
    changePerPage,
    handleSearch,
    handleSort,
    refetch: fetchData,
  };
}
