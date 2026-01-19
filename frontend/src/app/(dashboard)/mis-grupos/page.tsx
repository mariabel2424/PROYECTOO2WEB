'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { apiClient } from '@/lib/api/client';
import {
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface MiGrupo {
  id_grupo: number;
  nombre: string;
  curso: {
    id_curso: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  horario: string;
  dias_semana: string;
  cupo_actual: number;
  cupo_maximo: number;
  estado: string;
  participantes: number;
}

interface MisGruposResponse {
  instructor: string;
  especialidad: string;
  total_grupos: number;
  grupos: MiGrupo[];
}

export default function MisGruposPage() {
  const router = useRouter();
  const [data, setData] = useState<MisGruposResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMisGrupos = async () => {
      try {
        const response = await apiClient.get<MisGruposResponse>('/mis-grupos');
        setData(response.data);
      } catch (error) {
        console.error('Error cargando grupos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMisGrupos();
  }, []);

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-emerald-50 text-emerald-600';
      case 'completo':
        return 'bg-blue-50 text-blue-600';
      case 'inactivo':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Mis Grupos
              </h1>
              <p className="text-sm text-gray-500">
                {data?.instructor} • {data?.especialidad || 'Instructor'}
              </p>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {data?.total_grupos || 0} grupos asignados
          </span>
        </div>

        {/* Grupos */}
        {data?.grupos && data.grupos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.grupos.map((grupo) => (
              <div
                key={grupo.id_grupo}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {grupo.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {grupo.curso.nombre}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(
                        grupo.estado
                      )}`}
                    >
                      {grupo.estado}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span>{grupo.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <span>{grupo.dias_semana}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span>
                      {grupo.participantes} / {grupo.cupo_maximo} participantes
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push(`/mis-grupos/${grupo.id_grupo}`)}
                  >
                    <UsersIcon className="h-4 w-4 mr-1" />
                    Ver Estudiantes
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/mis-grupos/${grupo.id_grupo}/asistencia`)
                    }
                  >
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                    Asistencia
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes grupos asignados
            </h3>
            <p className="text-sm text-gray-500">
              Cuando te asignen grupos, aparecerán aquí.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
