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
import { ProjectsView } from '../modules/ProjectsView';
import { PermitsView } from '../modules/PermitsView';
import { AnalyticsView } from '../modules/AnalyticsView';
import { AiAssistantView } from '../modules/AiAssistantView';
import { DigitalTwinView } from '../modules/DigitalTwinView';

export const AppShell: React.FC = () => {
  const store = useTerranovaStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFocusMap = (_coords: [number, number]) => {
    store.setCurrentModule('gis');
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${store.isDarkMode ? 'bg-[#07131B] text-terranova-100 dark' : 'bg-slate-100 text-slate-800'}`}>
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
          isDarkMode={store.isDarkMode}
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
              center={store.currentCenter}
              zoom={store.currentZoom}
              isDarkMode={store.isDarkMode}
              currentOrg={store.currentOrg}
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
              isDarkMode={store.isDarkMode}
              currentOrg={store.currentOrg}
              center={store.currentCenter}
              zoom={store.currentZoom}
              defaultStateCve={store.currentStateCve}
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

          {store.currentModule === 'projects' && (
            <ProjectsView
              projects={store.projects}
              onSelectProject={(p) => store.setSelectedEntity({ type: 'project', data: p })}
              onFocusMap={handleFocusMap}
              onAddProject={store.addProject}
              onAddEstimation={store.addEstimation}
              onUpdateEstimationStatus={store.updateEstimationStatus}
            />
          )}

          {store.currentModule === 'infrastructure' && (
            <InfrastructureView
              assets={store.infrastructureAssets}
              onFocusMap={handleFocusMap}
            />
          )}

          {store.currentModule === 'permits' && (
            <PermitsView
              permits={store.permits}
              onSelectPermit={(_p) => store.setSelectedEntity({ type: 'property', data: null })}
              onFocusMap={handleFocusMap}
              onAddPermit={store.addPermit}
              onReviewPermit={store.reviewPermit}
              onUpdateRequirement={store.updateRequirementStatus}
            />
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
            <DigitalTwinView onFocusMap={handleFocusMap} />
          )}

          {store.currentModule === 'ai' && (
            <AiAssistantView
              properties={store.properties}
              incidents={store.incidents}
              projects={store.projects}
              onFocusMap={handleFocusMap}
              onNavigateModule={(mod) => store.setCurrentModule(mod as any)}
            />
          )}

          {store.currentModule === 'analytics' && (
            <AnalyticsView
              incidents={store.incidents}
              properties={store.properties}
              onFocusMap={handleFocusMap}
            />
          )}
        </main>

        {/* 3. Right Slide-Over Inspector */}
        <RightInspector
          selectedEntity={store.selectedEntity}
          onClose={() => store.setSelectedEntity({ type: null, data: null })}
          onFocusMap={handleFocusMap}
          isDarkMode={store.isDarkMode}
        />
      </div>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        crs={store.currentOrg.crs}
        isOnline={store.isOnline}
        offlineCount={store.offlinePendingCount}
        currentCenter={store.currentCenter}
        isDarkMode={store.isDarkMode}
      />
    </div>
  );
};
export default AppShell;
