'use client';

import { useState, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  Button,
  Table,
  Pagination,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { deportistasService } from '@/services/deportistas.service';
import { categoriasService } from '@/services/categorias.service';
import type { Deportista, Categoria } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function DeportistasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeportista, setSelectedDeportista] =
    useState<Deportista | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDeportista, setEditingDeportista] = useState<Deportista | null>(
    null
  );
  const [filters, setFilters] = useState({ estado: '', id_categoria: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: 'M',
    id_categoria: '',
    peso: '',
    altura: '',
    direccion: '',
    telefono: '',
    email: '',
  });

  useEffect(() => {
    categoriasService.getAll().then(setCategorias).catch(console.error);
  }, []);

  const fetchDeportistas = useCallback(
    (params: Parameters<typeof deportistasService.getAll>[0]) =>
      deportistasService.getAll({ ...params, ...filters }),
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
  } = usePagination<Deportista>(fetchDeportistas);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deportistasService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (deportista: Deportista) => {
    setEditingDeportista(deportista);
    setFormData({
      nombres: deportista.nombres || '',
      apellidos: deportista.apellidos || '',
      cedula: deportista.cedula || '',
      fecha_nacimiento: deportista.fecha_nacimiento || '',
      genero: deportista.genero || 'M',
      id_categoria: deportista.id_categoria?.toString() || '',
      peso: deportista.peso?.toString() || '',
      altura: deportista.altura?.toString() || '',
      direccion: deportista.direccion || '',
      telefono: deportista.telefono || '',
      email: deportista.email || '',
    });
    setShowFormModal(true);
  };

  const resetForm = () => {
    setEditingDeportista(null);
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      fecha_nacimiento: '',
      genero: 'M',
      id_categoria: '',
      peso: '',
      altura: '',
      direccion: '',
      telefono: '',
      email: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genero: formData.genero as 'M' | 'F',
        id_categoria: formData.id_categoria
          ? Number(formData.id_categoria)
          : undefined,
        peso: formData.peso ? Number(formData.peso) : undefined,
        altura: formData.altura ? Number(formData.altura) : undefined,
      };
      if (editingDeportista) {
        await deportistasService.update(
          editingDeportista.id_deportista,
          payload
        );
      } else {
        await deportistasService.create(payload);
      }
      setShowFormModal(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Participante',
      sortable: true,
      render: (item: Deportista) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-sm font-medium">
            {item.nombres?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {item.nombres} {item.apellidos}
            </p>
            <p className="text-xs text-gray-400">
              {item.cedula || 'Sin cédula'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (item: Deportista) => (
        <span className="text-sm text-gray-600">
          {item.categoria?.nombre || '-'}
        </span>
      ),
    },
    {
      key: 'edad',
      header: 'Edad',
      render: (item: Deportista) => (
        <span className="text-sm text-gray-600">
          {item.edad ? `${item.edad} años` : '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Deportista) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.estado === 'activo'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: Deportista) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedDeportista(item);
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
            onClick={() => handleDelete(item.id_deportista)}
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
            <div className="p-2 bg-indigo-50 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Participantes
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
            Nuevo
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar participante..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
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
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <select
                value={filters.id_categoria}
                onChange={(e) =>
                  setFilters({ ...filters, id_categoria: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setFilters({ estado: '', id_categoria: '' })}
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
            keyExtractor={(item) => item.id_deportista}
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

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Detalle"
          size="lg"
        >
          {selectedDeportista && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-lg font-medium">
                  {selectedDeportista.nombres?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedDeportista.nombres} {selectedDeportista.apellidos}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedDeportista.cedula || 'Sin cédula'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-gray-900">
                    {selectedDeportista.fecha_nacimiento || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Género</p>
                  <p className="text-gray-900">
                    {selectedDeportista.genero === 'M'
                      ? 'Masculino'
                      : 'Femenino'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Categoría</p>
                  <p className="text-gray-900">
                    {selectedDeportista.categoria?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedDeportista.estado === 'activo'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {selectedDeportista.estado === 'activo'
                      ? 'Activo'
                      : 'Inactivo'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Peso</p>
                  <p className="text-gray-900">
                    {selectedDeportista.peso
                      ? `${selectedDeportista.peso} kg`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Altura</p>
                  <p className="text-gray-900">
                    {selectedDeportista.altura
                      ? `${selectedDeportista.altura} cm`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={`${editingDeportista ? 'Editar' : 'Nuevo'} Deportista`}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) =>
                    setFormData({ ...formData, apellidos: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cédula
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) =>
                    setFormData({ ...formData, cedula: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_nacimiento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Género
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) =>
                    setFormData({ ...formData, genero: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.id_categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, id_categoria: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Seleccionar</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) =>
                    setFormData({ ...formData, peso: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={formData.altura}
                  onChange={(e) =>
                    setFormData({ ...formData, altura: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowFormModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                {editingDeportista ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar deportista?"
          message="Esta acción no se puede deshacer. El deportista será eliminado permanentemente."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
