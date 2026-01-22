import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Curso } from '@/types';

interface CursoCardProps {
  curso: Curso;
  isSelected: boolean;
  onSelect: (id: number) => void;
  searchTerm?: string;
}

export function CursoCard({ curso, isSelected, onSelect, searchTerm }: CursoCardProps) {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const highlightText = (text: string, search?: string) => {
    if (!search || !search.trim()) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <button
      onClick={() => onSelect(curso.id_curso)}
      className={`w-full p-4 text-left border rounded-lg transition-all ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {highlightText(curso.nombre, searchTerm)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(curso.fecha_inicio)} - {formatDate(curso.fecha_fin)}
          </p>
          {curso.descripcion && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
              {highlightText(curso.descripcion, searchTerm)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4">
          <p className="font-semibold text-indigo-600 whitespace-nowrap">
            {formatCurrency(curso.precio || 0)}
          </p>
          {isSelected && (
            <CheckCircleIcon className="h-6 w-6 text-indigo-600 flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
