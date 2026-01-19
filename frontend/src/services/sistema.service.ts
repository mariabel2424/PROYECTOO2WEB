import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  Configuracion,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const configuracionesService = {
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Configuracion>> {
    const { data } = await apiClient.get<PaginatedResponse<Configuracion>>(
      API_ENDPOINTS.configuraciones,
      params
    );
    return data;
  },

  async getById(id: number): Promise<Configuracion> {
    const { data } = await apiClient.get<Configuracion>(
      `${API_ENDPOINTS.configuraciones}/${id}`
    );
    return data;
  },

  async create(configuracion: Partial<Configuracion>): Promise<Configuracion> {
    const { data } = await apiClient.post<Configuracion>(
      API_ENDPOINTS.configuraciones,
      configuracion
    );
    return data;
  },

  async update(
    id: number,
    configuracion: Partial<Configuracion>
  ): Promise<Configuracion> {
    const { data } = await apiClient.put<Configuracion>(
      `${API_ENDPOINTS.configuraciones}/${id}`,
      configuracion
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.configuraciones}/${id}`);
  },
};
