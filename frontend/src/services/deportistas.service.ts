import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  Deportista,
  DeportistaFormData,
  Categoria,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const deportistasService = {
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Deportista>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Deportista>
      | Deportista[]
      | {
          success: boolean;
          data: PaginatedResponse<Deportista>;
          message: string;
        }
    >(API_ENDPOINTS.deportistas, params);

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

    // Manejar respuesta paginada directa o array directo
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
    return data as PaginatedResponse<Deportista>;
  },

  async getById(id: number): Promise<Deportista> {
    const { data } = await apiClient.get<Deportista>(
      `${API_ENDPOINTS.deportistas}/${id}`
    );
    return data;
  },

  async create(deportista: DeportistaFormData): Promise<Deportista> {
    const { data } = await apiClient.post<Deportista>(
      API_ENDPOINTS.deportistas,
      deportista
    );
    return data;
  },

  async update(
    id: number,
    deportista: Partial<DeportistaFormData>
  ): Promise<Deportista> {
    const { data } = await apiClient.put<Deportista>(
      `${API_ENDPOINTS.deportistas}/${id}`,
      deportista
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.deportistas}/${id}`);
  },

  async cambiarEstado(id: number, estado: string): Promise<Deportista> {
    const { data } = await apiClient.post<Deportista>(
      `${API_ENDPOINTS.deportistas}/${id}/cambiar-estado`,
      { estado }
    );
    return data;
  },

  async restaurar(id: number): Promise<Deportista> {
    const { data } = await apiClient.post<Deportista>(
      `${API_ENDPOINTS.deportistas}/${id}/restaurar`
    );
    return data;
  },

  async getEstadisticas(): Promise<Record<string, number>> {
    const { data } = await apiClient.get<Record<string, number>>(
      `${API_ENDPOINTS.deportistas}/estadisticas/generales`
    );
    return data;
  },

  async getActivos(): Promise<Deportista[]> {
    const { data } = await apiClient.get<Deportista[]>(
      `${API_ENDPOINTS.deportistas}/activos/listar`
    );
    return data;
  },

  async getByEstado(estado: string): Promise<Deportista[]> {
    const { data } = await apiClient.get<Deportista[]>(
      `${API_ENDPOINTS.deportistas}/estado/${estado}`
    );
    return data;
  },

  async getByCategoria(categoriaId: number): Promise<Deportista[]> {
    const { data } = await apiClient.get<Deportista[]>(
      `${API_ENDPOINTS.deportistas}/categoria/${categoriaId}`
    );
    return data;
  },

  // === MIS PARTICIPANTES (para tutores) ===
  async getMisParticipantes(): Promise<Deportista[]> {
    const { data } = await apiClient.get<Deportista[] | { data: Deportista[] }>(
      API_ENDPOINTS.misParticipantes
    );
    // Manejar si viene envuelto en { data: [...] }
    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }
    return Array.isArray(data) ? data : [];
  },

  async crearMiParticipante(
    deportista: DeportistaFormData
  ): Promise<Deportista> {
    const { data } = await apiClient.post<{ data: Deportista } | Deportista>(
      API_ENDPOINTS.misParticipantes,
      deportista
    );
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }
    return data as Deportista;
  },

  async actualizarMiParticipante(
    id: number,
    deportista: Partial<DeportistaFormData>
  ): Promise<Deportista> {
    const { data } = await apiClient.put<{ data: Deportista } | Deportista>(
      `${API_ENDPOINTS.misParticipantes}/${id}`,
      deportista
    );
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }
    return data as Deportista;
  },

  async eliminarMiParticipante(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.misParticipantes}/${id}`);
  },
};

export const categoriasService = {
  async getAll(
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

    // Manejar respuesta paginada directa o array directo
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
