'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Table, Pagination, Modal } from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { inscripcionesService } from '@/services/cursos.service';
import type { InscripcionCurso } from '@/types';
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function MisInscripcionesPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedInscripcion, setSelectedInscripcion] =
    useState<InscripcionCurso | null>(null);
  const [filters, setFilters] = useState({ estado: '' });

  const fetchInscripciones = useCallback(
    (params: Parameters<typeof inscripcionesService.getMisInscripciones>[0]) =>
      inscripcionesService.getMisInscripciones({ ...params, ...filters }),
    [filters]
  );

  const {
    data,
    isLoading,
    page,
    perPage,
    total,
    lastPage,
    search,
    sortBy,
    sortOrder,
    goToPage,
    changePerPage,
    handleSearch,
    handleSort,
  } = usePagination<InscripcionCurso>(fetchInscripciones);

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { color: string; label: string }> = {
      activa: { color: 'bg-emerald-50 text-emerald-600', label: 'Activa' },
      completada: { color: 'bg-blue-50 text-blue-600', label: 'Completada' },
      cancelada: { color: 'bg-red-50 text-red-600', label: 'Cancelada' },
      abandonada: { color: 'bg-gray-50 text-gray-600', label: 'Abandonada' },
    };
    const config = estados[estado] || {
      color: 'bg-gray-50 text-gray-600',
      label: estado,
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPagoBadge = (item: InscripcionCurso) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factura = (item as any).factura;
    if (!factura) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-500">
          Sin factura
        </span>
      );
    }
    if (factura.estado === 'pagada') {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
          Pagado
        </span>
      );
    }
    if (factura.estado === 'pendiente') {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600">
          Pendiente
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600">
        {factura.estado}
      </span>
    );
  };

  const estaPagado = (item: InscripcionCurso) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factura = (item as any).factura;
    return factura?.estado === 'pagada';
  };

  const columns = [
    {
      key: 'deportista',
      header: 'Participante',
      render: (item: InscripcionCurso) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {item.deportista?.nombres} {item.deportista?.apellidos}
          </p>
          <p className="text-xs text-gray-500">{item.deportista?.cedula}</p>
        </div>
      ),
    },
    {
      key: 'curso',
      header: 'Curso',
      render: (item: InscripcionCurso) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {item.curso?.nombre}
          </p>
          <p className="text-xs text-gray-500">
            {item.grupo?.nombre || 'Sin grupo'}
          </p>
        </div>
      ),
    },
    {
      key: 'fecha_inscripcion',
      header: 'Fecha Inscripción',
      sortable: true,
      render: (item: InscripcionCurso) => (
        <span className="text-sm text-gray-600">
          {item.fecha_inscripcion
            ? new Date(item.fecha_inscripcion).toLocaleDateString()
            : '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: InscripcionCurso) => getEstadoBadge(item.estado),
    },
    {
      key: 'pago',
      header: 'Pago',
      render: (item: InscripcionCurso) => getPagoBadge(item),
    },
    {
      key: 'calificacion',
      header: 'Calificación',
      render: (item: InscripcionCurso) => (
        <span className="text-sm text-gray-600">
          {item.calificacion !== null && item.calificacion !== undefined
            ? `${item.calificacion}/10`
            : '-'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: InscripcionCurso) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelectedInscripcion(item);
              setShowModal(true);
            }}
            title="Ver detalle"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {estaPagado(item) && item.grupo && (
            <button
              onClick={() =>
                router.push(`/cursos/grupos/${item.grupo?.id_grupo}`)
              }
              title="Ver compañeros e instructor"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <UsersIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Mis Inscripciones
              </h1>
              <p className="text-xs text-gray-500">{total} inscripciones</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Activas</p>
            <p className="text-lg font-semibold text-emerald-600">
              {data.filter((i) => i.estado === 'activa').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Completadas</p>
            <p className="text-lg font-semibold text-blue-600">
              {data.filter((i) => i.estado === 'completada').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Canceladas</p>
            <p className="text-lg font-semibold text-red-600">
              {data.filter((i) => i.estado === 'cancelada').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por participante o curso..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <select
              value={filters.estado}
              onChange={(e) =>
                setFilters({ ...filters, estado: e.target.value })
              }
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(item) => item.id_inscripcion}
            isLoading={isLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <div className="border-t border-gray-100">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={goToPage}
              onPerPageChange={changePerPage}
            />
          </div>
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Detalle de Inscripción"
          size="lg"
        >
          {selectedInscripcion && (
            <div className="space-y-4">
              {/* Participante */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Participante</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInscripcion.deportista?.nombres}{' '}
                    {selectedInscripcion.deportista?.apellidos}
                  </p>
                  <p className="text-xs text-gray-500">
                    CI: {selectedInscripcion.deportista?.cedula}
                  </p>
                </div>
              </div>

              {/* Curso */}
              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                <AcademicCapIcon className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-indigo-600">Curso</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInscripcion.curso?.nombre}
                  </p>
                  {selectedInscripcion.grupo && (
                    <p className="text-xs text-gray-600">
                      Grupo: {selectedInscripcion.grupo.nombre}
                    </p>
                  )}
                </div>
              </div>

              {/* Horario del grupo */}
              {selectedInscripcion.grupo && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-600">Horario</p>
                    <p className="text-sm text-gray-900">
                      {selectedInscripcion.grupo.hora_inicio} -{' '}
                      {selectedInscripcion.grupo.hora_fin}
                    </p>
                    {selectedInscripcion.grupo.dias_semana_nombres && (
                      <p className="text-xs text-gray-600">
                        {selectedInscripcion.grupo.dias_semana_nombres}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">
                    Fecha de Inscripción
                  </p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {selectedInscripcion.fecha_inscripcion
                        ? new Date(
                            selectedInscripcion.fecha_inscripcion
                          ).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  {getEstadoBadge(selectedInscripcion.estado)}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado de Pago</p>
                  {getPagoBadge(selectedInscripcion)}
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Calificación</p>
                  <p className="text-gray-900">
                    {selectedInscripcion.calificacion !== null &&
                    selectedInscripcion.calificacion !== undefined
                      ? `${selectedInscripcion.calificacion}/10`
                      : 'Sin calificar'}
                  </p>
                </div>
                {selectedInscripcion.curso?.precio && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">
                      Precio del Curso
                    </p>
                    <p className="text-gray-900 font-medium">
                      ${Number(selectedInscripcion.curso.precio).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {selectedInscripcion.observaciones && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">Observaciones</p>
                  <p className="text-sm text-gray-600">
                    {selectedInscripcion.observaciones}
                  </p>
                </div>
              )}

              {/* Comentarios del instructor */}
              {selectedInscripcion.comentarios && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-400 text-xs mb-1">
                    Comentarios del Instructor
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedInscripcion.comentarios}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
