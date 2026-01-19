'use client';

import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, Table, Pagination, Modal } from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { categoriasService } from '@/services/categorias.service';
import type { Categoria } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

export default function CategoriasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: '',
    edad_minima: '',
    edad_maxima: '',
    descripcion: '',
  });

  const fetchCategorias = useCallback(
    (params: Parameters<typeof categoriasService.getAllPaginated>[0]) =>
      categoriasService.getAllPaginated(params),
    []
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
  } = usePagination<Categoria>(fetchCategorias);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formData.nombre,
        edad_minima: formData.edad_minima
          ? Number(formData.edad_minima)
          : undefined,
        edad_maxima: formData.edad_maxima
          ? Number(formData.edad_maxima)
          : undefined,
        descripcion: formData.descripcion || undefined,
      };
      if (editingCategoria) {
        await categoriasService.update(editingCategoria.id_categoria, payload);
      } else {
        await categoriasService.create(payload);
      }
      setShowModal(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error guardando categoría:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      edad_minima: categoria.edad_minima?.toString() || '',
      edad_maxima: categoria.edad_maxima?.toString() || '',
      descripcion: categoria.descripcion || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta categoría?')) {
      try {
        await categoriasService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      edad_minima: '',
      edad_maxima: '',
      descripcion: '',
    });
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (item: Categoria) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-50 rounded flex items-center justify-center">
            <TagIcon className="h-3 w-3 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {item.nombre}
          </span>
        </div>
      ),
    },
    {
      key: 'edad_minima',
      header: 'Edad Mín',
      render: (item: Categoria) => (
        <span className="text-sm text-gray-600">
          {item.edad_minima ? `${item.edad_minima} años` : '-'}
        </span>
      ),
    },
    {
      key: 'edad_maxima',
      header: 'Edad Máx',
      render: (item: Categoria) => (
        <span className="text-sm text-gray-600">
          {item.edad_maxima ? `${item.edad_maxima} años` : '-'}
        </span>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (item: Categoria) => (
        <span className="text-sm text-gray-500 line-clamp-1">
          {item.descripcion || '-'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: Categoria) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id_categoria)}
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
              <TagIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Categorías
              </h1>
              <p className="text-xs text-gray-500">{total} registros</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(item) => item.id_categoria}
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
          title={`${editingCategoria ? 'Editar' : 'Nueva'} Categoría`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Edad Mínima
                </label>
                <input
                  type="number"
                  value={formData.edad_minima}
                  onChange={(e) =>
                    setFormData({ ...formData, edad_minima: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Edad Máxima
                </label>
                <input
                  type="number"
                  value={formData.edad_maxima}
                  onChange={(e) =>
                    setFormData({ ...formData, edad_maxima: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              <Button type="submit" size="sm">
                {editingCategoria ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
