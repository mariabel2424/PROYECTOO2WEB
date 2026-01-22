import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PhotoIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ComprobanteViewerProps {
  imageUrl?: string;
  metodoPago?: string;
  referencia?: string;
  observaciones?: string;
}

export function ComprobanteViewer({
  imageUrl,
  metodoPago,
  referencia,
  observaciones,
}: ComprobanteViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center bg-gray-50">
        <PhotoIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          No se ha subido comprobante de pago
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <img
              src={imageUrl}
              alt="Comprobante de pago"
              className="w-full h-48 object-contain bg-gray-50"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 border-t space-y-2 text-sm">
            {metodoPago && (
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span className="font-medium capitalize">{metodoPago}</span>
              </div>
            )}
            {referencia && (
              <div className="flex justify-between">
                <span className="text-gray-600">Referencia:</span>
                <span className="font-medium">{referencia}</span>
              </div>
            )}
            {observaciones && (
              <div>
                <span className="text-gray-600">Observaciones:</span>
                <p className="text-gray-900 mt-1">{observaciones}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Ver comprobante en tamaño completo
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Comprobante de Pago"
        size="xl"
      >
        <div className="space-y-4">
          <img
            src={imageUrl}
            alt="Comprobante de pago"
            className="w-full h-auto rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {metodoPago && (
              <div>
                <p className="text-sm text-gray-600">Método de pago</p>
                <p className="font-medium capitalize">{metodoPago}</p>
              </div>
            )}
            {referencia && (
              <div>
                <p className="text-sm text-gray-600">Referencia</p>
                <p className="font-medium">{referencia}</p>
              </div>
            )}
            {observaciones && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Observaciones</p>
                <p className="font-medium">{observaciones}</p>
              </div>
            )}
          </div>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Abrir imagen en nueva pestaña
          </a>
        </div>
      </Modal>
    </>
  );
}
