import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  MapPin,
  FileText,
  CreditCard,
  Download,
  Building2,
  Sparkles,
  ShieldCheck,
  Printer,
  ChevronRight,
  Droplets,
  Lightbulb,
  Truck,
Trash2,
} from 'lucide-react';
import { IncidentItem, PropertyItem } from '../types';

interface CitizenPortalViewProps {
  incidents: IncidentItem[];
  properties: PropertyItem[];
  onAddIncident: (inc: IncidentItem) => void;
  onFocusMap: (coords: [number, number]) => void;
}

interface TaxStatement {
  cadastralKey: string;
  taxpayerName: string;
  address: string;
  neighborhood: string;
  landAreaM2: number;
  builtAreaM2: number;
  landValue: number;
  builtValue: number;
  totalCadastralValue: number;
  annualTaxBase: number;
  discountPercentage: number;
  discountAmount: number;
  totalDue: number;
  paymentLine: string;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
  digitalSeal?: string;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  incidents,
  properties,
  onAddIncident,
  onFocusMap,
}) => {
  // Tabs: 'track' | 'report' | 'predial'
  const [activeTab, setActiveTab] = useState<'track' | 'report' | 'predial'>('track');

  // Tracking State
  const [searchFolio, setSearchFolio] = useState<string>('INC-2026-000412');
  const [trackedIncident, setTrackedIncident] = useState<IncidentItem | null>(() => {
    return incidents.find((i) => i.folio === 'INC-2026-000412') || incidents[0] || null;
  });

  // Predial Search State
  const [searchCadastralKey, setSearchCadastralKey] = useState<string>('21-114-001-045-0012-000');
  const [taxStatement, setTaxStatement] = useState<TaxStatement | null>(() => {
    const prop = properties.find((p) => p.cadastralKey === '21-114-001-045-0012-000') || properties[0];
    if (!prop) return null;
    const landVal = prop.landCadastralValue || prop.landArea * 3500;
    const constVal = prop.constructionCadastralValue || prop.builtArea * 5500;
    const totalVal = prop.cadastralValue || landVal + constVal;
    const baseTax = Number((totalVal * 0.0035).toFixed(2));
    const discount = Number((baseTax * 0.15).toFixed(2));
    return {
      cadastralKey: prop.cadastralKey,
      taxpayerName: prop.owner || 'Ing. Alejandro Morales V.',
      address: prop.street || prop.neighborhood,
      neighborhood: prop.neighborhood,
      landAreaM2: prop.landArea,
      builtAreaM2: prop.builtArea,
      landValue: landVal,
      builtValue: constVal,
      totalCadastralValue: totalVal,
      annualTaxBase: baseTax,
      discountPercentage: 15,
      discountAmount: discount,
      totalDue: Number((baseTax - discount).toFixed(2)),
      paymentLine: '21114012026000048123',
      status: 'PENDING',
    };
  });

  const [paymentSuccessModal, setPaymentSuccessModal] = useState<boolean>(false);

  // New Report Form State
  const [reportType, setReportType] = useState<string>('Bacheo');
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [reportNeighborhood, setReportNeighborhood] = useState<string>('Centro Histórico');
  const [reportStreet, setReportStreet] = useState<string>('');
  const [reportCitizenName, setReportCitizenName] = useState<string>('');
  const [reportCitizenPhone, setReportCitizenPhone] = useState<string>('');
  const [reportSuccessFolio, setReportSuccessFolio] = useState<string | null>(null);

  // Search Incident
  const handleSearchIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchFolio.trim().toUpperCase();
    const found = incidents.find((i) => i.folio.toUpperCase() === query);
    if (found) {
      setTrackedIncident(found);
    } else {
      alert(`No se encontró ningún reporte con el folio ${query}. Verifique e intente nuevamente.`);
    }
  };

  // Search Tax Statement
  const handleSearchTaxStatement = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCadastralKey.trim();
    const prop = properties.find((p) => p.cadastralKey === query);
    if (prop) {
      const landVal = prop.landCadastralValue || prop.landArea * 3500;
      const constVal = prop.constructionCadastralValue || prop.builtArea * 5500;
      const totalVal = prop.cadastralValue || landVal + constVal;
      const baseTax = Number((totalVal * 0.0035).toFixed(2));
      const discount = Number((baseTax * 0.15).toFixed(2));
      setTaxStatement({
        cadastralKey: prop.cadastralKey,
        taxpayerName: prop.owner,
        address: prop.street || prop.neighborhood,
        neighborhood: prop.neighborhood,
        landAreaM2: prop.landArea,
        builtAreaM2: prop.builtArea,
        landValue: landVal,
        builtValue: constVal,
        totalCadastralValue: totalVal,
        annualTaxBase: baseTax,
        discountPercentage: 15,
        discountAmount: discount,
        totalDue: Number((baseTax - discount).toFixed(2)),
        paymentLine: '21114012026' + String(Math.floor(100000000 + Math.random() * 900000000)),
        status: 'PENDING',
      });
    } else {
      alert(`La clave catastral ${query} no figura en el padrón municipal digital. Verifique el formato ENT-MUN-ZON-MAN-PRE-EDI.`);
    }
  };

  // Process Predial Payment
  const handleProcessPayment = () => {
    if (!taxStatement) return;
    const paidAt = new Date().toISOString();
    const digitalSeal = 'f8a49c2e01b3d75689ef234019284756abcdef9876543210fedcba1234567890';
    setTaxStatement({
      ...taxStatement,
      status: 'PAID',
      paidAt,
      digitalSeal,
    });
    setPaymentSuccessModal(true);
  };

  // Submit Citizen Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNum = 415 + incidents.length + 1;
    const folio = `INC-2026-${String(nextNum).padStart(6, '0')}`;

    const newInc: IncidentItem = {
      id: `cit-inc-${Date.now()}`,
      folio,
      title: reportTitle || `${reportType} en ${reportNeighborhood}`,
      type: reportType,
      priority: reportType === 'Fuga de Agua' ? 'Crítica' : 'Alta',
      status: 'Recibida',
      neighborhood: reportNeighborhood,
      assignedDept:
        reportType === 'Agua Potable' || reportType === 'Drenaje'
          ? 'Dirección de Agua Potable y Alcantarillado'
          : reportType === 'Alumbrado'
          ? 'Dirección de Alumbrado Público'
          : 'Secretaría de Infraestructura y Obras',
      assignedCrew: 'En asignación por Mesa de Control 072',
      reportedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      citizenName: reportCitizenName || 'Ciudadano Vecino',
      citizenPhone: reportCitizenPhone || '222-555-0199',
      sourceChannel: 'Portal Web',
      coordinates: [19.043 + (Math.random() - 0.5) * 0.03, -98.201 + (Math.random() - 0.5) * 0.03],
      evidences: [
        {
          id: `ev-cit-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
          caption: 'Fotografía adjunta por el ciudadano',
          stage: 'before',
          uploadedAt: new Date().toISOString(),
        },
      ],
      history: [
        {
          date: new Date().toISOString(),
          status: 'Recibida',
          note: reportDesc || 'Reporte ingresado directamente desde el Portal Ciudadano Web.',
          author: 'Portal Ciudadano Terranova',
        },
      ],
    };

    onAddIncident(newInc);
    setReportSuccessFolio(folio);
    setTrackedIncident(newInc);
    setSearchFolio(folio);
    setReportTitle('');
    setReportDesc('');
  };

  const STEPS: Array<IncidentItem['status']> = ['Recibida', 'Validada', 'Asignada', 'En Proceso', 'Resuelta'];

  const getStepIndex = (status: IncidentItem['status']) => {
    return STEPS.indexOf(status);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 gis-grid-bg text-gray-200">
      {/* 1. Portal Hero & Municipal Header */}
      <div className="bg-gradient-to-r from-terranova-950 via-terranova-900 to-terranova-950 border border-terranova-700/80 p-6 rounded-3xl shadow-panel-dark relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial-gradient from-terranova-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-terranova-500/20 to-emerald-500/10 border border-terranova-500/30 text-terranova-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-terranova-400 font-bold bg-terranova-950/80 px-2.5 py-0.5 rounded-full border border-terranova-800">
                  Municipio de Puebla • Gobierno Municipal
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  Portal Oficial 100% Cifrado
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5">
                Ventanilla Ciudadana de Autoservicio Territorial
              </h1>
              <p className="text-xs text-gray-400 max-w-2xl mt-1 leading-relaxed">
                Rastreo público de reportes de bacheo y alumbrado (Línea 072), consulta y pago en línea de impuesto predial municipal con descuento por pronto pago, y reporte de incidentes en vía pública.
              </p>
            </div>
          </div>

          {/* Quick Service Navigation Tabs */}
          <div className="flex items-center bg-terranova-950/90 p-1.5 rounded-2xl border border-terranova-800 self-start md:self-center">
            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-terranova-500 text-terranova-950 shadow-glow-tech'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Rastrear Reporte</span>
            </button>
            <button
              onClick={() => setActiveTab('predial')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'predial'
                  ? 'bg-terranova-500 text-terranova-950 shadow-glow-tech'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Pago de Predial</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-terranova-500 text-terranova-950 shadow-glow-tech'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Nuevo Reporte 072</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: RASTREO PÚBLICO DE FOLIO (LÍNEA 072) */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
            <form onSubmit={handleSearchIncident} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-terranova-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFolio}
                  onChange={(e) => setSearchFolio(e.target.value)}
                  placeholder="Ingrese el folio oficial de su reporte (Ej. INC-2026-000412)..."
                  className="w-full bg-terranova-950 border border-terranova-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-terranova-400"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all flex items-center justify-center gap-1.5"
              >
                <span>Consultar Estatus</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
              <span>Folios de demostración disponibles:</span>
              {['INC-2026-000412', 'INC-2026-000413', 'INC-2026-000414'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setSearchFolio(f);
                    const inc = incidents.find((i) => i.folio === f);
                    if (inc) setTrackedIncident(inc);
                  }}
                  className="font-mono text-terranova-400 hover:underline bg-terranova-950 px-2 py-0.5 rounded border border-terranova-800"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tracked Incident Card */}
          {trackedIncident ? (
            <div className="bg-terranova-900/90 border border-terranova-700/80 rounded-2xl p-6 shadow-panel-dark space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-terranova-800">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-sm font-bold text-terranova-400 bg-terranova-950 px-3 py-1 rounded-lg border border-terranova-800">
                      Folio: {trackedIncident.folio}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                      trackedIncident.priority === 'Crítica'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : trackedIncident.priority === 'Alta'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}>
                      Prioridad {trackedIncident.priority}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Reportado el {new Date(trackedIncident.reportedAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{trackedIncident.title}</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-terranova-400" />
                    {trackedIncident.neighborhood} (Puebla, Pue.)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFocusMap(trackedIncident.coordinates)}
                    className="px-3.5 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-terranova-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ver en Mapa GIS</span>
                  </button>
                </div>
              </div>

              {/* Progress Timeline (Stepper) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Línea de Tiempo del Flujo de Atención Municipal
                </h3>

                <div className="grid grid-cols-5 gap-2 pt-2">
                  {STEPS.map((step, idx) => {
                    const currentIndex = getStepIndex(trackedIncident.status);
                    const isDone = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={step} className="flex flex-col items-center text-center relative">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs mb-2 transition-all ${
                            isDone
                              ? 'bg-terranova-500 text-terranova-950 shadow-glow-tech'
                              : 'bg-terranova-950 text-gray-600 border border-terranova-800'
                          } ${isCurrent ? 'ring-2 ring-terranova-300 ring-offset-2 ring-offset-terranova-900' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-gray-500'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical Crew and SLA Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Cuadrilla Asignada</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-terranova-400" />
                    <span>{trackedIncident.assignedCrew || 'Asignación en curso'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{trackedIncident.assignedDept}</p>
                </div>

                <div className="p-4 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Compromiso de Atención (SLA)</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-terranova-400" />
                    <span className="font-mono">
                      {trackedIncident.slaDeadline
                        ? new Date(trackedIncident.slaDeadline).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                        : 'En tiempo normativo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400">Atención prioritaria municipal</p>
                </div>

                <div className="p-4 rounded-xl bg-terranova-950/70 border border-terranova-800 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Canal de Entrada</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-terranova-400" />
                    <span>{trackedIncident.sourceChannel || 'Línea 072'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Vía digital verificada</p>
                </div>
              </div>

              {/* Evidences & History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Photo Evidences */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-terranova-400" />
                    Evidencia Fotográfica del Reporte
                  </h4>

                  {trackedIncident.evidences && trackedIncident.evidences.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {trackedIncident.evidences.map((ev) => (
                        <div key={ev.id} className="rounded-xl overflow-hidden border border-terranova-800 bg-terranova-950">
                          <img src={ev.url} alt={ev.caption} className="w-full h-28 object-cover" />
                          <div className="p-2 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded uppercase font-bold text-[9px] bg-sky-500/20 text-sky-400">
                              {ev.stage === 'after' ? 'Resolución' : 'Reporte Inicial'}
                            </span>
                            <p className="text-gray-300 mt-1 truncate">{ev.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-dashed border-terranova-800 text-center text-xs text-gray-500">
                      Sin fotografías adjuntas al folio
                    </div>
                  )}
                </div>

                {/* History Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-terranova-400" />
                    Bitácora de Actualizaciones Públicas
                  </h4>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {trackedIncident.history && trackedIncident.history.length > 0 ? (
                      trackedIncident.history.map((h, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-terranova-950/70 border border-terranova-800 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mb-1">
                            <span className="font-bold text-terranova-300">{h.status}</span>
                            <span>{new Date(h.date).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="text-gray-300 text-[11px]">{h.note}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">Sin bitácora registrada aún</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-terranova-900/50 border border-terranova-800 text-center space-y-2">
              <Search className="w-8 h-8 text-gray-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">Ingrese un número de folio para rastrear su reporte</h3>
              <p className="text-xs text-gray-400">
                El folio oficial le fue entregado al momento de reportar por la Línea 072 o la aplicación móvil.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB 2: CONSULTA Y PAGO DE PREDIAL */}
      {activeTab === 'predial' && (
        <div className="space-y-6">
          {/* Cadastral Key Search Box */}
          <div className="bg-terranova-900/90 border border-terranova-700/80 p-5 rounded-2xl shadow-panel-dark">
            <form onSubmit={handleSearchTaxStatement} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-terranova-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCadastralKey}
                  onChange={(e) => setSearchCadastralKey(e.target.value)}
                  placeholder="Ingrese la Clave Catastral oficial (Ej. 21-114-001-045-0012-000)..."
                  className="w-full bg-terranova-950 border border-terranova-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-terranova-400"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech transition-all flex items-center justify-center gap-1.5"
              >
                <span>Buscar Predio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
              <span>Claves catastrales disponibles en padrón demo:</span>
              {['21-114-001-045-0012-000', '21-114-002-018-0004-000'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSearchCadastralKey(k)}
                  className="font-mono text-terranova-400 hover:underline bg-terranova-950 px-2 py-0.5 rounded border border-terranova-800"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Bill Statement Card */}
          {taxStatement && (
            <div className="bg-terranova-900/90 border border-terranova-700/80 rounded-2xl p-6 shadow-panel-dark space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-terranova-800">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-sm font-bold text-white bg-terranova-950 px-3 py-1 rounded-lg border border-terranova-800">
                      {taxStatement.cadastralKey}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        taxStatement.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {taxStatement.status === 'PAID' ? 'PAGADO (AL CORRIENTE)' : 'PENDIENTE DE PAGO (EJERCICIO 2026)'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{taxStatement.taxpayerName}</h2>
                  <p className="text-xs text-gray-400">{taxStatement.address}, {taxStatement.neighborhood}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Importe Neto a Pagar</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ${taxStatement.totalDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </div>
                  <span className="text-[10px] text-terranova-300 font-mono">
                    Incluye 15% de bonificación pronto pago
                  </span>
                </div>
              </div>

              {/* Cadastral Valuation Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Terreno (m²)</span>
                  <div className="text-base font-bold font-mono text-white mt-1">{taxStatement.landAreaM2} m²</div>
                  <span className="text-[10px] text-gray-500 font-mono">${(taxStatement.landValue / taxStatement.landAreaM2).toFixed(0)}/m²</span>
                </div>

                <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Construcción (m²)</span>
                  <div className="text-base font-bold font-mono text-white mt-1">{taxStatement.builtAreaM2} m²</div>
                  <span className="text-[10px] text-gray-500 font-mono">${(taxStatement.builtValue / taxStatement.builtAreaM2).toFixed(0)}/m²</span>
                </div>

                <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Valor Catastral Total</span>
                  <div className="text-base font-bold font-mono text-terranova-300 mt-1">
                    ${(taxStatement.totalCadastralValue / 1000000).toFixed(2)}M
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Base Gravable 2026</span>
                </div>

                <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800">
                  <span className="text-[10px] text-gray-400 uppercase font-mono">Alícuota Municipal</span>
                  <div className="text-base font-bold font-mono text-white mt-1">0.35% Anual</div>
                  <span className="text-[10px] text-emerald-400 font-mono">Descuento: -${taxStatement.discountAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Official Bank Capture Line */}
              <div className="p-5 rounded-xl bg-terranova-950 border border-terranova-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">
                      Línea de Captura Bancaria Oficial (20 Dígitos con Dígito Verificador Módulo 10)
                    </span>
                    <div className="text-lg font-mono font-bold text-terranova-400 tracking-widest mt-1">
                      {taxStatement.paymentLine}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Convenio Bancario:</span>
                    <span className="font-mono text-xs font-bold text-white bg-terranova-900 px-2.5 py-1 rounded border border-terranova-800">
                      BBVA CIE: 1840291
                    </span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="bg-white p-3 rounded-lg flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 h-12 w-full justify-center">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-black h-full"
                        style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5)}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-black tracking-widest mt-1">
                    *{taxStatement.paymentLine}*
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-1">
                  <span>Vigencia para pago con bonificación: <strong>31 de Diciembre de 2026</strong></span>
                  <span>Aceptado en: BBVA, Banorte, Santander, Banamex, SPEI y OXXO</span>
                </div>
              </div>

              {/* Payment Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-gray-400">
                  {taxStatement.status === 'PAID' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Pago liquidado el {new Date(taxStatement.paidAt || Date.now()).toLocaleDateString('es-MX')}
                    </span>
                  ) : (
                    <span>Realice su pago en línea con acreditación inmediata en las arcas municipales.</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Formato</span>
                  </button>

                  {taxStatement.status === 'PENDING' ? (
                    <button
                      onClick={handleProcessPayment}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center justify-center gap-2 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pagar en Línea (${taxStatement.totalDue.toFixed(2)} MXN)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPaymentSuccessModal(true)}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Ver Recibo Oficial con Sello SHA-256</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 3: REGISTRO DE NUEVO REPORTE CIUDADANO (072) */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto bg-terranova-900/90 border border-terranova-700/80 rounded-2xl p-6 shadow-panel-dark space-y-6">
          <div className="pb-4 border-b border-terranova-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Reportar Falla en Vía Pública (Línea 072 Digital)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Su reporte será georreferenciado e ingresado directamente a la Mesa de Control para asignación inmediata de cuadrilla técnica.
            </p>
          </div>

          {reportSuccessFolio ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¡Reporte Registrado con Éxito!</h3>
                <p className="text-xs text-gray-300 mt-1">Guarde su número de folio oficial para dar seguimiento:</p>
                <div className="text-xl font-mono font-bold text-terranova-300 my-2 bg-terranova-950 py-2 px-4 rounded-xl border border-terranova-800 inline-block">
                  {reportSuccessFolio}
                </div>
                <p className="text-[11px] text-gray-400">
                  Tiempo estimado de atención normativo: <strong>24 Horas</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('track');
                    setReportSuccessFolio(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech"
                >
                  Ver Estatus en Línea de Tiempo →
                </button>
                <button
                  onClick={() => setReportSuccessFolio(null)}
                  className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs"
                >
                  Hacer Otro Reporte
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              {/* Type Selection */}
              <div>
                <label className="block text-gray-400 mb-2 font-bold">Tipo de Problema / Falla *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: 'Bacheo y Asfalto', type: 'Bacheo', icon: Truck },
                    { label: 'Fuga de Agua Potable', type: 'Agua Potable', icon: Droplets },
                    { label: 'Alumbrado Público', type: 'Alumbrado', icon: Lightbulb },
                    { label: 'Drenaje / Alcantarilla', type: 'Drenaje', icon: Droplets },
                    { label: 'Falla de Semáforo', type: 'Señalización', icon: AlertTriangle },
                    { label: 'Basura / Escombro', type: 'Basura', icon: Trash2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = reportType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setReportType(item.type)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? 'bg-terranova-500/20 border-terranova-400 text-white font-bold'
                            : 'bg-terranova-950/70 border-terranova-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-terranova-300' : 'text-gray-500'}`} />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-gray-400 mb-1">Título Resumido *</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ej. Fuga de agua potable con derrame continuo"
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción Detallada *</label>
                <textarea
                  rows={3}
                  required
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describa la magnitud de la falla, puntos de referencia, peligros a peatones o tráfico vehicular..."
                  className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Colonia / Sector *</label>
                  <input
                    type="text"
                    required
                    value={reportNeighborhood}
                    onChange={(e) => setReportNeighborhood(e.target.value)}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Calle y Cruces *</label>
                  <input
                    type="text"
                    required
                    value={reportStreet}
                    onChange={(e) => setReportStreet(e.target.value)}
                    placeholder="Ej. Calle 16 de Septiembre y Av. 5 Poniente"
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Su Nombre Completo</label>
                  <input
                    type="text"
                    value={reportCitizenName}
                    onChange={(e) => setReportCitizenName(e.target.value)}
                    placeholder="Ej. C. Juan Carlos Pérez"
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Teléfono Móvil (Avisos de avance)</label>
                  <input
                    type="text"
                    value={reportCitizenPhone}
                    onChange={(e) => setReportCitizenPhone(e.target.value)}
                    placeholder="Ej. 222-123-4567"
                    className="w-full bg-terranova-950 border border-terranova-800 rounded-xl p-2.5 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Simulated Photo Attachment */}
              <div className="p-3.5 rounded-xl bg-terranova-950/70 border border-terranova-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-terranova-400" />
                  <div>
                    <span className="font-bold text-white block">Fotografía de la Falla</span>
                    <span className="text-[10px] text-gray-400">Capturada automáticamente mediante geolocalización GPS</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ✓ Foto Adjunta
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-terranova-500 hover:bg-terranova-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Reporte y Generar Folio Oficial</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* MODAL: Comprobante Oficial Digital de Pago */}
      {paymentSuccessModal && taxStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-terranova-900 border border-terranova-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Comprobante Oficial de Pago Municipal</h3>
              <p className="text-xs text-gray-400">Tesorería Municipal • Dirección de Ingresos y Catastro</p>
            </div>

            <div className="p-4 rounded-xl bg-terranova-950 border border-terranova-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Clave Catastral:</span>
                <span className="text-white font-bold">{taxStatement.cadastralKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contribuyente:</span>
                <span className="text-white truncate max-w-[200px]">{taxStatement.taxpayerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Línea de Captura:</span>
                <span className="text-terranova-300">{taxStatement.paymentLine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto Liquidado:</span>
                <span className="text-emerald-400 font-bold font-sans">${taxStatement.totalDue.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha y Hora de Pago:</span>
                <span className="text-gray-300">{new Date(taxStatement.paidAt || Date.now()).toLocaleString('es-MX')}</span>
              </div>
              <div className="pt-2 border-t border-terranova-800 text-[10px] break-all">
                <span className="text-gray-500 block mb-0.5">Sello Digital Criptográfico SHA-256:</span>
                <span className="text-terranova-400">{taxStatement.digitalSeal || 'e7b9c2a1f480392d54e60183acbd9284fa0192837465abcde9876543210fedcb'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPaymentSuccessModal(false)}
                className="px-4 py-2 rounded-xl bg-terranova-800 hover:bg-terranova-700 text-gray-300 text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                  setPaymentSuccessModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-terranova-950 font-bold text-xs shadow-glow-tech flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo Fiscal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
