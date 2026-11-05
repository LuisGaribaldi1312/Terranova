import React, { useState } from 'react';
import { 
  Landmark, Search, Plus, FileText, MapPin, 
  CheckCircle, Printer, Download, X,
  ShieldCheck, Compass, QrCode, Building, Layers
} from 'lucide-react';
import { PropertyItem } from '../types';

interface PropertiesViewProps {
  properties: PropertyItem[];
  onSelectProperty: (p: PropertyItem) => void;
  onFocusMap: (coords: [number, number]) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties: initialProperties,
  onSelectProperty,
  onFocusMap,
}) => {
  const [propertiesList, setPropertiesList] = useState<PropertyItem[]>(initialProperties);
  const [filterLandUse, setFilterLandUse] = useState<string>('ALL');
  const [filterTaxStatus, setFilterTaxStatus] = useState<string>('ALL');
  const [filterRegime, setFilterRegime] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modales
  const [selectedCedulaProperty, setSelectedCedulaProperty] = useState<PropertyItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Formulario de Alta de Predio
  const [formData, setFormData] = useState({
    cadastralKey: '21-114-004-023-0055-000',
    neighborhood: 'Col. San Manuel',
    street: 'Av. San Claudio 1402',
    postalCode: '72570',
    landArea: 350.00,
    builtArea: 220.00,
    levelsCount: 2,
    landUse: 'Habitacional' as PropertyItem['landUse'],
    propertyRegime: 'Privada' as NonNullable<PropertyItem['propertyRegime']>,
    landValueUnitSqm: 3100,
    constructionValueUnitSqm: 4900,
    taxStatus: 'Al Corriente' as NonNullable<PropertyItem['taxStatus']>,
    boundaryNorth: 'Con Lote 54 (17.50 m)',
    boundarySouth: 'Con Av. San Claudio (17.50 m)',
    boundaryEast: 'Con Lote 56 (20.00 m)',
    boundaryWest: 'Con Calle 18 Sur (20.00 m)',
    owner: 'Ing. Carlos Mendoza Silva',
    ownerRfc: 'MESC800415KZ9',
    lat: 19.0185,
    lng: -98.2052,
  });

  // Filtrado reactivo
  const filteredProperties = propertiesList.filter((p) => {
    const matchUse = filterLandUse === 'ALL' || p.landUse === filterLandUse;
    const matchTax = filterTaxStatus === 'ALL' || p.taxStatus === filterTaxStatus;
    const matchRegime = filterRegime === 'ALL' || p.propertyRegime === filterRegime;
    const q = search.toLowerCase();
    const matchSearch = 
      p.cadastralKey.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      (p.street && p.street.toLowerCase().includes(q)) ||
      p.owner.toLowerCase().includes(q) ||
      (p.cadastralCertificateFolio && p.cadastralCertificateFolio.toLowerCase().includes(q));
    return matchUse && matchTax && matchRegime && matchSearch;
  });

  // Métricas agregadas en tiempo real
  const totalLandArea = propertiesList.reduce((acc, p) => acc + p.landArea, 0);
  const totalBuiltArea = propertiesList.reduce((acc, p) => acc + p.builtArea, 0);
  const totalCadastralValue = propertiesList.reduce((acc, p) => acc + p.cadastralValue, 0);
  const totalTaxCollection = propertiesList.reduce((acc, p) => acc + (p.annualPropertyTax || 0), 0);
  const totalDebt = propertiesList.reduce((acc, p) => acc + (p.taxDebtAmount || 0), 0);
  const delinquentCount = propertiesList.filter((p) => p.taxStatus === 'Con Adeudo').length;

  // Manejador de Registro de Nuevo Predio
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();

    // Cálculos de avalúo
    const landVal = formData.landArea * formData.landValueUnitSqm;
    const constVal = formData.builtArea * formData.constructionValueUnitSqm;
    const totalVal = landVal + constVal;
    const annualTax = Math.round(totalVal * 0.0035);

    // Folio y sello digital simulado
    const randomFolio = Math.floor(100000 + Math.random() * 900000);
    const folio = `CED-2026-${randomFolio}`;
    const digitalStamp = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newProp: PropertyItem = {
      id: `prop-${Date.now()}`,
      cadastralKey: formData.cadastralKey,
      neighborhood: formData.neighborhood,
      street: formData.street,
      postalCode: formData.postalCode,
      landArea: formData.landArea,
      builtArea: formData.builtArea,
      levelsCount: formData.levelsCount,
      landUse: formData.landUse,
      status: 'Registrado',
      propertyRegime: formData.propertyRegime,
      landValueUnitSqm: formData.landValueUnitSqm,
      constructionValueUnitSqm: formData.constructionValueUnitSqm,
      landCadastralValue: landVal,
      constructionCadastralValue: constVal,
      cadastralValue: totalVal,
      taxStatus: formData.taxStatus,
      annualPropertyTax: annualTax,
      taxDebtAmount: formData.taxStatus === 'Con Adeudo' ? Math.round(annualTax * 1.5) : 0,
      boundaryNorth: formData.boundaryNorth,
      boundarySouth: formData.boundarySouth,
      boundaryEast: formData.boundaryEast,
      boundaryWest: formData.boundaryWest,
      cadastralCertificateFolio: folio,
      cadastralCertificateIssuedAt: new Date().toISOString(),
      digitalStamp,
      coordinates: [formData.lng, formData.lat],
      polygonVertices: [
        [formData.lng - 0.0005, formData.lat + 0.0005],
        [formData.lng + 0.0005, formData.lat + 0.0005],
        [formData.lng + 0.0005, formData.lat - 0.0005],
        [formData.lng - 0.0005, formData.lat - 0.0005],
      ],
      owner: formData.owner,
      ownerRfc: formData.ownerRfc,
    };

    setPropertiesList([newProp, ...propertiesList]);
    setIsRegisterModalOpen(false);
    setSelectedCedulaProperty(newProp);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* 1. Header Oficial de Catastro y Métricas de Alto Impacto */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-terranova-500/10 border border-terranova-500/20 text-terranova-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Padrón Catastral y Gestión Territorial de Predios
                <span className="text-[10px] font-mono font-bold bg-terranova-500/20 text-terranova-400 border border-terranova-500/30 px-2 py-0.5 rounded-full">
                  INEGI MGN / EPSG:6362
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Administración oficial de predios, linderos geodésicos, avalúo catastral y emisión de cédulas con sello digital.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="px-3 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 border border-terranova-700 text-xs text-gray-300 font-mono transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-terranova-400" />
              <span>{viewMode === 'cards' ? 'Vista Tabla' : 'Vista Tarjetas'}</span>
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Predio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas Métricas Catastrales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Padrón Total</span>
          <span className="text-lg font-bold text-white">{propertiesList.length} Predios</span>
          <span className="text-[10px] text-terranova-400 block mt-0.5">100% Georreferenciados</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Superficie Terreno</span>
          <span className="text-lg font-bold text-white">{totalLandArea.toLocaleString()} m²</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">{(totalLandArea / 10000).toFixed(3)} Hectáreas</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Superficie Construida</span>
          <span className="text-lg font-bold text-white">{totalBuiltArea.toLocaleString()} m²</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Densidad: {((totalBuiltArea / totalLandArea) * 100).toFixed(1)}%</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Valor Catastral Total</span>
          <span className="text-lg font-bold text-emerald-400">${(totalCadastralValue / 1000000).toFixed(2)}M MXN</span>
          <span className="text-[10px] text-emerald-500 block mt-0.5">Recaudación: ${(totalTaxCollection / 1000).toFixed(1)}k/año</span>
        </div>
        <div className="p-3 rounded-xl bg-terranova-900/80 border border-terranova-800">
          <span className="text-gray-400 text-[10px] block uppercase">Estatus Predial</span>
          <span className="text-lg font-bold text-rose-400">{delinquentCount} en Rezago</span>
          <span className="text-[10px] text-rose-400 block mt-0.5">Adeudo: ${(totalDebt / 1000).toFixed(1)}k MXN</span>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros Catastrales Multi-Criterio */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-terranova-950/80 p-3.5 rounded-xl border border-terranova-800">
        <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-terranova-900/80 px-3 py-1.5 rounded-lg border border-terranova-700/60">
          <Search className="w-4 h-4 text-terranova-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Clave, Colonia, Calle, Propietario o Folio..."
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Filtro Uso de Suelo */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">USO:</span>
            {['ALL', 'Habitacional', 'Comercial', 'Mixto', 'Industrial'].map((u) => (
              <button
                key={u}
                onClick={() => setFilterLandUse(u)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterLandUse === u
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {u === 'ALL' ? 'Todos' : u}
              </button>
            ))}
          </div>

          {/* Filtro Fiscal Predial */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">FISCAL:</span>
            {['ALL', 'Al Corriente', 'Con Adeudo'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTaxStatus(t)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterTaxStatus === t
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'Todos' : t}
              </button>
            ))}
          </div>

          {/* Filtro Régimen */}
          <div className="flex items-center gap-1 bg-terranova-900/70 p-1 rounded-lg border border-terranova-800">
            <span className="text-gray-400 text-[10px] px-1">RÉGIMEN:</span>
            {['ALL', 'Privada', 'Condominio'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRegime(r)}
                className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                  filterRegime === r
                    ? 'bg-terranova-500 text-terranova-950 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'Todos' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Contenido Principal: Tarjetas o Tabla */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop)}
              className="p-4 rounded-xl bg-terranova-900/85 border border-terranova-700/70 hover:border-terranova-500 shadow-panel-dark transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-white group-hover:text-terranova-300 transition-colors flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-terranova-400" />
                      {prop.cadastralKey}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {prop.cadastralCertificateFolio || 'Folio en trámite'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      prop.taxStatus === 'Al Corriente' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      prop.taxStatus === 'Con Adeudo' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {prop.taxStatus || 'Al Corriente'}
                    </span>
                    <span className="text-[9px] font-mono text-terranova-400 bg-terranova-950 px-1.5 py-0.5 rounded border border-terranova-800">
                      {prop.propertyRegime || 'Privada'}
                    </span>
                  </div>
                </div>

                {/* Dirección y Propietario */}
                <div className="my-2.5">
                  <p className="text-xs text-white font-semibold flex items-center gap-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    {prop.street || 'Vía Pública'}, {prop.neighborhood}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                    Titular: <span className="text-gray-300">{prop.owner}</span> {prop.ownerRfc && `(${prop.ownerRfc})`}
                  </p>
                </div>

                {/* Desglose Métrico y Avalúo */}
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 rounded-lg bg-terranova-950/80 text-[11px] font-mono border border-terranova-800">
                  <div>
                    <span className="text-gray-500 block text-[9px]">ÁREA TERRENO</span>
                    <span className="text-white font-semibold">{prop.landArea.toLocaleString()} m²</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">CONSTRUCCIÓN</span>
                    <span className="text-white font-semibold">{prop.builtArea.toLocaleString()} m² ({prop.levelsCount || 1} niv.)</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">USO DE SUELO</span>
                    <span className="text-terranova-400 font-semibold">{prop.landUse}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">VALOR CATASTRAL</span>
                    <span className="text-emerald-400 font-bold">${(prop.cadastralValue / 1000000).toFixed(2)}M</span>
                  </div>
                </div>

                {/* Adeudo o Impuesto Anual */}
                <div className="text-[10px] font-mono px-2 py-1 bg-terranova-800/40 rounded flex items-center justify-between text-gray-400 border border-terranova-800/60 mb-2">
                  <span>Predial Anual: ${(prop.annualPropertyTax || 0).toLocaleString()} MXN</span>
                  {prop.taxDebtAmount ? (
                    <span className="text-rose-400 font-bold">Adeudo: ${prop.taxDebtAmount.toLocaleString()}</span>
                  ) : (
                    <span className="text-emerald-400">Sin adeudo</span>
                  )}
                </div>
              </div>

              {/* Botones de Acción Oficiales */}
              <div className="flex items-center gap-2 pt-2 border-t border-terranova-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusMap(prop.coordinates);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-terranova-800 hover:bg-terranova-700 text-terranova-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Enfocar GIS</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCedulaProperty(prop);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-terranova-500/20 hover:bg-terranova-500/30 border border-terranova-500/40 text-terranova-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors font-bold"
                >
                  <FileText className="w-3.5 h-3.5 text-terranova-400" />
                  <span>Cédula Oficial</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Tabular Oficial */
        <div className="bg-terranova-900/90 rounded-xl border border-terranova-800 overflow-x-auto shadow-panel-dark font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-terranova-950/80 border-b border-terranova-800 text-[11px] text-gray-400 uppercase">
                <th className="p-3">Clave Catastral</th>
                <th className="p-3">Ubicación / Dirección</th>
                <th className="p-3">Titular / RFC</th>
                <th className="p-3">Uso de Suelo</th>
                <th className="p-3">Superficie Terreno</th>
                <th className="p-3">Superficie Construcción</th>
                <th className="p-3">Valor Catastral</th>
                <th className="p-3">Estatus Fiscal</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terranova-800/60">
              {filteredProperties.map((prop) => (
                <tr 
                  key={prop.id}
                  onClick={() => onSelectProperty(prop)}
                  className="hover:bg-terranova-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-3 font-bold text-white whitespace-nowrap">
                    {prop.cadastralKey}
                    <span className="block text-[10px] text-gray-500 font-normal">{prop.cadastralCertificateFolio}</span>
                  </td>
                  <td className="p-3 text-gray-300">
                    <span className="font-semibold block">{prop.street || 'Vía Pública'}</span>
                    <span className="text-[10px] text-gray-400">{prop.neighborhood}, CP {prop.postalCode}</span>
                  </td>
                  <td className="p-3 text-gray-300">
                    <span className="block">{prop.owner}</span>
                    <span className="text-[10px] text-terranova-400">{prop.ownerRfc || 'RFC N/D'}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-terranova-800 text-terranova-300 text-[10px]">
                      {prop.landUse}
                    </span>
                  </td>
                  <td className="p-3 text-white font-semibold whitespace-nowrap">
                    {prop.landArea.toLocaleString()} m²
                  </td>
                  <td className="p-3 text-white whitespace-nowrap">
                    {prop.builtArea.toLocaleString()} m² ({prop.levelsCount || 1} niv.)
                  </td>
                  <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">
                    ${prop.cadastralValue.toLocaleString()} MXN
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prop.taxStatus === 'Al Corriente' ? 'bg-emerald-500/20 text-emerald-400' :
                      prop.taxStatus === 'Con Adeudo' ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {prop.taxStatus || 'Al Corriente'}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onFocusMap(prop.coordinates)}
                        className="p-1.5 rounded bg-terranova-800 hover:bg-terranova-700 text-terranova-300 transition-colors"
                        title="Enfocar en Mapa"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedCedulaProperty(prop)}
                        className="px-2 py-1 rounded bg-terranova-500/20 hover:bg-terranova-500/30 border border-terranova-500/30 text-terranova-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Cédula</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. MODAL OFICIAL: CÉDULA CATASTRAL CERTIFICADA */}
      {selectedCedulaProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-terranova-900 border border-terranova-600 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 bg-terranova-950 border-b border-terranova-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-terranova-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">CÉDULA CATASTRAL OFICIAL CERTIFICADA</h3>
                  <p className="text-[10px] text-gray-400">Dirección de Catastro y Gestión Territorial Municipal</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCedulaProperty(null)}
                className="p-1.5 rounded-lg hover:bg-terranova-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documento Imprimible */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-terranova-900 text-white">
              {/* Encabezado Cédula */}
              <div className="border-b-2 border-terranova-700 pb-3 flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white tracking-wide">
                    H. AYUNTAMIENTO DEL MUNICIPIO DE PUEBLA
                  </h4>
                  <p className="text-xs text-terranova-400 font-bold">SUBDIRECCIÓN DE CATASTRO Y ADMINISTRACIÓN PREDIAL</p>
                  <p className="text-[10px] text-gray-400">Marco Geoestadístico Nacional • Sistema Oficial EPSG:6362 (ITRF2008)</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-terranova-950 border border-terranova-700 font-bold text-terranova-300 text-xs block">
                    {selectedCedulaProperty.cadastralCertificateFolio || 'CED-2026-OFICIAL'}
                  </span>
                  <span className="text-[9px] text-gray-400 block mt-1">
                    Emitido: {selectedCedulaProperty.cadastralCertificateIssuedAt ? new Date(selectedCedulaProperty.cadastralCertificateIssuedAt).toLocaleDateString('es-MX') : '05/11/2026'}
                  </span>
                </div>
              </div>

              {/* Clave Catastral y Datos Principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl bg-terranova-950 border border-terranova-800">
                <div>
                  <span className="text-[9px] text-gray-400 block">CLAVE CATASTRAL OFICIAL</span>
                  <span className="text-sm font-bold text-white">{selectedCedulaProperty.cadastralKey}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">USO DE SUELO</span>
                  <span className="text-sm font-bold text-terranova-400">{selectedCedulaProperty.landUse}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">RÉGIMEN JURÍDICO</span>
                  <span className="text-sm font-bold text-white">{selectedCedulaProperty.propertyRegime || 'Privada'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block">ESTATUS FISCAL</span>
                  <span className={`text-sm font-bold ${selectedCedulaProperty.taxStatus === 'Al Corriente' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedCedulaProperty.taxStatus || 'Al Corriente'}
                  </span>
                </div>
              </div>

              {/* Titular y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-terranova-400 font-bold uppercase block mb-1">Datos del Titular / Propietario</span>
                  <p className="text-xs font-bold text-white">{selectedCedulaProperty.owner}</p>
                  <p className="text-[11px] text-gray-300">RFC: {selectedCedulaProperty.ownerRfc || 'GEN010101000'}</p>
                  <p className="text-[10px] text-gray-400">Personalidad: Persona Jurídica / Registro Notarial Confirmado</p>
                </div>
                <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-terranova-400 font-bold uppercase block mb-1">Ubicación Territorial Oficial</span>
                  <p className="text-xs font-bold text-white">{selectedCedulaProperty.street || 'Vía Pública'}, {selectedCedulaProperty.neighborhood}</p>
                  <p className="text-[11px] text-gray-300">C.P. {selectedCedulaProperty.postalCode || '72000'}, Puebla, Pue.</p>
                  <p className="text-[10px] text-gray-400">Coordenadas Centroide: {selectedCedulaProperty.coordinates[1].toFixed(5)}°N, {selectedCedulaProperty.coordinates[0].toFixed(5)}°W</p>
                </div>
              </div>

              {/* Cuadro de Linderos y Colindancias */}
              <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block mb-2 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Cuadro de Linderos y Colindancias Perimetrales
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-terranova-900 border border-terranova-800">
                    <span className="text-gray-400 text-[9px] block">AL NORTE:</span>
                    <span className="text-white font-semibold">{selectedCedulaProperty.boundaryNorth || 'Con predio colindante norte'}</span>
                  </div>
                  <div className="p-2 rounded bg-terranova-900 border border-terranova-800">
                    <span className="text-gray-400 text-[9px] block">AL SUR:</span>
                    <span className="text-white font-semibold">{selectedCedulaProperty.boundarySouth || 'Con vía pública frontal'}</span>
                  </div>
                  <div className="p-2 rounded bg-terranova-900 border border-terranova-800">
                    <span className="text-gray-400 text-[9px] block">AL ORIENTE:</span>
                    <span className="text-white font-semibold">{selectedCedulaProperty.boundaryEast || 'Con predio colindante oriente'}</span>
                  </div>
                  <div className="p-2 rounded bg-terranova-900 border border-terranova-800">
                    <span className="text-gray-400 text-[9px] block">AL PONIENTE:</span>
                    <span className="text-white font-semibold">{selectedCedulaProperty.boundaryWest || 'Con predio colindante poniente'}</span>
                  </div>
                </div>
              </div>

              {/* Avalúo Catastral Oficial Desglosado */}
              <div className="p-3 rounded-xl bg-terranova-950/70 border border-terranova-800">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block mb-2">
                  Determinación de Valor Catastral y Avalúo Fiscal
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-terranova-800 text-[10px] text-gray-400">
                        <th className="pb-1">Concepto</th>
                        <th className="pb-1">Superficie</th>
                        <th className="pb-1">Valor Unitario $/m²</th>
                        <th className="pb-1 text-right">Subtotal Catastral</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-terranova-800/40">
                      <tr>
                        <td className="py-1.5 text-white">Suelo / Terreno</td>
                        <td className="py-1.5 text-gray-300">{selectedCedulaProperty.landArea.toLocaleString()} m²</td>
                        <td className="py-1.5 text-gray-300">${(selectedCedulaProperty.landValueUnitSqm || 3200).toLocaleString()} MXN</td>
                        <td className="py-1.5 text-right font-bold text-white">${(selectedCedulaProperty.landCadastralValue || (selectedCedulaProperty.landArea * 3200)).toLocaleString()} MXN</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-white">Construcción ({selectedCedulaProperty.levelsCount || 1} niveles)</td>
                        <td className="py-1.5 text-gray-300">{selectedCedulaProperty.builtArea.toLocaleString()} m²</td>
                        <td className="py-1.5 text-gray-300">${(selectedCedulaProperty.constructionValueUnitSqm || 5200).toLocaleString()} MXN</td>
                        <td className="py-1.5 text-right font-bold text-white">${(selectedCedulaProperty.constructionCadastralValue || (selectedCedulaProperty.builtArea * 5200)).toLocaleString()} MXN</td>
                      </tr>
                      <tr className="border-t-2 border-terranova-700 font-bold text-xs">
                        <td className="py-2 text-emerald-400 uppercase">VALOR CATASTRAL DETERMINADO:</td>
                        <td colSpan={2} className="py-2 text-gray-400">Alícuota Predial Oficial: 0.35% anual</td>
                        <td className="py-2 text-right text-emerald-400 text-sm">${selectedCedulaProperty.cadastralValue.toLocaleString()} MXN</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sello Digital Criptográfico y Validación QR */}
              <div className="flex flex-col md:flex-row items-center gap-4 p-3 rounded-xl bg-terranova-950 border border-terranova-800 text-[10px]">
                <div className="p-2 rounded-lg bg-white text-black flex items-center justify-center">
                  <QrCode className="w-16 h-16" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-terranova-400 font-bold block">SELLO DIGITAL DE AUTENTICIDAD CATASTRAL (SHA-256):</span>
                  <p className="text-[9px] text-gray-400 break-all font-mono">
                    {selectedCedulaProperty.digitalStamp || '7a9b8f2c4d1e0a9b8f2c4d1e0a9b8f2c4d1e0a9b8f2c4d1e0a9b8f2c4d1e0a9b'}
                  </p>
                  <p className="text-[9px] text-gray-500">
                    Cadena original validada por el Sistema Operativo Territorial TERRANOVA v1.4. Este documento cuenta con firma electrónica y plena validez administrativa conforme a la Ley de Catastro del Estado.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Modal con Botón Imprimir y Descargar */}
            <div className="p-4 bg-terranova-950 border-t border-terranova-800 flex justify-between items-center">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedCedulaProperty, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", `Cedula_${selectedCedulaProperty.cadastralKey}.json`);
                  dlAnchorElem.click();
                }}
                className="px-3 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-white font-mono flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-terranova-400" />
                <span>Exportar JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCedulaProperty(null)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 font-mono transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold font-mono flex items-center gap-1.5 shadow-glow-tech transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Cédula Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: REGISTRAR NUEVO PREDIO CATASTRAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-terranova-900 border border-terranova-600 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between p-4 bg-terranova-950 border-b border-terranova-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-terranova-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">ALTA DE NUEVO PREDIO EN PADRÓN CATASTRAL</h3>
                  <p className="text-[10px] text-gray-400">Validación topológica PostGIS y avalúo catastral automático</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-terranova-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Bloque 1: Clave y Ubicación */}
              <div className="space-y-3">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block border-b border-terranova-800 pb-1">
                  1. Clave Catastral y Ubicación
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CLAVE CATASTRAL OFICIAL (ENT-MUN-ZON-MAN-PRE-EDI):</label>
                    <input
                      type="text"
                      required
                      value={formData.cadastralKey}
                      onChange={(e) => setFormData({ ...formData, cadastralKey: e.target.value })}
                      placeholder="21-114-001-045-0012-000"
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">COLONIA / FRACCIONAMIENTO:</label>
                    <input
                      type="text"
                      required
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CALLE Y NÚMERO OFICIAL:</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CÓDIGO POSTAL:</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Clasificación y Régimen */}
              <div className="space-y-3">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block border-b border-terranova-800 pb-1">
                  2. Uso de Suelo y Régimen Jurídico
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">USO DE SUELO:</label>
                    <select
                      value={formData.landUse}
                      onChange={(e) => setFormData({ ...formData, landUse: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    >
                      <option value="Habitacional">Habitacional</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Mixto">Mixto</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Equipamiento">Equipamiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">RÉGIMEN DE PROPIEDAD:</label>
                    <select
                      value={formData.propertyRegime}
                      onChange={(e) => setFormData({ ...formData, propertyRegime: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    >
                      <option value="Privada">Propiedad Privada</option>
                      <option value="Condominio">Condominio</option>
                      <option value="Ejidal">Ejidal</option>
                      <option value="Comunal">Comunal</option>
                      <option value="Pública">Pública / Estatal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">ESTATUS FISCAL INICIAL:</label>
                    <select
                      value={formData.taxStatus}
                      onChange={(e) => setFormData({ ...formData, taxStatus: e.target.value as any })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    >
                      <option value="Al Corriente">Al Corriente</option>
                      <option value="Con Adeudo">Con Adeudo</option>
                      <option value="Exento">Exento (Gubernamental)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Áreas y Avalúo */}
              <div className="space-y-3">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block border-b border-terranova-800 pb-1">
                  3. Superficies y Valuación Catastral
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">ÁREA TERRENO (m²):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.landArea}
                      onChange={(e) => setFormData({ ...formData, landArea: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">CONSTRUCCIÓN (m²):</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.builtArea}
                      onChange={(e) => setFormData({ ...formData, builtArea: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">VALOR SUELO ($/m²):</label>
                    <input
                      type="number"
                      value={formData.landValueUnitSqm}
                      onChange={(e) => setFormData({ ...formData, landValueUnitSqm: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">VALOR CONST. ($/m²):</label>
                    <input
                      type="number"
                      value={formData.constructionValueUnitSqm}
                      onChange={(e) => setFormData({ ...formData, constructionValueUnitSqm: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-terranova-950 border border-terranova-800 flex justify-between items-center text-xs">
                  <span className="text-gray-400">VALOR CATASTRAL CALCULADO ESTIMADO:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${((formData.landArea * formData.landValueUnitSqm) + (formData.builtArea * formData.constructionValueUnitSqm)).toLocaleString()} MXN
                  </span>
                </div>
              </div>

              {/* Bloque 4: Propietario y Linderos */}
              <div className="space-y-3">
                <span className="text-[10px] text-terranova-400 font-bold uppercase block border-b border-terranova-800 pb-1">
                  4. Propietario y Colindancias
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">NOMBRE DEL TITULAR / RAZÓN SOCIAL:</label>
                    <input
                      type="text"
                      required
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">RFC DEL TITULAR:</label>
                    <input
                      type="text"
                      required
                      value={formData.ownerRfc}
                      onChange={(e) => setFormData({ ...formData, ownerRfc: e.target.value })}
                      className="w-full p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white focus:outline-none focus:border-terranova-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Colindancia Norte..."
                    value={formData.boundaryNorth}
                    onChange={(e) => setFormData({ ...formData, boundaryNorth: e.target.value })}
                    className="p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Colindancia Sur..."
                    value={formData.boundarySouth}
                    onChange={(e) => setFormData({ ...formData, boundarySouth: e.target.value })}
                    className="p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Colindancia Oriente..."
                    value={formData.boundaryEast}
                    onChange={(e) => setFormData({ ...formData, boundaryEast: e.target.value })}
                    className="p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Colindancia Poniente..."
                    value={formData.boundaryWest}
                    onChange={(e) => setFormData({ ...formData, boundaryWest: e.target.value })}
                    className="p-2 rounded-lg bg-terranova-950 border border-terranova-700 text-white text-xs"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-3 border-t border-terranova-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 font-mono transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold font-mono shadow-glow-tech transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardar y Emitir Cédula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
