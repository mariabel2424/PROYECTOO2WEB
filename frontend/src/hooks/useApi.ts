'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/lib/api/client';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions = { immediate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: options.immediate ?? true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error desconocido';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [fetcher]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  const refetch = useCallback(() => execute(), [execute]);

  return { ...state, refetch, execute };
}

export function useMutation<T, P = void>(
  mutationFn: (params: P) => Promise<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (params: P) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(params);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error desconocido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, data, reset };
}
