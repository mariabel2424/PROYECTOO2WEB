'use client';

import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  Button,
  Table,
  Pagination,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { cursosService } from '@/services/cursos.service';
import type { Curso } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function CursosPage() {
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({ estado: '', tipo: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    representante: '',
    email_representante: '',
    telefono_representante: '',
    tipo: 'vacacional' as 'vacacional' | 'permanente',
    cupo_maximo: '',
    precio: '',
  });

  const fetchCursos = useCallback(
    (params: Parameters<typeof cursosService.getAll>[0]) =>
      cursosService.getAll({ ...params, ...filters }),
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
  } = usePagination<Curso>(fetchCursos);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await cursosService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nombre: curso.nombre || '',
      descripcion: curso.descripcion || '',
      fecha_inicio: curso.fecha_inicio || '',
      fecha_fin: curso.fecha_fin || '',
      representante: curso.representante || '',
      email_representante: curso.email_representante || '',
      telefono_representante: curso.telefono_representante || '',
      tipo: curso.tipo || 'vacacional',
      cupo_maximo: curso.cupo_maximo?.toString() || '',
      precio: curso.precio?.toString() || '',
    });
    setShowFormModal(true);
  };

  const resetForm = () => {
    setEditingCurso(null);
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      representante: '',
      email_representante: '',
      telefono_representante: '',
      tipo: 'vacacional',
      cupo_maximo: '',
      precio: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        representante: formData.representante,
        email_representante: formData.email_representante || undefined,
        telefono_representante: formData.telefono_representante || undefined,
        tipo: formData.tipo,
        cupo_maximo: formData.cupo_maximo
          ? Number(formData.cupo_maximo)
          : undefined,
        precio: formData.precio ? Number(formData.precio) : undefined,
      };
      if (editingCurso) {
        await cursosService.update(editingCurso.id_curso, payload);
      } else {
        await cursosService.create(payload);
      }
      setShowFormModal(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return 'bg-emerald-50 text-emerald-600';
      case 'en_proceso':
        return 'bg-blue-50 text-blue-600';
      case 'cerrado':
        return 'bg-gray-100 text-gray-500';
      case 'cancelado':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getTipoStyle = (tipo: string) => {
    return tipo === 'vacacional'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-purple-50 text-purple-600';
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Curso',
      sortable: true,
      render: (item: Curso) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <AcademicCapIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
            <p className="text-xs text-gray-400 line-clamp-1">
              {item.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (item: Curso) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${getTipoStyle(
            item.tipo
          )}`}
        >
          {item.tipo}
        </span>
      ),
    },
    {
      key: 'fechas',
      header: 'Fechas',
      render: (item: Curso) => (
        <div className="text-sm text-gray-600">
          <p>{item.fecha_inicio}</p>
          <p className="text-xs text-gray-400">{item.fecha_fin}</p>
        </div>
      ),
    },
    {
      key: 'precio',
      header: 'Precio',
      render: (item: Curso) => (
        <span className="text-sm font-medium text-gray-900">
          ${item.precio || '0.00'}
        </span>
      ),
    },
    {
      key: 'cupo',
      header: 'Cupo',
      render: (item: Curso) => (
        <span className="text-sm text-gray-600">
          {item.cupo_actual || 0} / {item.cupo_maximo || '∞'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Curso) => (
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
      key: 'acciones',
      header: '',
      render: (item: Curso) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedCurso(item);
              setShowModal(true);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id_curso)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <AcademicCapIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Cursos Vacacionales
              </h1>
              <p className="text-xs text-gray-500">{total} registros</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Curso
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar curso..."
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
                <option value="abierto">Abierto</option>
                <option value="en_proceso">En proceso</option>
                <option value="cerrado">Cerrado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select
                value={filters.tipo}
                onChange={(e) =>
                  setFilters({ ...filters, tipo: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todos los tipos</option>
                <option value="vacacional">Vacacional</option>
                <option value="permanente">Permanente</option>
              </select>
              <button
                onClick={() => setFilters({ estado: '', tipo: '' })}
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
            keyExtractor={(item) => item.id_curso}
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

        {/* Modal de detalle */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Detalle del Curso"
          size="lg"
        >
          {selectedCurso && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <AcademicCapIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedCurso.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCurso.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Tipo</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getTipoStyle(
                      selectedCurso.tipo
                    )}`}
                  >
                    {selectedCurso.tipo}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(
                      selectedCurso.estado
                    )}`}
                  >
                    {selectedCurso.estado}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Fecha Inicio</p>
                  <p className="text-gray-900">{selectedCurso.fecha_inicio}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Fecha Fin</p>
                  <p className="text-gray-900">{selectedCurso.fecha_fin}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Precio</p>
                  <p className="text-gray-900">
                    ${selectedCurso.precio || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cupo</p>
                  <p className="text-gray-900">
                    {selectedCurso.cupo_actual || 0} /{' '}
                    {selectedCurso.cupo_maximo || 'Sin límite'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs mb-1">Representante</p>
                  <p className="text-gray-900">
                    {selectedCurso.representante || '-'}
                  </p>
                </div>
                {selectedCurso.email_representante && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Email</p>
                    <p className="text-gray-900">
                      {selectedCurso.email_representante}
                    </p>
                  </div>
                )}
                {selectedCurso.telefono_representante && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Teléfono</p>
                    <p className="text-gray-900">
                      {selectedCurso.telefono_representante}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Modal de formulario */}
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={`${editingCurso ? 'Editar' : 'Nuevo'} Curso Vacacional`}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre del Curso *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_fin: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipo: e.target.value as 'vacacional' | 'permanente',
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                >
                  <option value="vacacional">Vacacional</option>
                  <option value="permanente">Permanente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cupo Máximo
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cupo_maximo}
                  onChange={(e) =>
                    setFormData({ ...formData, cupo_maximo: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Precio ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Representante *
                </label>
                <input
                  type="text"
                  value={formData.representante}
                  onChange={(e) =>
                    setFormData({ ...formData, representante: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Representante
                </label>
                <input
                  type="email"
                  value={formData.email_representante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email_representante: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teléfono Representante
                </label>
                <input
                  type="tel"
                  value={formData.telefono_representante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefono_representante: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
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
                {isSubmitting
                  ? 'Guardando...'
                  : editingCurso
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar curso?"
          message="Esta acción no se puede deshacer. El curso será eliminado permanentemente."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
