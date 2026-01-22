import { CheckCircleIcon } from '@heroicons/react/24/outline';
import type { GrupoCurso } from '@/types';

interface GrupoCardProps {
  grupo: GrupoCurso;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function GrupoCard({ grupo, isSelected, onSelect }: GrupoCardProps) {
  const cupos = grupo.cupo_maximo - (grupo.cupo_actual || 0);
  const full = cupos <= 0;

  const formatTime = (t: string) => {
    if (!t) return '';
    const [hr, min] = t.split(':');
    const h = parseInt(hr);
    return `${h % 12 || 12}:${min} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const getDias = (dias?: string[] | number[] | string | number) => {
    if (!Array.isArray(dias) || dias.length === 0) {
      return 'Por definir';
    }

    const map: Record<string, string> = {
      '0': 'Dom',
      '1': 'Lun',
      '2': 'Mar',
      '3': 'Mié',
      '4': 'Jue',
      '5': 'Vie',
      '6': 'Sáb',
    };

    return dias.map((d) => map[String(d)] ?? String(d)).join(', ');
  };

  return (
    <button
      onClick={() => !full && onSelect(grupo.id_grupo)}
      disabled={full}
      className={`w-full p-3 text-left border rounded-lg transition-all ${
        full
          ? 'opacity-50 cursor-not-allowed bg-gray-50'
          : isSelected
          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">{grupo.nombre}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(grupo.hora_inicio || '')} -{' '}
            {formatTime(grupo.hora_fin || '')} | {getDias(grupo.dias_semana)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              full
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {full ? 'Lleno' : `${cupos} cupos`}
          </span>
          {isSelected && !full && (
            <CheckCircleIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
