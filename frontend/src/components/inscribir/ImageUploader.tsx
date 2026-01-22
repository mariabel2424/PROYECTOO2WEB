import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export function ImageUploader({ onImageUpload, currentImage, label = 'Comprobante de pago' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Intenta con el preset configurado, si falla usa el preset por defecto
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'comprobantes_pago');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    
    if (cloudName === 'your-cloud-name') {
      throw new Error('Configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en .env.local');
    }
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Cloudinary:', errorData);
      throw new Error(errorData.error?.message || 'Error al subir la imagen');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      onImageUpload(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>

      {!preview ? (
        <div
          onClick={handleClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Spinner size="lg" />
              <p className="mt-2 text-sm text-gray-600">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Haz clic para subir el comprobante
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG hasta 5MB
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative border border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Comprobante de pago"
            className="w-full h-64 object-contain bg-gray-50"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleClick}
            className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-1 text-sm"
            type="button"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Cambiar
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Sube una foto o captura de pantalla de tu comprobante de pago
      </p>
    </div>
  );
}
