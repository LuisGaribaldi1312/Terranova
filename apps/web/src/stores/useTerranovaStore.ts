import { useState, useEffect } from 'react';
import { ModuleId, Organization, LayerItem, PropertyItem, IncidentItem, ProjectItem } from '../types';
import { MOCK_ORGANIZATIONS, MOCK_LAYERS, MOCK_PROPERTIES, MOCK_INCIDENTS, MOCK_PROJECTS, MOCK_KPIS, MOCK_INFRASTRUCTURE } from './mockData';

export function useTerranovaStore() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  const [currentOrg, setCurrentOrg] = useState<Organization>(MOCK_ORGANIZATIONS[0]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // GIS Layers
  const [layers, setLayers] = useState<LayerItem[]>(MOCK_LAYERS);
  
  // Selection for Inspector Panel
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'property' | 'incident' | 'project' | null;
    data: PropertyItem | IncidentItem | ProjectItem | null;
  }>({ type: null, data: null });

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Nueva Incidencia Asignada', desc: 'Fuga de agua en Centro Histórico requiere inspección.', time: 'Hace 10m', unread: true },
    { id: '2', title: 'Actualización Catastral', desc: '14 predios validados en Sector Angelópolis.', time: 'Hace 45m', unread: true },
    { id: '3', title: 'Avance de Obra Registrado', desc: 'Curva S de Blvd. Atlixco actualizada al 74%.', time: 'Hace 2h', unread: false },
  ]);

  // Sync theme with document class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, active: !l.active } : l))
    );
  };

  const toggleOnlineSimulation = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (!next) {
        setOfflinePendingCount(3); // Simulated queued operations in IndexedDB
      } else {
        setTimeout(() => setOfflinePendingCount(0), 1200); // Simulated sync flush
      }
      return next;
    });
  };

  return {
    currentModule,
    setCurrentModule,
    currentOrg,
    setCurrentOrg,
    isDarkMode,
    setIsDarkMode,
    isOnline,
    toggleOnlineSimulation,
    offlinePendingCount,
    searchQuery,
    setSearchQuery,
    layers,
    toggleLayer,
    selectedEntity,
    setSelectedEntity,
    notifications,
    setNotifications,
    kpis: MOCK_KPIS,
    organizations: MOCK_ORGANIZATIONS,
    properties: MOCK_PROPERTIES,
    incidents: MOCK_INCIDENTS,
    projects: MOCK_PROJECTS,
    infrastructureAssets: MOCK_INFRASTRUCTURE,
  };
}
