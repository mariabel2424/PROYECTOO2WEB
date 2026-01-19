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
import type { Factura } from '@/types';

export default function PagarFacturaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [factura, setFactura] = useState<Factura | null>(null);
  const [formData, setFormData] = useState({
    monto: '',
    metodo_pago: 'efectivo',
    referencia: '',
    observaciones: '',
  });

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const data = await facturasService.getById(id);
        setFactura(data);
        setFormData((prev) => ({ ...prev, monto: String(data.total) }));
      } catch (err) {
        setError('Error al cargar la factura');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchFactura();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await facturasService.registrarPago(id, {
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago as
          | 'efectivo'
          | 'transferencia'
          | 'tarjeta'
          | 'otro',
        referencia: formData.referencia || undefined,
        observaciones: formData.observaciones || undefined,
        fecha_pago: new Date().toISOString().split('T')[0],
      });
      router.push('/finanzas/facturas');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrar el pago';
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
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {factura && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Factura: {factura.numero}
                </p>
                <p className="text-sm text-gray-600">
                  Concepto: {factura.concepto}
                </p>
                <p className="text-lg font-bold mt-2">
                  Total a pagar: ${factura.total.toFixed(2)}
                </p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Monto ($)"
                name="monto"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={handleChange}
                required
              />
              <Select
                label="Método de Pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                options={[
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'transferencia', label: 'Transferencia' },
                  { value: 'tarjeta', label: 'Tarjeta' },
                  { value: 'otro', label: 'Otro' },
                ]}
              />
              <Input
                label="Referencia / Comprobante"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                placeholder="Número de transacción, etc."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={2}
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
                  {loading ? 'Procesando...' : 'Registrar Pago'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
