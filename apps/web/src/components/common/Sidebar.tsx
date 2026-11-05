import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  Landmark, 
  Zap, 
  AlertTriangle, 
  HardHat, 
  FileText, 
  Users, 
  Smartphone, 
  Box, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ModuleId } from '../../types';

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  incidentCount: number;
}

interface SidebarItem {
  id: ModuleId;
  label: string;
  icon: any;
  badge?: string;
  count?: number;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  incidentCount,
}) => {
  const sections: SidebarSection[] = [
    {
      label: 'GENERAL',
      items: [
        { id: 'dashboard' as ModuleId, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'gis' as ModuleId, label: 'GIS Explorer', icon: Map, badge: 'Core' },
        { id: 'analytics' as ModuleId, label: 'Analytics & BI', icon: BarChart3 },
      ],
    },
    {
      label: 'GESTIÓN TERRITORIAL',
      items: [
        { id: 'properties' as ModuleId, label: 'Propiedades y Catastro', icon: Landmark },
        { id: 'infrastructure' as ModuleId, label: 'Infraestructura Urbana', icon: Zap },
        { id: 'incidents' as ModuleId, label: 'Incidencias y Reportes', icon: AlertTriangle, count: incidentCount },
        { id: 'projects' as ModuleId, label: 'Obras y Proyectos', icon: HardHat },
        { id: 'permits' as ModuleId, label: 'Permisos y Trámites', icon: FileText },
      ],
    },
    {
      label: 'OPERACIÓN & AVANZADO',
      items: [
        { id: 'citizen' as ModuleId, label: 'Portal Ciudadano', icon: Users },
        { id: 'field' as ModuleId, label: 'Field PWA (Offline)', icon: Smartphone, badge: 'PWA' },
        { id: 'digital-twin' as ModuleId, label: 'Gemelo Digital (3D)', icon: Box, badge: '3D' },
        { id: 'ai' as ModuleId, label: 'TERRANOVA AI', icon: Bot, badge: 'Agent' },
      ],
    },
    {
      label: 'SISTEMA',
      items: [
        { id: 'admin' as ModuleId, label: 'Gobernanza & Auditoría', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`border-r border-terranova-800 bg-terranova-900/90 backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="overflow-y-auto py-3 px-2 space-y-5">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-mono font-semibold tracking-wider text-terranova-400 uppercase">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-terranova-500/15 text-terranova-300 border border-terranova-500/40 shadow-glow-tech'
                        : 'text-terranova-100/70 hover:bg-terranova-800/60 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-terranova-400' : 'text-terranova-300'}`} />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-terranova-800 text-terranova-300 border border-terranova-700">
                        {item.badge}
                      </span>
                    )}

                    {!collapsed && item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500/90 text-white">
                        {item.count}
                      </span>
                    )}

                    {collapsed && isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-terranova-500 rounded-l" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-terranova-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 text-[10px] text-gray-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-terranova-400" />
            <span>RLS Multi-Tenant Activo</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-terranova-800/60 hover:bg-terranova-800 text-terranova-300 hover:text-white mx-auto transition-colors"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
