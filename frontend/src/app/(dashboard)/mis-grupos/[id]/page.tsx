'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { gruposCursoService } from '@/services/cursos.service';
import type { GrupoCurso, InscripcionCurso } from '@/types';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function MiGrupoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const grupoId = Number(params.id);

  const [grupo, setGrupo] = useState<GrupoCurso | null>(null);
  const [estudiantes, setEstudiantes] = useState<InscripcionCurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!grupoId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [grupoData, deportistasRes] = await Promise.all([
          gruposCursoService.getById(grupoId),
          gruposCursoService.getDeportistas(grupoId),
        ]);
        setGrupo(grupoData);
        setEstudiantes(deportistasRes.deportistas || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [grupoId]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!grupo) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Grupo no encontrado</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/mis-grupos')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {grupo.nombre}
                </h1>
                <p className="text-sm text-gray-500">{grupo.curso?.nombre}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/mis-grupos/${grupoId}/asistencia`)}
          >
            <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
            Tomar Asistencia
          </Button>
        </div>

        {/* Info del grupo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ClockIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Horario</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {grupo.hora_inicio} - {grupo.hora_fin}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Días</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {grupo.dias_semana_nombres || '-'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <UsersIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Cupo</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {grupo.cupo_actual || 0} / {grupo.cupo_maximo} estudiantes
            </p>
          </div>
        </div>

        {/* Lista de estudiantes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-emerald-600" />
                <h2 className="font-medium text-emerald-900">
                  Estudiantes Inscritos
                </h2>
              </div>
              <span className="text-sm text-emerald-600 font-medium">
                {estudiantes.length} estudiantes
              </span>
            </div>
          </div>
          <div className="p-4">
            {estudiantes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Nombre</th>
                      <th className="pb-3 font-medium">Cédula</th>
                      <th className="pb-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {estudiantes.map((inscripcion, index) => (
                      <tr
                        key={inscripcion.id_inscripcion}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-emerald-600">
                                {inscripcion.deportista?.nombres?.charAt(0)}
                                {inscripcion.deportista?.apellidos?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {inscripcion.deportista?.nombres}{' '}
                              {inscripcion.deportista?.apellidos}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {inscripcion.deportista?.cedula || '-'}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              inscripcion.estado === 'activa'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {inscripcion.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-8">
                No hay estudiantes inscritos en este grupo
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
