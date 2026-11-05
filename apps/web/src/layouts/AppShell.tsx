import React, { useState } from 'react';
import { useTerranovaStore } from '../stores/useTerranovaStore';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBar } from '../components/common/StatusBar';
import { RightInspector } from '../components/inspector/RightInspector';

// Module Views
import { DashboardView } from '../modules/DashboardView';
import { GisExplorerView } from '../modules/GisExplorerView';
import { PropertiesView } from '../modules/PropertiesView';
import { IncidentsView } from '../modules/IncidentsView';
import { FieldPwaView } from '../modules/FieldPwaView';
import { AdminView } from '../modules/AdminView';
import { InfrastructureView } from '../modules/InfrastructureView';
import { CitizenPortalView } from '../modules/CitizenPortalView';

// Placeholders for remaining modules in Phase 2
import { HardHat, FileText, Box, Bot, BarChart3 } from 'lucide-react';

export const AppShell: React.FC = () => {
  const store = useTerranovaStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFocusMap = (_coords: [number, number]) => {
    store.setCurrentModule('gis');
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden bg-terranova-900 text-terranova-100 ${store.isDarkMode ? 'dark' : ''}`}>
      {/* 1. Top Header */}
      <Header
        currentOrg={store.currentOrg}
        organizations={store.organizations}
        onSelectOrg={store.setCurrentOrg}
        isDarkMode={store.isDarkMode}
        onToggleTheme={() => store.setIsDarkMode(!store.isDarkMode)}
        isOnline={store.isOnline}
        onToggleOnline={store.toggleOnlineSimulation}
        offlineCount={store.offlinePendingCount}
        searchQuery={store.searchQuery}
        onSearchChange={store.setSearchQuery}
        notifications={store.notifications}
      />

      {/* 2. Middle Body (Sidebar + Viewport + Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentModule={store.currentModule}
          onSelectModule={store.setCurrentModule}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          incidentCount={store.incidents.length}
        />

        {/* Viewport Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {store.currentModule === 'dashboard' && (
            <DashboardView
              kpis={store.kpis}
              properties={store.properties}
              incidents={store.incidents}
              projects={store.projects}
              layers={store.layers}
              onToggleLayer={store.toggleLayer}
              onSelectProperty={(p) => store.setSelectedEntity({ type: 'property', data: p })}
              onSelectIncident={(i) => store.setSelectedEntity({ type: 'incident', data: i })}
              onSelectProject={(p) => store.setSelectedEntity({ type: 'project', data: p })}
              onNavigateToGIS={() => store.setCurrentModule('gis')}
            />
          )}

          {store.currentModule === 'gis' && (
            <GisExplorerView
              layers={store.layers}
              onToggleLayer={store.toggleLayer}
              properties={store.properties}
              incidents={store.incidents}
              onSelectProperty={(p) => store.setSelectedEntity({ type: 'property', data: p })}
              onSelectIncident={(i) => store.setSelectedEntity({ type: 'incident', data: i })}
              crs={store.currentOrg.crs}
            />
          )}

          {store.currentModule === 'properties' && (
            <PropertiesView
              properties={store.properties}
              onSelectProperty={(p) => store.setSelectedEntity({ type: 'property', data: p })}
              onFocusMap={handleFocusMap}
            />
          )}

          {store.currentModule === 'incidents' && (
            <IncidentsView
              incidents={store.incidents}
              onSelectIncident={(i) => store.setSelectedEntity({ type: 'incident', data: i })}
              onFocusMap={handleFocusMap}
              onAddIncident={store.addIncident}
              onUpdateStatus={store.updateIncidentStatus}
            />
          )}

          {store.currentModule === 'field' && (
            <FieldPwaView
              isOnline={store.isOnline}
              onToggleOnline={store.toggleOnlineSimulation}
              offlineCount={store.offlinePendingCount}
            />
          )}

          {store.currentModule === 'admin' && (
            <AdminView currentOrg={store.currentOrg} />
          )}

          {/* Additional interactive views for remaining modules */}
          {store.currentModule === 'projects' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 gis-grid-bg">
              <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-panel-dark">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-amber-400" />
                  Módulo 06: TERRANOVA PROJECTS — Obras y Proyectos Urbanos
                </h2>
                <p className="text-xs text-gray-400">Control físico-financiero de contratos de obra pública, estimaciones y curva S.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {store.projects.map((prj) => (
                  <div
                    key={prj.id}
                    onClick={() => store.setSelectedEntity({ type: 'project', data: prj })}
                    className="p-4 rounded-xl bg-terranova-900 border border-terranova-700 cursor-pointer hover:border-terranova-500 shadow-panel-dark transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs font-bold text-terranova-400">{prj.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{prj.status}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{prj.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">{prj.contractor}</p>
                    <div className="w-full bg-terranova-950 rounded-full h-2 mb-2">
                      <div className="bg-gradient-to-r from-terranova-500 to-emerald-400 h-2 rounded-full" style={{ width: `${prj.progressPercentage}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-gray-400">
                      <span>Avance: {prj.progressPercentage}%</span>
                      <span className="text-emerald-400 font-bold">${(prj.budgetAllocated/1000000).toFixed(1)}M MXN</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {store.currentModule === 'infrastructure' && (
            <InfrastructureView
              assets={store.infrastructureAssets}
              onFocusMap={handleFocusMap}
            />
          )}

          {store.currentModule === 'permits' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 gis-grid-bg">
              <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-panel-dark">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  Módulo 07: TERRANOVA PERMITS — Permisos y Expedientes Urbanos
                </h2>
                <p className="text-xs text-gray-400">Gestión digital de licencias de uso de suelo, alineamiento y número oficial, y licencias de obra.</p>
              </div>
              <div className="p-4 rounded-xl bg-terranova-900 border border-terranova-800 text-xs text-gray-300">
                <span className="font-mono text-terranova-400 font-bold block mb-1">VENTANILLA ÚNICA DIGITAL CATASTRAL</span>
                <p>32 expedientes en revisión técnica por peritos del municipio.</p>
              </div>
            </div>
          )}

          {store.currentModule === 'citizen' && (
            <CitizenPortalView
              incidents={store.incidents}
              properties={store.properties}
              onAddIncident={store.addIncident}
              onFocusMap={handleFocusMap}
            />
          )}

          {store.currentModule === 'digital-twin' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 gis-grid-bg">
              <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-panel-dark">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-purple-400" />
                  Módulo 10: TERRANOVA DIGITAL TWIN — Gemelo Digital 3D
                </h2>
                <p className="text-xs text-gray-400">Modelado tridimensional del territorio, mallas urbanas, simulación de sombras y escorrentías.</p>
              </div>
            </div>
          )}

          {store.currentModule === 'ai' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 gis-grid-bg">
              <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-panel-dark">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-terranova-400" />
                  Módulo 11: TERRANOVA AI — Inteligencia Territorial y GeoAgentes
                </h2>
                <p className="text-xs text-gray-400">Asistente agéntico para consultas territoriales en lenguaje natural (GeoAgent, UrbanAgent, InfraAgent).</p>
              </div>
            </div>
          )}

          {store.currentModule === 'analytics' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 gis-grid-bg">
              <div className="bg-terranova-900/90 border border-terranova-700 p-4 rounded-2xl shadow-panel-dark">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-terranova-400" />
                  Módulo 08: TERRANOVA ANALYTICS — Tableros e Inteligencia Espacial
                </h2>
                <p className="text-xs text-gray-400">Mapas de calor (Heatmaps) de concentración de reportes y tiempos medios de atención por colonia.</p>
              </div>
            </div>
          )}
        </main>

        {/* 3. Right Slide-Over Inspector */}
        <RightInspector
          selectedEntity={store.selectedEntity}
          onClose={() => store.setSelectedEntity({ type: null, data: null })}
          onFocusMap={handleFocusMap}
        />
      </div>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        crs={store.currentOrg.crs}
        isOnline={store.isOnline}
        offlineCount={store.offlinePendingCount}
      />
    </div>
  );
};
