'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { pagosService } from '@/services/finanzas.service';
import type { Pago } from '@/types';
import {
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPagos();
  }, []);

  const loadPagos = async () => {
    try {
      const res = await pagosService.getAll();
      setPagos(res.data);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (id: number) => {
    try {
      await pagosService.verificar(id);
      loadPagos();
    } catch (error) {
      console.error('Error verificando pago:', error);
    }
  };

  const handleRechazar = async (id: number) => {
    const motivo = prompt('Motivo del rechazo:');
    if (motivo) {
      try {
        await pagosService.rechazar(id, motivo);
        loadPagos();
      } catch (error) {
        console.error('Error rechazando pago:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este pago?')) {
      try {
        await pagosService.delete(id);
        loadPagos();
      } catch (error) {
        console.error('Error eliminando pago:', error);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CreditCardIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pagos</h1>
            <p className="text-xs text-gray-500">{pagos.length} registros</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Factura
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr
                  key={pago.id_pago}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {pago.factura?.numero || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    ${pago.monto.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(pago.fecha_pago).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                    {pago.metodo_pago}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        pago.estado === 'verificado'
                          ? 'bg-emerald-50 text-emerald-600'
                          : pago.estado === 'pendiente'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {pago.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleVerificar(pago.id_pago)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Verificar"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRechazar(pago.id_pago)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(pago.id_pago)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No hay pagos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
