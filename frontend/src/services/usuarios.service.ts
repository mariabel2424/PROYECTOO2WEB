import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  Usuario,
  Rol,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const usuariosService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Usuario>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Usuario>
      | Usuario[]
      | { success: boolean; data: PaginatedResponse<Usuario>; message: string }
    >(API_ENDPOINTS.usuarios, params);

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
    return data as PaginatedResponse<Usuario>;
  },

  async getById(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(
      `${API_ENDPOINTS.usuarios}/${id}`
    );
    return data;
  },

  async create(
    usuario: Partial<Usuario> & { password: string }
  ): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>(
      API_ENDPOINTS.usuarios,
      usuario
    );
    return data;
  },

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(
      `${API_ENDPOINTS.usuarios}/${id}`,
      usuario
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.usuarios}/${id}`);
  },

  async cambiarEstado(id: number, status: string): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(
      `${API_ENDPOINTS.usuarios}/${id}/estado`,
      { status }
    );
    return data;
  },
};

export const rolesService = {
  async getAll(): Promise<Rol[]> {
    console.log('Llamando a:', API_ENDPOINTS.roles);
    const { data } = await apiClient.get<{ data: Rol[] } | Rol[]>(
      API_ENDPOINTS.roles
    );
    console.log('Respuesta roles:', data);
    // El backend puede devolver paginado o array directo
    return Array.isArray(data) ? data : data.data;
  },

  async getById(id: number): Promise<Rol> {
    const { data } = await apiClient.get<Rol>(`${API_ENDPOINTS.roles}/${id}`);
    return data;
  },

  async create(rol: Partial<Rol>): Promise<Rol> {
    const { data } = await apiClient.post<Rol>(API_ENDPOINTS.roles, rol);
    return data;
  },

  async update(id: number, rol: Partial<Rol>): Promise<Rol> {
    const { data } = await apiClient.put<Rol>(
      `${API_ENDPOINTS.roles}/${id}`,
      rol
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.roles}/${id}`);
  },
};

// Exportar permisosService vacío para compatibilidad
export const permisosService = {
  async getAll(): Promise<never[]> {
    return [];
  },
};

// Servicio para instructores (usuarios con rol instructor)
export const instructoresService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Usuario>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Usuario>
      | Usuario[]
      | { success: boolean; data: PaginatedResponse<Usuario>; message: string }
    >(API_ENDPOINTS.instructores, params);

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
    return data as PaginatedResponse<Usuario>;
  },

  async getDisponibles(): Promise<Usuario[]> {
    const { data } = await apiClient.get<
      | Usuario[]
      | { total: number; instructores: unknown[] }
      | { success: boolean; data: Usuario[] }
    >(`${API_ENDPOINTS.instructores}/disponibles/listar`);

    // Manejar formato { total, instructores }
    if (data && typeof data === 'object' && 'instructores' in data) {
      // Transformar el formato del backend al formato Usuario
      return (
        data.instructores as Array<{
          id_instructor?: number;
          id_usuario?: number;
          nombres?: string;
          apellidos?: string;
          nombre?: string;
          apellido?: string;
          email?: string;
          especialidad?: string;
        }>
      ).map((inst) => ({
        id_usuario: inst.id_usuario || inst.id_instructor || 0,
        nombre: inst.nombres || inst.nombre || '',
        apellido: inst.apellidos || inst.apellido || '',
        email: inst.email || '',
        especialidad: inst.especialidad,
        status: 'activo' as const,
        id_rol: 0,
        created_at: '',
        updated_at: '',
      }));
    }
    // Manejar formato { success, data }
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }
    return data as Usuario[];
  },
};
