'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { facturasService } from '@/services/finanzas.service';
import { usuariosService } from '@/services/usuarios.service';
import type { Usuario } from '@/types';

export default function EditarFacturaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [tutores, setTutores] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    numero: '',
    id_tutor: '',
    concepto: '',
    subtotal: '',
    descuento: '',
    impuesto: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    observaciones: '',
    estado: 'pendiente',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [factura, tuts] = await Promise.all([
          facturasService.getById(id),
          usuariosService.getAll({ per_page: 100, rol: 'tutor' }),
        ]);
        setTutores(tuts.data);
        setFormData({
          numero: factura.numero || '',
          id_tutor: factura.id_tutor ? String(factura.id_tutor) : '',
          concepto: factura.concepto || '',
          subtotal: String(factura.subtotal || ''),
          descuento: factura.descuento ? String(factura.descuento) : '',
          impuesto: factura.impuesto ? String(factura.impuesto) : '',
          fecha_emision: factura.fecha_emision || '',
          fecha_vencimiento: factura.fecha_vencimiento || '',
          observaciones: factura.observaciones || '',
          estado: factura.estado || 'pendiente',
        });
      } catch (err) {
        setError('Error al cargar la factura');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calcularTotal = () => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const descuento = parseFloat(formData.descuento) || 0;
    const impuesto = parseFloat(formData.impuesto) || 0;
    return subtotal - descuento + impuesto;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await facturasService.update(id, {
        numero: formData.numero,
        id_tutor: formData.id_tutor ? parseInt(formData.id_tutor) : undefined,
        concepto: formData.concepto,
        subtotal: parseFloat(formData.subtotal) || 0,
        descuento: formData.descuento
          ? parseFloat(formData.descuento)
          : undefined,
        impuesto: formData.impuesto ? parseFloat(formData.impuesto) : undefined,
        total: calcularTotal(),
        fecha_emision: formData.fecha_emision,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        observaciones: formData.observaciones || undefined,
        estado: formData.estado as
          | 'pendiente'
          | 'pagada'
          | 'anulada'
          | 'vencida',
      });
      router.push('/finanzas/facturas');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Editar Factura</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número de Factura"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Cliente (Tutor)"
                  name="id_tutor"
                  value={formData.id_tutor}
                  onChange={handleChange}
                  placeholder="Seleccionar"
                  options={tutores.map((t) => ({
                    value: t.id_usuario,
                    label: `${t.nombre} ${t.apellido}`,
                  }))}
                />
              </div>
              <Input
                label="Concepto"
                name="concepto"
                value={formData.concepto}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Subtotal ($)"
                  name="subtotal"
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Descuento ($)"
                  name="descuento"
                  type="number"
                  step="0.01"
                  value={formData.descuento}
                  onChange={handleChange}
                />
                <Input
                  label="Impuesto ($)"
                  name="impuesto"
                  type="number"
                  step="0.01"
                  value={formData.impuesto}
                  onChange={handleChange}
                />
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-lg font-bold">
                  Total: ${calcularTotal().toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha Emisión"
                  name="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Fecha Vencimiento"
                  name="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                />
              </div>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                options={[
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'pagada', label: 'Pagada' },
                  { value: 'anulada', label: 'Anulada' },
                  { value: 'vencida', label: 'Vencida' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
