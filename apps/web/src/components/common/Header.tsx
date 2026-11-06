import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Wifi, 
  WifiOff, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  Check, 
  ShieldCheck, 
  X,
  Globe
} from 'lucide-react';
import { Organization } from '../../types';

interface HeaderProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  offlineCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notifications: Array<{ id: string; title: string; desc: string; time: string; unread: boolean }>;
}

export const Header: React.FC<HeaderProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  isDarkMode,
  onToggleTheme,
  isOnline,
  onToggleOnline,
  offlineCount,
  searchQuery,
  onSearchChange,
  notifications,
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [orgFilter, setOrgFilter] = useState('');
  const [activeOrgTab, setActiveOrgTab] = useState<'ALL' | 'STATES' | 'MUNICIPAL'>('ALL');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Filtrado de Organizaciones Autorizadas
  const filteredOrgs = organizations.filter((org) => {
    // Filtro por pestaña
    if (activeOrgTab === 'STATES' && org.type !== 'STATE_GOV') return false;
    if (activeOrgTab === 'MUNICIPAL' && org.type === 'STATE_GOV') return false;

    // Filtro por texto
    if (!orgFilter) return true;
    const q = orgFilter.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      org.code.toLowerCase().includes(q) ||
      org.state.toLowerCase().includes(q) ||
      org.municipality.toLowerCase().includes(q)
    );
  });

  const stateOrgsCount = organizations.filter((o) => o.type === 'STATE_GOV').length;
  const otherOrgsCount = organizations.length - stateOrgsCount;

  return (
    <header
      className={`h-16 border-b px-4 flex items-center justify-between z-30 select-none transition-colors duration-200 ${
        isDarkMode
          ? 'border-terranova-800 bg-[#07131B]/95 text-white backdrop-blur-md'
          : 'border-slate-200 bg-white/95 text-slate-800 shadow-sm backdrop-blur-md'
      }`}
    >
      {/* Brand & Organization Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-glow-tech flex items-center justify-center">
            <div className={`w-full h-full rounded-[9px] flex items-center justify-center ${isDarkMode ? 'bg-[#07131B]' : 'bg-white'}`}>
              <span className="font-mono font-extrabold text-lg text-emerald-400">TR</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-base tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                TERRANOVA
              </span>
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                isDarkMode 
                  ? 'bg-terranova-800/80 text-terranova-300 border-terranova-700' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                OS v1.0 • MGN
              </span>
            </div>
            <p className={`text-[10px] tracking-tight font-medium ${isDarkMode ? 'text-terranova-300/70' : 'text-slate-500'}`}>
              Plataforma Territorial de los 32 Estados
            </p>
          </div>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all text-xs ${
              isDarkMode
                ? 'bg-terranova-900/80 hover:bg-terranova-800 border-terranova-700 text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
            }`}
            title="Cambiar Organización o Entidad Federativa Autorizada"
          >
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="max-w-[210px]">
              <p className="text-[11px] font-bold truncate">
                {currentOrg.name}
              </p>
              <p className={`text-[9px] font-mono truncate ${isDarkMode ? 'text-terranova-300/70' : 'text-slate-500'}`}>
                {currentOrg.code} • {currentOrg.state}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1 shrink-0" />
          </button>

          {showOrgDropdown && (
            <div
              className={`absolute top-full left-0 mt-2 w-96 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95 ${
                isDarkMode
                  ? 'bg-[#0B1D2A] border-terranova-700 text-white'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              {/* Header del Selector */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-700/40">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Organizaciones Autorizadas ({organizations.length})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  32 Estados Activos
                </span>
              </div>

              {/* Input de Búsqueda Rápida */}
              <div className="pt-2 pb-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={orgFilter}
                    onChange={(e) => setOrgFilter(e.target.value)}
                    placeholder="Filtrar por Estado, Municipio o Clave..."
                    className={`w-full text-xs rounded-lg pl-8 pr-3 py-1.5 font-mono border focus:outline-none ${
                      isDarkMode
                        ? 'bg-terranova-950 border-terranova-700 text-white placeholder-gray-500 focus:border-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500'
                    }`}
                  />
                  {orgFilter && (
                    <button
                      onClick={() => setOrgFilter('')}
                      className="absolute right-2 top-2 text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pestañas de Categoría */}
              <div className="grid grid-cols-3 gap-1 py-1.5 text-[10px] font-mono">
                <button
                  onClick={() => setActiveOrgTab('ALL')}
                  className={`py-1 rounded-md transition-all font-bold ${
                    activeOrgTab === 'ALL'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : isDarkMode ? 'bg-terranova-900 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({organizations.length})
                </button>
                <button
                  onClick={() => setActiveOrgTab('STATES')}
                  className={`py-1 rounded-md transition-all font-bold ${
                    activeOrgTab === 'STATES'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : isDarkMode ? 'bg-terranova-900 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  32 Estados ({stateOrgsCount})
                </button>
                <button
                  onClick={() => setActiveOrgTab('MUNICIPAL')}
                  className={`py-1 rounded-md transition-all font-bold ${
                    activeOrgTab === 'MUNICIPAL'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : isDarkMode ? 'bg-terranova-900 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Municipios ({otherOrgsCount})
                </button>
              </div>

              {/* Lista Scrollable de Organizaciones */}
              <div className="max-h-72 overflow-y-auto space-y-1 mt-1 pr-1">
                {filteredOrgs.map((org) => {
                  const isSelected = org.id === currentOrg.id;
                  const isState = org.type === 'STATE_GOV';
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        onSelectOrg(org);
                        setShowOrgDropdown(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs transition-all border ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : isDarkMode
                          ? 'border-transparent hover:bg-terranova-900/80 text-gray-300 hover:text-white'
                          : 'border-transparent hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isState ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{org.name}</p>
                          <p className={`text-[10px] font-mono truncate ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            {org.code} • {org.badge}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          isDarkMode ? 'bg-terranova-950 border-gray-700 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {org.crs.split(' ')[0]}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por Clave Catastral, Estado, Folio o Municipio..."
            className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs font-mono border focus:outline-none transition-all ${
              isDarkMode
                ? 'bg-terranova-950/80 border-terranova-700 text-white placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Controls & Status */}
      <div className="flex items-center gap-3">
        {/* Offline / Online Engine Simulator Button */}
        <button
          onClick={onToggleOnline}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
            isOnline
              ? isDarkMode
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : 'bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse'
          }`}
          title="Click para alternar simulación de conexión Offline-first"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE ({offlineCount})</span>
            </>
          )}
        </button>

        {/* Theme Toggle (Day / Night Vision) — Prominente e Inmediato */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-sm ${
            isDarkMode
              ? 'bg-terranova-800/90 hover:bg-terranova-700 text-amber-300 border-amber-400/50 shadow-glow-tech'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
          }`}
          title={isDarkMode ? 'Cambiar a Visión Diurna (Modo Día)' : 'Cambiar a Visión Nocturna (Modo Noche)'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline">☀️ MODO DÍA</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">🌙 MODO NOCHE</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className={`p-2 rounded-xl border transition-all relative ${
              isDarkMode
                ? 'bg-terranova-800/60 hover:bg-terranova-800 border-terranova-700/70 text-gray-300 hover:text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Centro de Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDrawer && (
            <div
              className={`absolute top-full right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95 ${
                isDarkMode ? 'bg-[#0B1D2A] border-terranova-700 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-700/40">
                <span className="text-xs font-bold">Notificaciones Territoriales</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{unreadCount} nuevas</span>
              </div>
              <div className="divide-y divide-gray-700/30 max-h-60 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 text-left">
                    <p className="text-xs font-medium flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[9px] font-mono text-gray-400">{n.time}</span>
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-700/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center text-slate-900 font-bold text-xs ring-2 ring-emerald-500/50">
            AR
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold flex items-center gap-1">
              Ing. Arq. Ramírez
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </p>
            <p className={`text-[10px] font-mono ${isDarkMode ? 'text-emerald-400/80' : 'text-slate-500'}`}>
              Director Territorial
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
