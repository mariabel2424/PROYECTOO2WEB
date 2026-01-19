'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { configuracionesService } from '@/services/sistema.service';
import { Button } from '@/components/ui/Button';
import type { Configuracion } from '@/types';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  Cog6ToothIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function ConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuracion | null>(
    null
  );
  const [formData, setFormData] = useState({
    clave: '',
    valor: '',
    grupo: '',
    descripcion: '',
  });
  const [filtroGrupo, setFiltroGrupo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const configRes = await configuracionesService.getAll();
      const configs = Array.isArray(configRes?.data) ? configRes.data : [];
      setConfiguraciones(configs);
      // Extraer grupos únicos de las configuraciones
      const gruposUnicos = [
        ...new Set(configs.map((c) => c.grupo).filter(Boolean)),
      ] as string[];
      setGrupos(gruposUnicos);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      setConfiguraciones([]);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await configuracionesService.update(
          editingConfig.id_configuracion,
          formData
        );
      } else {
        await configuracionesService.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const handleEdit = (config: Configuracion) => {
    setEditingConfig(config);
    setFormData({
      clave: config.clave,
      valor: config.valor,
      grupo: config.grupo || '',
      descripcion: config.descripcion || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta configuración?')) {
      try {
        await configuracionesService.delete(id);
        loadData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({ clave: '', valor: '', grupo: '', descripcion: '' });
  };
  const configsFiltradas = filtroGrupo
    ? (configuraciones || []).filter((c) => c.grupo === filtroGrupo)
    : configuraciones || [];

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Configuración
              </h1>
              <p className="text-xs text-gray-500">
                {configuraciones.length} parámetros
              </p>
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

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
          >
            <option value="">Todos los grupos</option>
            {grupos.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Clave
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Grupo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {configsFiltradas.map((config) => (
                <tr
                  key={config.id_configuracion}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {config.clave}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {config.valor}
                  </td>
                  <td className="px-4 py-3">
                    {config.grupo && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                        {config.grupo}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {config.descripcion || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id_configuracion)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {configsFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No hay configuraciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingConfig ? 'Editar' : 'Nueva'} Configuración
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Clave
                  </label>
                  <input
                    type="text"
                    value={formData.clave}
                    onChange={(e) =>
                      setFormData({ ...formData, clave: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                    required
                    disabled={!!editingConfig}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({ ...formData, valor: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Grupo
                  </label>
                  <input
                    type="text"
                    value={formData.grupo}
                    onChange={(e) =>
                      setFormData({ ...formData, grupo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                    list="grupos-list"
                  />
                  <datalist id="grupos-list">
                    {grupos.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
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
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
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
                    {editingConfig ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
