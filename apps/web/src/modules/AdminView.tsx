import React, { useState } from 'react';
import { Settings, Shield, Lock } from 'lucide-react';
import { Organization } from '../types';

interface AdminViewProps {
  currentOrg: Organization;
}

export const AdminView: React.FC<AdminViewProps> = ({ currentOrg }) => {
  const [activeTab, setActiveTab] = useState<'org' | 'roles' | 'audit'>('org');

  const auditLogs = [
    { id: 'aud-01', user: 'ing.ramirez@municipio.gob.mx', role: 'Director', action: 'PROPERTY_OWNER_VIEWED', entity: 'Predio 21-114-001-045-0012', ip: '187.189.14.22', time: '12:15:40' },
    { id: 'aud-02', user: 'lic.torres@municipio.gob.mx', role: 'Coordinador GIS', action: 'LAYER_STYLE_UPDATED', entity: 'Capa Alumbrado Público', ip: '187.189.14.50', time: '11:42:10' },
    { id: 'aud-03', user: 'supervisor.obras@municipio.gob.mx', role: 'Supervisor', action: 'PROGRESS_CURVE_UPDATED', entity: 'Obra OBR-2026-001 (74%)', ip: '189.201.88.10', time: '10:05:22' },
    { id: 'aud-04', user: 'admin.seguridad@terranova.internal', role: 'Superadmin', action: 'TENANT_CONFIG_SAVED', entity: currentOrg.name, ip: '10.0.4.12', time: '09:18:00' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 gis-grid-bg">
      {/* Header */}
      <div className="bg-terranova-900/90 border border-terranova-700/80 p-4 rounded-2xl shadow-panel-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-terranova-400" />
            Gobernanza Institucional, Seguridad y Auditoría
          </h2>
          <p className="text-xs text-gray-400">
            Aislamiento multi-tenant con PostgreSQL Row Level Security (RLS) y bitácoras de trazabilidad legal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['org', 'roles', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === tab
                  ? 'bg-terranova-500 text-terranova-950 font-bold shadow-glow-tech'
                  : 'bg-terranova-800 text-gray-300 hover:text-white'
              }`}
            >
              {tab === 'org' && 'Configuración de Tenant'}
              {tab === 'roles' && 'Usuarios y Roles (RBAC)'}
              {tab === 'audit' && 'Bitácora Forense (Audit Logs)'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'org' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-terranova-900/80 border border-terranova-700/80 shadow-panel-dark space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block text-xs border-b border-terranova-800 pb-2">
              Ficha Institucional de la Organización
            </span>
            <div className="space-y-2">
              <div>
                <label className="text-gray-400 block text-[10px]">Nombre Oficial / Razón Social</label>
                <input
                  type="text"
                  readOnly
                  value={currentOrg.name}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded p-2 text-white font-semibold font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block text-[10px]">Código de Tenant</label>
                  <input
                    type="text"
                    readOnly
                    value={currentOrg.code}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded p-2 text-terranova-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block text-[10px]">Tipo de Organización</label>
                  <input
                    type="text"
                    readOnly
                    value={currentOrg.badge}
                    className="w-full bg-terranova-950 border border-terranova-800 rounded p-2 text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 block text-[10px]">Sistema de Referencia Espacial Preferido</label>
                <input
                  type="text"
                  readOnly
                  value={currentOrg.crs}
                  className="w-full bg-terranova-950 border border-terranova-800 rounded p-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-terranova-900/80 border border-terranova-700/80 shadow-panel-dark space-y-3 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block text-xs border-b border-terranova-800 pb-2">
              Seguridad y Aislamiento de Base de Datos
            </span>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-xs">PostgreSQL Row Level Security (RLS) ACTIVO</p>
                  <p className="text-[11px] text-gray-300">
                    Todas las tablas de predios, obras e incidencias aíslan físicamente los datos vinculados a {currentOrg.code}.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-terranova-950 border border-terranova-800">
                <Lock className="w-5 h-5 text-terranova-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-xs">Cifrado AES-256 en Reposo y TLS 1.3</p>
                  <p className="text-[11px] text-gray-400">
                    Documentos y expedientes catastrales protegidos con claves gestionadas por la institución.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs Table */}
      {activeTab === 'audit' && (
        <div className="rounded-xl bg-terranova-900/90 border border-terranova-700/80 overflow-hidden shadow-panel-dark">
          <div className="p-3 bg-terranova-950/70 border-b border-terranova-800 flex justify-between items-center text-xs">
            <span className="font-mono text-gray-300">Registro Criptográfico Inmutable (WORM)</span>
            <span className="text-[10px] font-mono text-terranova-400">Sha-256 Checksum Verificado</span>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-terranova-950 text-[10px] font-mono text-terranova-300 uppercase">
              <tr>
                <th className="py-2.5 px-4">Hora UTC</th>
                <th className="py-2.5 px-4">Usuario</th>
                <th className="py-2.5 px-4">Rol Institucional</th>
                <th className="py-2.5 px-4">Acción Auditada</th>
                <th className="py-2.5 px-4">Entidad Afectada</th>
                <th className="py-2.5 px-4">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terranova-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-terranova-800/40">
                  <td className="py-2.5 px-4 text-gray-400">{log.time}</td>
                  <td className="py-2.5 px-4 font-sans font-medium text-white">{log.user}</td>
                  <td className="py-2.5 px-4 text-terranova-400 font-sans">{log.role}</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">{log.action}</td>
                  <td className="py-2.5 px-4 text-gray-200">{log.entity}</td>
                  <td className="py-2.5 px-4 text-gray-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
