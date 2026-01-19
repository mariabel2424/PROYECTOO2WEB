'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import {
  Button,
  Table,
  Pagination,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { useAuth } from '@/hooks/useAuth';
import {
  inscripcionesService,
  cursosService,
  gruposCursoService,
} from '@/services/cursos.service';
import { deportistasService } from '@/services/deportistas.service';
import type { InscripcionCurso, Curso, GrupoCurso, Deportista } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
  FunnelIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function InscripcionesPage() {
  useAuth(); // Verificar autenticación
  const searchParams = useSearchParams();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [grupos, setGrupos] = useState<GrupoCurso[]>([]);
  const [deportistas, setDeportistas] = useState<Deportista[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInscripcion, setSelectedInscripcion] =
    useState<InscripcionCurso | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calificacion, setCalificacion] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [filters, setFilters] = useState({ estado: '', id_curso: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [generarFactura, setGenerarFactura] = useState(true);
  const [formData, setFormData] = useState({
    id_curso: '',
    id_grupo: '',
    id_deportista: '',
    observaciones: '',
  });

  // Cargar datos iniciales y manejar parámetro de URL
  useEffect(() => {
    Promise.all([
      cursosService.getAll({ per_page: 100 }),
      deportistasService.getAll({ per_page: 100 }),
    ])
      .then(([cursosRes, deportistasRes]) => {
        setCursos(cursosRes.data);
        setDeportistas(deportistasRes.data);

        // Si viene un curso desde la URL, preseleccionarlo y abrir el modal
        const cursoIdFromUrl = searchParams.get('curso');
        const grupoIdFromUrl = searchParams.get('grupo');
        if (cursoIdFromUrl) {
          setFormData((prev) => ({
            ...prev,
            id_curso: cursoIdFromUrl,
            id_grupo: grupoIdFromUrl || '',
          }));
          setShowFormModal(true);
        }
      })
      .catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    if (formData.id_curso) {
      gruposCursoService
        .getAll({ id_curso: Number(formData.id_curso) })
        .then((res) => setGrupos(res.data))
        .catch(console.error);
    } else {
      setGrupos([]);
    }
  }, [formData.id_curso]);

  const fetchInscripciones = useCallback(
    (params: Parameters<typeof inscripcionesService.getAll>[0]) =>
      inscripcionesService.getAll({ ...params, ...filters }),
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
    refetch,
  } = usePagination<InscripcionCurso>(fetchInscripciones);

  const handleCalificar = async () => {
    if (!selectedInscripcion) return;
    setIsSubmitting(true);
    try {
      await inscripcionesService.calificar(
        selectedInscripcion.id_inscripcion,
        Number(calificacion),
        comentarios || undefined
      );
      setShowModal(false);
      setSelectedInscripcion(null);
      setCalificacion('');
      setComentarios('');
      refetch();
    } catch (error) {
      console.error('Error calificando:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta inscripción?')) return;
    try {
      await inscripcionesService.cancelar(id);
      refetch();
    } catch (error) {
      console.error('Error cancelando inscripción:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await inscripcionesService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inscripcionesService.create({
        id_curso: Number(formData.id_curso),
        id_grupo: Number(formData.id_grupo),
        id_deportista: Number(formData.id_deportista),
        observaciones: formData.observaciones || undefined,
        generar_factura: generarFactura,
      });
      setShowFormModal(false);
      setFormData({
        id_curso: '',
        id_grupo: '',
        id_deportista: '',
        observaciones: '',
      });
      setGenerarFactura(true);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-emerald-50 text-emerald-600';
      case 'completada':
        return 'bg-blue-50 text-blue-600';
      case 'cancelada':
        return 'bg-red-50 text-red-600';
      case 'abandonada':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const columns = [
    {
      key: 'deportista',
      header: 'Deportista',
      render: (item: InscripcionCurso) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xs font-medium">
            {item.deportista?.nombres?.charAt(0) || '?'}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {item.deportista?.nombre_completo ||
                `${item.deportista?.nombres || ''} ${
                  item.deportista?.apellidos || ''
                }`.trim() ||
                '-'}
            </span>
            <p className="text-xs text-gray-400">
              {item.deportista?.cedula || '-'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'curso',
      header: 'Curso',
      render: (item: InscripcionCurso) => (
        <span className="text-sm text-gray-600">
          {item.curso?.nombre || '-'}
        </span>
      ),
    },
    {
      key: 'grupo',
      header: 'Grupo',
      render: (item: InscripcionCurso) => (
        <span className="text-sm text-gray-600">
          {item.grupo?.nombre || '-'}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (item: InscripcionCurso) => (
        <span className="text-sm text-gray-600">
          {item.fecha_inscripcion || '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: InscripcionCurso) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(
            item.estado
          )}`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      key: 'calificacion',
      header: 'Calificación',
      render: (item: InscripcionCurso) => (
        <span className="text-sm font-medium text-gray-900">
          {item.calificacion !== null && item.calificacion !== undefined
            ? item.calificacion
            : '-'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: InscripcionCurso) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedInscripcion(item);
              setCalificacion(item.calificacion?.toString() || '');
              setComentarios(item.comentarios || '');
              setShowModal(true);
            }}
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Calificar"
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
          {item.estado === 'activa' && (
            <button
              onClick={() => handleCancelar(item.id_inscripcion)}
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Cancelar inscripción"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(item.id_inscripcion)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Inscripciones
              </h1>
              <p className="text-xs text-gray-500">{total} registros</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowFormModal(true)}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Nueva Inscripción
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar inscripción..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filtros
            </button>
          </div>
          {showFilters && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
              <select
                value={filters.estado}
                onChange={(e) =>
                  setFilters({ ...filters, estado: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="abandonada">Abandonada</option>
              </select>
              <select
                value={filters.id_curso}
                onChange={(e) =>
                  setFilters({ ...filters, id_curso: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todos los cursos</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setFilters({ estado: '', id_curso: '' })}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

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

        {/* Modal de calificación */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Calificar Inscripción"
          size="sm"
        >
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Deportista:{' '}
                <span className="font-medium text-gray-900">
                  {selectedInscripcion?.deportista?.nombre_completo ||
                    `${selectedInscripcion?.deportista?.nombres || ''} ${
                      selectedInscripcion?.deportista?.apellidos || ''
                    }`.trim()}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Curso:{' '}
                <span className="font-medium text-gray-900">
                  {selectedInscripcion?.curso?.nombre}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Calificación (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={calificacion}
                onChange={(e) => setCalificacion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Comentarios
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCalificar}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de nueva inscripción */}
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Nueva Inscripción"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Curso *
              </label>
              <select
                value={formData.id_curso}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_curso: e.target.value,
                    id_grupo: '',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar curso</option>
                {cursos
                  .filter((c) => c.estado === 'abierto')
                  .map((c) => (
                    <option key={c.id_curso} value={c.id_curso}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Grupo *
              </label>
              <select
                value={formData.id_grupo}
                onChange={(e) =>
                  setFormData({ ...formData, id_grupo: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
                disabled={!formData.id_curso}
              >
                <option value="">Seleccionar grupo</option>
                {grupos
                  .filter((g) => g.estado === 'activo')
                  .map((g) => (
                    <option key={g.id_grupo} value={g.id_grupo}>
                      {g.nombre} ({g.cupo_actual || 0}/{g.cupo_maximo}{' '}
                      inscritos)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Deportista *
              </label>
              <select
                value={formData.id_deportista}
                onChange={(e) =>
                  setFormData({ ...formData, id_deportista: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar deportista</option>
                {deportistas
                  .filter((d) => d.estado === 'activo')
                  .map((d) => (
                    <option key={d.id_deportista} value={d.id_deportista}>
                      {d.nombres} {d.apellidos} - {d.cedula || 'Sin cédula'}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="generar_factura"
                checked={generarFactura}
                onChange={(e) => setGenerarFactura(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="generar_factura"
                className="text-sm text-gray-600"
              >
                Generar factura automáticamente
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowFormModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Inscribir'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar inscripción?"
          message="Esta acción no se puede deshacer. La inscripción será eliminada permanentemente."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
