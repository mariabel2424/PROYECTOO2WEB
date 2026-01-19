import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { Categoria, PaginatedResponse, PaginationParams } from '@/types';

export const categoriasService = {
  async getAll(): Promise<Categoria[]> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Categoria>
      | Categoria[]
      | {
          success: boolean;
          data: PaginatedResponse<Categoria> | Categoria[];
          message: string;
        }
    >(API_ENDPOINTS.categorias);

    // Manejar respuesta envuelta en { success, data, message }
    if (data && typeof data === 'object' && 'success' in data && data.data) {
      const innerData = data.data;
      if (Array.isArray(innerData)) {
        return innerData;
      }
      return innerData.data || [];
    }

    // Manejar respuesta paginada directa
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as PaginatedResponse<Categoria>).data;
    }

    // Manejar array directo
    if (Array.isArray(data)) {
      return data;
    }

    return [];
  },

  async getAllPaginated(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Categoria>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Categoria>
      | Categoria[]
      | {
          success: boolean;
          data: PaginatedResponse<Categoria>;
          message: string;
        }
    >(API_ENDPOINTS.categorias, params);

    // Manejar respuesta envuelta en { success, data, message }
    if (data && typeof data === 'object' && 'success' in data && data.data) {
      const innerData = data.data;
      if (Array.isArray(innerData)) {
        return {
          data: innerData,
          total: innerData.length,
          current_page: 1,
          last_page: 1,
          per_page: innerData.length,
          from: 1,
          to: innerData.length,
        };
      }
      return innerData;
    }

    // Manejar array directo
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        from: 1,
        to: data.length,
      };
    }

    return data as PaginatedResponse<Categoria>;
  },

  async getById(id: number): Promise<Categoria> {
    const { data } = await apiClient.get<Categoria>(
      `${API_ENDPOINTS.categorias}/${id}`
    );
    return data;
  },

  async create(categoria: Partial<Categoria>): Promise<Categoria> {
    const { data } = await apiClient.post<Categoria>(
      API_ENDPOINTS.categorias,
      categoria
    );
    return data;
  },

  async update(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    const { data } = await apiClient.put<Categoria>(
      `${API_ENDPOINTS.categorias}/${id}`,
      categoria
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.categorias}/${id}`);
  },
};
