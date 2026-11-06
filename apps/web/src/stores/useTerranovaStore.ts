import { useState, useEffect } from 'react';
import {
  ModuleId,
  Organization,
  LayerItem,
  PropertyItem,
  IncidentItem,
  ProjectItem,
  ProjectEstimation,
  PermitItem,
  PermitRequirement,
  KPICardData,
  InfrastructureAssetItem,
} from '../types';
import {
  MOCK_ORGANIZATIONS,
  getTerritoryDataForOrg,
} from './territoryDataService';

export function useTerranovaStore() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  
  // Default to CDMX or Puebla for rich urban context on first load
  const initialOrg = MOCK_ORGANIZATIONS.find((o) => o.code === 'GOB-CDMX-09') || MOCK_ORGANIZATIONS[0];
  const [currentOrg, setCurrentOrg] = useState<Organization>(initialOrg);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial territory data
  const initialData = getTerritoryDataForOrg(initialOrg);

  // Territorial Reactive State
  const [properties, setProperties] = useState<PropertyItem[]>(initialData.properties);
  const [incidents, setIncidents] = useState<IncidentItem[]>(initialData.incidents);
  const [projects, setProjects] = useState<ProjectItem[]>(initialData.projects);
  const [permits, setPermits] = useState<PermitItem[]>(initialData.permits);
  const [infrastructureAssets, setInfrastructureAssets] = useState<InfrastructureAssetItem[]>(initialData.infrastructure);
  const [kpis, setKpis] = useState<KPICardData[]>(initialData.kpis);
  const [layers, setLayers] = useState<LayerItem[]>(initialData.layers);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(initialData.center);
  const [currentZoom, setCurrentZoom] = useState<number>(initialData.zoom);
  const [currentStateCve, setCurrentStateCve] = useState<string>(initialData.cve);

  // Selection for Inspector Panel
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'property' | 'incident' | 'project' | null;
    data: PropertyItem | IncidentItem | ProjectItem | null;
  }>({ type: null, data: null });

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Nueva Incidencia Asignada', desc: `Fuga de agua en ${initialData.capitalName} requiere inspección inmediata.`, time: 'Hace 10m', unread: true },
    { id: '2', title: 'Actualización Catastral', desc: `Padrón validado en ${initialData.stateName} con sello SHA-256.`, time: 'Hace 45m', unread: true },
    { id: '3', title: 'Avance de Obra Registrado', desc: `Curva S actualizada en contrato COP-${initialOrg.code.slice(-3)}-2026-001.`, time: 'Hace 2h', unread: false },
  ]);

  // Reactive synchronizer when organization changes
  useEffect(() => {
    const data = getTerritoryDataForOrg(currentOrg);
    setProperties(data.properties);
    setIncidents(data.incidents);
    setProjects(data.projects);
    setPermits(data.permits);
    setInfrastructureAssets(data.infrastructure);
    setKpis(data.kpis);
    setLayers(data.layers);
    setCurrentCenter(data.center);
    setCurrentZoom(data.zoom);
    setCurrentStateCve(data.cve);
    setSelectedEntity({ type: null, data: null });

    setNotifications([
      { id: Date.now().toString(), title: `Territorio Activo: ${currentOrg.name}`, desc: `Sincronizados predios, obras e incidencias de ${data.capitalName}, ${data.stateName}.`, time: 'Justo ahora', unread: true },
      { id: (Date.now() - 600000).toString(), title: 'Cédulas Catastrales Verificadas', desc: `Marco Geoestadístico INEGI ${data.cve} vinculado a ${currentOrg.crs}.`, time: 'Hace 10m', unread: false },
    ]);
  }, [currentOrg.id]);

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
        setOfflinePendingCount(3);
      } else {
        setTimeout(() => setOfflinePendingCount(0), 1200);
      }
      return next;
    });
  };

  const addIncident = (newInc: IncidentItem) => {
    setIncidents((prev) => [newInc, ...prev]);
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        title: `Nueva Incidencia ${newInc.folio}`,
        desc: `${newInc.type}: ${newInc.title} en ${newInc.neighborhood}`,
        time: 'Justo ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const updateIncidentStatus = (
    id: string,
    status: IncidentItem['status'],
    crewName?: string,
    notes?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const history = inc.history ? [...inc.history] : [];
        if (notes) {
          history.push({
            date: new Date().toISOString(),
            status,
            note: notes,
            author: 'Despacho Central de Guardia',
          });
        }
        return {
          ...inc,
          status,
          assignedCrew: crewName || inc.assignedCrew,
          history,
        };
      })
    );
  };

  const addProject = (newPrj: ProjectItem) => {
    setProjects((prev) => [newPrj, ...prev]);
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        title: `Nuevo Contrato de Obra: ${newPrj.code}`,
        desc: `${newPrj.name} (${newPrj.fundingSource || 'FAISMUN'})`,
        time: 'Justo ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const addEstimation = (projectId: string, estimation: ProjectEstimation) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentEstimations = p.estimations ? [...p.estimations] : [];
        return {
          ...p,
          estimations: [...currentEstimations, estimation],
        };
      })
    );
  };

  const updateEstimationStatus = (
    projectId: string,
    estimationNumber: number,
    status: ProjectEstimation['status']
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentEstimations = p.estimations
          ? p.estimations.map((e) => {
              if (e.estimationNumber !== estimationNumber) return e;
              return {
                ...e,
                status,
                paidAt: status === 'PAID' ? new Date().toISOString() : e.paidAt,
              };
            })
          : [];

        let newExercised = p.budgetExercised;
        if (status === 'PAID') {
          const est = p.estimations?.find((e) => e.estimationNumber === estimationNumber);
          if (est) newExercised += est.grossAmount;
        }

        const newFinancialProgress = Number(((newExercised / p.budgetAllocated) * 100).toFixed(1));

        return {
          ...p,
          budgetExercised: newExercised,
          financialProgress: newFinancialProgress,
          estimations: currentEstimations,
        };
      })
    );
  };

  const addPermit = (newPermit: PermitItem) => {
    setPermits((prev) => [newPermit, ...prev]);
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        title: `Nuevo Expediente Digital: ${newPermit.folio}`,
        desc: `${newPermit.permitType} (${newPermit.cadastralKey})`,
        time: 'Justo ahora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const reviewPermit = (
    id: string,
    status: PermitItem['status'],
    notes?: string,
    zoning?: string
  ) => {
    setPermits((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const history = p.history ? [...p.history] : [];
        if (notes) {
          history.push({
            date: new Date().toISOString(),
            status,
            note: notes,
            author: 'Dirección de Desarrollo Urbano',
          });
        }

        let issuedAt = p.issuedAt;
        let expiresAt = p.expiresAt;
        let seal = p.officialDigitalSeal;
        let qr = p.qrVerificationCode;

        if (status === 'Aprobado y Sellado' && !issuedAt) {
          issuedAt = new Date().toISOString().split('T')[0];
          const expYear = new Date().getFullYear() + 2;
          expiresAt = `${expYear}-12-31`;
          seal = `hash-${Date.now()}-${p.folio}`;
          qr = `QR-TERRANOVA-LIC-${p.folio}`;
        }

        return {
          ...p,
          status,
          pduZoneClassification: zoning || p.pduZoneClassification,
          technicalNotes: notes,
          history,
          issuedAt,
          expiresAt,
          officialDigitalSeal: seal,
          qrVerificationCode: qr,
        };
      })
    );
  };

  const updateRequirementStatus = (
    permitId: string,
    reqId: string,
    status: PermitRequirement['status']
  ) => {
    setPermits((prev) =>
      prev.map((p) => {
        if (p.id !== permitId) return p;
        const requirements = p.requirements.map((r) =>
          r.id === reqId ? { ...r, status } : r
        );
        return {
          ...p,
          requirements,
        };
      })
    );
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
    kpis,
    organizations: MOCK_ORGANIZATIONS,
    properties,
    setProperties,
    incidents,
    setIncidents,
    addIncident,
    updateIncidentStatus,
    projects,
    setProjects,
    addProject,
    addEstimation,
    updateEstimationStatus,
    permits,
    setPermits,
    addPermit,
    reviewPermit,
    updateRequirementStatus,
    infrastructureAssets,
    currentCenter,
    currentZoom,
    currentStateCve,
  };
}
