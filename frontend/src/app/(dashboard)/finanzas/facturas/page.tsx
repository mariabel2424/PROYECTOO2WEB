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
import { facturasService } from '@/services/finanzas.service';
import { usuariosService } from '@/services/usuarios.service';
import type { Factura, Usuario } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  CreditCardIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function FacturasPage() {
  const [tutores, setTutores] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingEstado, setIsChangingEstado] = useState(false);
  const [filters, setFilters] = useState({ estado: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    concepto: '',
    id_tutor: '',
    subtotal: '',
    descuento: '',
    impuesto: '',
    fecha_emision: '',
    fecha_vencimiento: '',
  });

  useEffect(() => {
    usuariosService
      .getAll({ per_page: 1000, rol: 'tutor' })
      .then((res: any) => {
        let tutoresData: Usuario[] = [];
        if (res?.data && Array.isArray(res.data)) {
          tutoresData = res.data;
        } else if (Array.isArray(res)) {
          tutoresData = res;
        }
        setTutores(tutoresData);
      })
      .catch((err) => {
        console.error('Error cargando tutores:', err);
        setTutores([]);
      });
  }, []);

  const fetchFacturas = useCallback(
    (params: Parameters<typeof facturasService.getAll>[0]) =>
      facturasService.getAll({ ...params, ...filters }),
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
  } = usePagination<Factura>(fetchFacturas);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleMarcarPagada = async (factura: Factura) => {
    if (factura.estado !== 'pendiente') return;
    try {
      await facturasService.cambiarEstado(factura.id_factura, 'pagada');
      refetch();
    } catch (error) {
      console.error('Error al marcar como pagada:', error);
    }
  };

  const handleDescargarPDF = (factura: Factura) => {
    // Crear contenido HTML para el PDF
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${factura.numero || factura.id_factura}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
          .header h1 { color: #4f46e5; margin: 0; font-size: 28px; }
          .header p { margin: 5px 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; }
          .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          .estado { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .estado-pagada { background: #d1fae5; color: #065f46; }
          .estado-pendiente { background: #fef3c7; color: #92400e; }
          .estado-vencida { background: #fee2e2; color: #991b1b; }
          .totales { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .total-row.final { font-size: 18px; font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 15px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURA</h1>
          <p><strong>N° ${
            factura.numero || 'FAC-' + factura.id_factura
          }</strong></p>
          <p>Cursos Vacacionales</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <h3>Datos del Cliente</h3>
            <p><strong>${
              factura.tutor
                ? `${factura.tutor.nombre} ${factura.tutor.apellido}`
                : factura.usuario?.nombre || 'N/A'
            }</strong></p>
            <p>${factura.tutor?.email || factura.usuario?.email || ''}</p>
          </div>
          <div class="info-box">
            <h3>Datos de la Factura</h3>
            <p><strong>Fecha:</strong> ${factura.fecha_emision || 'N/A'}</p>
            <p><strong>Vencimiento:</strong> ${
              factura.fecha_vencimiento || 'N/A'
            }</p>
            <p><strong>Estado:</strong> <span class="estado estado-${
              factura.estado
            }">${factura.estado?.toUpperCase()}</span></p>
          </div>
        </div>

        <div class="info-box">
          <h3>Concepto</h3>
          <p>${factura.concepto || 'Inscripción a curso vacacional'}</p>
        </div>

        <div class="totales">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${Number(factura.subtotal || 0).toFixed(2)}</span>
          </div>
          ${
            factura.descuento
              ? `
          <div class="total-row" style="color: #059669;">
            <span>Descuento:</span>
            <span>-$${Number(factura.descuento).toFixed(2)}</span>
          </div>
          `
              : ''
          }
          ${
            factura.impuesto
              ? `
          <div class="total-row">
            <span>Impuesto:</span>
            <span>$${Number(factura.impuesto).toFixed(2)}</span>
          </div>
          `
              : ''
          }
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>$${Number(factura.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Gracias por su preferencia</p>
          <p>Documento generado el ${new Date().toLocaleDateString('es-EC', {
            timeZone: 'America/Guayaquil',
          })}</p>
        </div>
      </body>
      </html>
    `;

    // Abrir ventana de impresión
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.print();
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await facturasService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleCambiarEstado = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowEstadoModal(true);
  };

  const confirmCambiarEstado = async (
    nuevoEstado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada'
  ) => {
    if (!selectedFactura) return;
    setIsChangingEstado(true);
    try {
      await facturasService.cambiarEstado(
        selectedFactura.id_factura,
        nuevoEstado
      );
      refetch();
      setShowEstadoModal(false);
      setSelectedFactura(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsChangingEstado(false);
    }
  };

  const handleEdit = (factura: Factura) => {
    setEditingFactura(factura);
    setFormData({
      numero: factura.numero || '',
      concepto: factura.concepto || '',
      id_tutor: factura.id_tutor?.toString() || '',
      subtotal: factura.subtotal?.toString() || '',
      descuento: factura.descuento?.toString() || '',
      impuesto: factura.impuesto?.toString() || '',
      fecha_emision: factura.fecha_emision || '',
      fecha_vencimiento: factura.fecha_vencimiento || '',
    });
    setShowFormModal(true);
  };

  const resetForm = () => {
    setEditingFactura(null);
    setFormData({
      numero: '',
      concepto: '',
      id_tutor: '',
      subtotal: '',
      descuento: '',
      impuesto: '',
      fecha_emision: '',
      fecha_vencimiento: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id_tutor: formData.id_tutor ? Number(formData.id_tutor) : undefined,
        subtotal: Number(formData.subtotal),
        descuento: formData.descuento ? Number(formData.descuento) : 0,
        impuesto: formData.impuesto ? Number(formData.impuesto) : 0,
      };
      if (editingFactura) {
        await facturasService.update(editingFactura.id_factura, payload);
      } else {
        await facturasService.create(payload);
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
      key: 'numero',
      header: 'Número',
      sortable: true,
      render: (item: Factura) => (
        <span className="text-sm font-medium text-gray-900">{item.numero}</span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (item: Factura) => (
        <span className="text-sm text-gray-600">
          {item.tutor
            ? `${item.tutor.nombre} ${item.tutor.apellido}`
            : item.usuario?.nombre || '-'}
        </span>
      ),
    },
    {
      key: 'concepto',
      header: 'Concepto',
      render: (item: Factura) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {item.concepto}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (item: Factura) => (
        <span className="text-sm font-medium text-gray-900">
          ${Number(item.total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'fecha_emision',
      header: 'Fecha',
      sortable: true,
      render: (item: Factura) => (
        <span className="text-sm text-gray-600">{item.fecha_emision}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Factura) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.estado === 'pagada'
              ? 'bg-emerald-50 text-emerald-600'
              : item.estado === 'pendiente'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {item.estado === 'pagada'
            ? 'Pagada'
            : item.estado === 'pendiente'
            ? 'Pendiente'
            : 'Vencida'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: Factura) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedFactura(item);
              setShowModal(true);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDescargarPDF(item)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Descargar PDF"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          {item.estado === 'pendiente' && (
            <button
              onClick={() => handleMarcarPagada(item)}
              title="Marcar como pagada"
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <CreditCardIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id_factura)}
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
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Facturas</h1>
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
            Nueva
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Facturado</p>
            <p className="text-lg font-semibold text-gray-900">$0.00</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Pagadas</p>
            <p className="text-lg font-semibold text-emerald-600">$0.00</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold text-amber-600">$0.00</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Vencidas</p>
            <p className="text-lg font-semibold text-red-600">$0.00</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar factura..."
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
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">Todos los estados</option>
                <option value="pagada">Pagada</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencida">Vencida</option>
              </select>
              <button
                onClick={() => setFilters({ estado: '' })}
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
            keyExtractor={(item) => item.id_factura}
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
          title={`Factura ${selectedFactura?.numero}`}
          size="lg"
        >
          {selectedFactura && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cliente</p>
                  <p className="text-gray-900">
                    {selectedFactura.tutor
                      ? `${selectedFactura.tutor.nombre} ${selectedFactura.tutor.apellido}`
                      : selectedFactura.usuario?.nombre || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedFactura.estado === 'pagada'
                        ? 'bg-emerald-50 text-emerald-600'
                        : selectedFactura.estado === 'pendiente'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {selectedFactura.estado === 'pagada'
                      ? 'Pagada'
                      : selectedFactura.estado === 'pendiente'
                      ? 'Pendiente'
                      : 'Vencida'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Fecha Emisión</p>
                  <p className="text-gray-900">
                    {selectedFactura.fecha_emision}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">
                    Fecha Vencimiento
                  </p>
                  <p className="text-gray-900">
                    {selectedFactura.fecha_vencimiento || '-'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-400 text-xs mb-1">Concepto</p>
                <p className="text-sm text-gray-900">
                  {selectedFactura.concepto}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    ${Number(selectedFactura.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {selectedFactura.descuento && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento</span>
                    <span>
                      -${Number(selectedFactura.descuento || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedFactura.impuesto && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Impuesto</span>
                    <span className="text-gray-900">
                      ${Number(selectedFactura.impuesto || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${Number(selectedFactura.total || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleDescargarPDF(selectedFactura)}
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={`${editingFactura ? 'Editar' : 'Nueva'} Factura`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cliente (Tutor)
                </label>
                <select
                  value={formData.id_tutor}
                  onChange={(e) =>
                    setFormData({ ...formData, id_tutor: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="">Seleccionar</option>
                  {tutores.map((t) => (
                    <option key={t.id_usuario} value={t.id_usuario}>
                      {t.nombre} {t.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Concepto
              </label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) =>
                  setFormData({ ...formData, concepto: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subtotal
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) =>
                    setFormData({ ...formData, subtotal: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Descuento
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.descuento}
                  onChange={(e) =>
                    setFormData({ ...formData, descuento: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Impuesto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.impuesto}
                  onChange={(e) =>
                    setFormData({ ...formData, impuesto: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Emisión
                </label>
                <input
                  type="date"
                  value={formData.fecha_emision}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_emision: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_vencimiento: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
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
                {editingFactura ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar factura?"
          message="Esta acción no se puede deshacer."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
