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
  X
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
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b border-terranova-800 bg-terranova-900/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Organization Selector */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-terranova-500 to-terranova-800 p-0.5 shadow-glow-tech flex items-center justify-center">
            <div className="w-full h-full bg-terranova-900 rounded-[7px] flex items-center justify-center">
              <span className="font-mono font-bold text-lg text-terranova-400">TR</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">TERRANOVA</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-terranova-800/80 text-terranova-300 border border-terranova-700">
                OS v1.0
              </span>
            </div>
            <p className="text-[10px] text-terranova-200/60 tracking-tight font-medium">
              Intelligence & Territorial Management
            </p>
          </div>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-terranova-800/70 hover:bg-terranova-800 text-left border border-terranova-700/80 transition-all text-xs"
            title="Cambiar Organización o Municipio"
          >
            <Building2 className="w-4 h-4 text-terranova-400" />
            <div>
              <p className="text-[11px] font-semibold text-white truncate max-w-[190px]">
                {currentOrg.name}
              </p>
              <p className="text-[9px] text-terranova-300/70 font-mono">
                {currentOrg.code} • {currentOrg.state}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-terranova-300 ml-1" />
          </button>

          {showOrgDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-terranova-900 border border-terranova-700 rounded-xl shadow-panel-dark py-2 z-50">
              <div className="px-3 py-1.5 border-b border-terranova-800 text-[10px] font-mono text-terranova-300 uppercase tracking-wider">
                Organizaciones Autorizadas
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-terranova-800/80 transition-colors ${
                    org.id === currentOrg.id ? 'bg-terranova-800/40 text-terranova-400 font-semibold' : 'text-gray-300'
                  }`}
                >
                  <div>
                    <p className="text-white text-xs">{org.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{org.badge} • {org.crs}</p>
                  </div>
                  {org.id === currentOrg.id && <Check className="w-4 h-4 text-terranova-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-terranova-300 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por Clave Catastral, Folio, Colonia o Coordenadas..."
            className="w-full bg-terranova-950/70 border border-terranova-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-terranova-300/50 focus:outline-none focus:border-terranova-500 focus:ring-1 focus:ring-terranova-500 transition-all font-mono"
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
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60'
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

        {/* Theme Toggle (Dark/Light) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-terranova-800/60 hover:bg-terranova-800 border border-terranova-700/70 text-terranova-200 hover:text-white transition-all"
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="p-2 rounded-lg bg-terranova-800/60 hover:bg-terranova-800 border border-terranova-700/70 text-terranova-200 hover:text-white transition-all relative"
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
            <div className="absolute top-full right-0 mt-2 w-80 bg-terranova-900 border border-terranova-700 rounded-xl shadow-panel-dark p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-terranova-800">
                <span className="text-xs font-semibold text-white">Notificaciones Territoriales</span>
                <span className="text-[10px] font-mono text-terranova-400">{unreadCount} nuevas</span>
              </div>
              <div className="divide-y divide-terranova-800/60 max-h-60 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 text-left">
                    <p className="text-xs font-medium text-white flex items-center justify-between">
                      {n.title}
                      <span className="text-[9px] font-mono text-gray-400">{n.time}</span>
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-terranova-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-terranova-500 to-sky-400 flex items-center justify-center text-terranova-900 font-bold text-xs ring-2 ring-terranova-700">
            AR
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white flex items-center gap-1">
              Ing. Arq. Ramírez
              <ShieldCheck className="w-3 h-3 text-terranova-400" />
            </p>
            <p className="text-[10px] text-terranova-300 font-mono">
              Director Territorial
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
