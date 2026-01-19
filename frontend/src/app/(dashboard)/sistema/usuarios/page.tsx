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
import { usuariosService, rolesService } from '@/services/usuarios.service';
import type { Usuario, Rol } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function UsuariosPage() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ status: '', id_rol: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    cedula: '',
    telefono: '',
    id_rol: '',
    password: '',
  });

  useEffect(() => {
    rolesService
      .getAll()
      .then((res: any) => {
        // Handle both array and { data: array } responses
        const rolesData = Array.isArray(res) ? res : res?.data || [];
        setRoles(rolesData);
      })
      .catch(console.error);
  }, []);

  const fetchUsuarios = useCallback(
    (params: Parameters<typeof usuariosService.getAll>[0]) => {
      // Solo incluir filtros que tengan valor
      const activeFilters: Record<string, string> = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.id_rol) activeFilters.id_rol = filters.id_rol;
      return usuariosService.getAll({ ...params, ...activeFilters });
    },
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
  } = usePagination<Usuario>(fetchUsuarios);

  const handleCambiarEstado = async (id: number, estado: string) => {
    await usuariosService.cambiarEstado(id, estado);
    refetch();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await usuariosService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      cedula: usuario.cedula || '',
      telefono: usuario.telefono || '',
      id_rol: usuario.id_rol?.toString() || '',
      password: '',
    });
    setShowFormModal(true);
  };

  const resetForm = () => {
    setEditingUsuario(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      cedula: '',
      telefono: '',
      id_rol: '',
      password: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        const updatePayload: Partial<Usuario> & { password?: string } = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
          id_rol: formData.id_rol ? Number(formData.id_rol) : undefined,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await usuariosService.update(editingUsuario.id_usuario, updatePayload);
      } else {
        await usuariosService.create({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
          id_rol: formData.id_rol ? Number(formData.id_rol) : undefined,
          password: formData.password,
        });
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
      header: 'Usuario',
      sortable: true,
      render: (item: Usuario) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 text-sm font-medium">
            {item.nombre?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {item.nombre} {item.apellido}
            </p>
            <p className="text-xs text-gray-400">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (item: Usuario) => (
        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
          {item.rol?.nombre || 'Sin rol'}
        </span>
      ),
    },
    {
      key: 'cedula',
      header: 'Cédula',
      render: (item: Usuario) => (
        <span className="text-sm text-gray-600">{item.cedula || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item: Usuario) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.status === 'activo'
              ? 'bg-emerald-50 text-emerald-600'
              : item.status === 'suspendido'
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {item.status === 'activo'
            ? 'Activo'
            : item.status === 'suspendido'
            ? 'Suspendido'
            : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: Usuario) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedUsuario(item);
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
            onClick={() => handleDelete(item.id_usuario)}
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
            <div className="p-2 bg-purple-50 rounded-lg">
              <UsersIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Usuarios</h1>
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
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-purple-50 border-purple-200 text-purple-600'
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
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
              <select
                value={filters.id_rol}
                onChange={(e) =>
                  setFilters({ ...filters, id_rol: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setFilters({ status: '', id_rol: '' })}
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
            keyExtractor={(item) => item.id_usuario}
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
          title="Detalle del Usuario"
          size="lg"
        >
          {selectedUsuario && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-lg font-medium">
                  {selectedUsuario.nombre?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedUsuario.nombre} {selectedUsuario.apellido}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedUsuario.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cédula</p>
                  <p className="text-gray-900">
                    {selectedUsuario.cedula || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Teléfono</p>
                  <p className="text-gray-900">
                    {selectedUsuario.telefono || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Rol</p>
                  <p className="text-gray-900">
                    {selectedUsuario.rol?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedUsuario.status === 'activo'
                        ? 'bg-emerald-50 text-emerald-600'
                        : selectedUsuario.status === 'suspendido'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {selectedUsuario.status === 'activo'
                      ? 'Activo'
                      : selectedUsuario.status === 'suspendido'
                      ? 'Suspendido'
                      : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs mb-2">Cambiar Estado</p>
                <select
                  value={selectedUsuario.status}
                  onChange={(e) =>
                    handleCambiarEstado(
                      selectedUsuario.id_usuario,
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={`${editingUsuario ? 'Editar' : 'Nuevo'} Usuario`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                required
              />
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
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
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
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rol
                </label>
                <select
                  value={formData.id_rol}
                  onChange={(e) =>
                    setFormData({ ...formData, id_rol: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  {...(!editingUsuario && { required: true })}
                />
              </div>
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
                {editingUsuario ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar usuario?"
          message="Esta acción no se puede deshacer."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
