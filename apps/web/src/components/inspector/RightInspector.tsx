import React from 'react';
import { X, MapPin, FileText, CheckCircle2, AlertTriangle, HardHat, Calendar, DollarSign, Layers } from 'lucide-react';
import { PropertyItem, IncidentItem, ProjectItem } from '../../types';

interface RightInspectorProps {
  selectedEntity: {
    type: 'property' | 'incident' | 'project' | null;
    data: PropertyItem | IncidentItem | ProjectItem | null;
  };
  onClose: () => void;
  onFocusMap: (coords: [number, number]) => void;
  isDarkMode?: boolean;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  selectedEntity,
  onClose,
  onFocusMap,
  isDarkMode = true,
}) => {
  if (!selectedEntity.type || !selectedEntity.data) {
    return null;
  }

  const { type, data } = selectedEntity;

  return (
    <aside className={`w-80 border-l flex flex-col justify-between z-20 animate-in slide-in-from-right duration-200 ${
      isDarkMode 
        ? 'bg-terranova-900/95 border-terranova-800 text-white shadow-panel-dark' 
        : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
    }`}>
      {/* Header */}
      <div className={`p-3.5 border-b flex items-center justify-between ${
        isDarkMode ? 'border-terranova-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          {type === 'property' && <Layers className="w-4 h-4 text-emerald-500" />}
          {type === 'incident' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
          {type === 'project' && <HardHat className="w-4 h-4 text-amber-500" />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {type === 'property' && 'Ficha de Predio Catastral'}
            {type === 'incident' && 'Detalle de Incidencia'}
            {type === 'project' && 'Ficha Técnica de Obra'}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-terranova-800 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
          title="Cerrar Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* CASE: PROPERTY */}
        {type === 'property' && (() => {
          const prop = data as PropertyItem;
          return (
            <>
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-terranova-950/80 border-terranova-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-emerald-500 font-mono block font-bold">Clave Catastral Estandarizada</span>
                <span className="font-mono font-bold text-sm tracking-wide">{prop.cadastralKey}</span>
              </div>

              <div className="space-y-2">
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Colonia / Sector</span>
                  <span className="font-medium">{prop.neighborhood}</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Superficie Terreno</span>
                  <span className="font-mono font-bold">{prop.landArea.toLocaleString()} m²</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Superficie Construida</span>
                  <span className="font-mono font-bold">{prop.builtArea.toLocaleString()} m²</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Uso de Suelo</span>
                  <span className="px-2 py-0.5 rounded font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {prop.landUse}
                  </span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Valor Catastral Fiscal</span>
                  <span className="text-emerald-500 font-mono font-bold">
                    ${prop.cadastralValue.toLocaleString()} MXN
                  </span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60 text-gray-300' : 'border-slate-200 text-slate-700'}`}>
                  <span className="text-gray-400">Estado Administrativo</span>
                  <span className="text-emerald-500 font-semibold">{prop.status}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onFocusMap(prop.coordinates)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  Centrar en Visor GIS
                </button>
                <button
                  onClick={() => alert(`Generando Cédula Catastral Oficial en PDF para ${prop.cadastralKey}...`)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium border transition-colors ${
                    isDarkMode 
                      ? 'bg-terranova-800 hover:bg-terranova-700 text-white border-terranova-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Exportar Cédula Catastral (PDF)
                </button>
              </div>
            </>
          );
        })()}

        {/* CASE: INCIDENT */}
        {type === 'incident' && (() => {
          const inc = data as IncidentItem;
          return (
            <>
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-terranova-950/80 border-terranova-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-rose-400 font-mono font-bold">Folio de Atención</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                    inc.priority === 'Crítica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    inc.priority === 'Alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-sky-500/20 text-sky-400'
                  }`}>
                    Prioridad {inc.priority}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm">{inc.folio}</span>
              </div>

              <div>
                <p className="font-semibold text-sm mb-1">{inc.title}</p>
                <p className="text-gray-400 text-xs">{inc.neighborhood}</p>
              </div>

              <div className={`space-y-2 border-t border-b py-2 ${
                isDarkMode ? 'border-terranova-800/80 text-gray-300' : 'border-slate-200 text-slate-700'
              }`}>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo:</span>
                  <span className="font-medium">{inc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado Actual:</span>
                  <span className="text-amber-500 font-bold">{inc.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reportado:</span>
                  <span className="font-mono">{inc.reportedAt.slice(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Área Asignada:</span>
                  <span>{inc.assignedDept}</span>
                </div>
              </div>

              <button
                onClick={() => onFocusMap(inc.coordinates)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md"
              >
                <MapPin className="w-4 h-4" />
                Localizar en Mapa
              </button>
            </>
          );
        })()}

        {/* CASE: PROJECT */}
        {type === 'project' && (() => {
          const prj = data as ProjectItem;
          return (
            <>
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-terranova-950/80 border-terranova-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-[10px] text-amber-500 font-mono font-bold block">Código de Contrato</span>
                <span className="font-mono font-bold text-sm">{prj.code}</span>
              </div>

              <div>
                <p className="font-semibold text-sm">{prj.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{prj.contractor}</p>
              </div>

              <div className={`p-3 rounded-lg border space-y-2 ${
                isDarkMode ? 'bg-terranova-800/40 border-terranova-700/60' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avance Físico</span>
                  <span className="font-mono font-bold text-emerald-500">{prj.progressPercentage}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-terranova-950' : 'bg-slate-200'}`}>
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${prj.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60' : 'border-slate-200'}`}>
                  <span className="text-gray-400 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Presupuesto</span>
                  <span className="font-mono font-bold">${(prj.budgetAllocated / 1000000).toFixed(1)}M MXN</span>
                </div>
                <div className={`flex justify-between py-1 border-b ${isDarkMode ? 'border-terranova-800/60' : 'border-slate-200'}`}>
                  <span className="text-gray-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Plazo</span>
                  <span className="font-mono">{prj.startDate} - {prj.endDate}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Abriendo Bitácora Digital de Obra ${prj.code}...`)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ver Bitácora y Estimaciones
              </button>
            </>
          );
        })()}
      </div>
    </aside>
  );
};
