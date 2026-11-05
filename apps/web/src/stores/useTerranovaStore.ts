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
} from '../types';
import {
  MOCK_ORGANIZATIONS,
  MOCK_LAYERS,
  MOCK_PROPERTIES,
  MOCK_INCIDENTS,
  MOCK_PROJECTS,
  MOCK_KPIS,
  MOCK_INFRASTRUCTURE,
  MOCK_PERMITS,
} from './mockData';

export function useTerranovaStore() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  const [currentOrg, setCurrentOrg] = useState<Organization>(MOCK_ORGANIZATIONS[0]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // GIS Layers
  const [layers, setLayers] = useState<LayerItem[]>(MOCK_LAYERS);
  
  // Incidents Reactive State
  const [incidents, setIncidents] = useState<IncidentItem[]>(MOCK_INCIDENTS);

  // Projects & Public Works State
  const [projects, setProjects] = useState<ProjectItem[]>(MOCK_PROJECTS);

  // Urban Permits & Expedientes State
  const [permits, setPermits] = useState<PermitItem[]>(MOCK_PERMITS);

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

  // Projects Actions
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

  // Permits Actions
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
    permitId: string,
    status: PermitItem['status'],
    notes: string,
    zoning?: PermitItem['zoningComplianceStatus']
  ) => {
    setPermits((prev) =>
      prev.map((p) => {
        if (p.id !== permitId) return p;
        const history = [...p.history];
        history.push({
          date: new Date().toISOString(),
          status,
          note: notes,
          author: 'Dirección de Desarrollo Urbano',
        });

        let issuedAt = p.issuedAt;
        let expiresAt = p.expiresAt;
        let seal = p.officialDigitalSeal;
        let qr = p.qrVerificationCode;

        if (status === 'Aprobado y Sellado' && !seal) {
          issuedAt = new Date().toISOString();
          const exp = new Date();
          exp.setMonth(exp.getMonth() + 24);
          expiresAt = exp.toISOString();
          seal = 'c4e7f9a2b1d3085694a1209384756abcdef8901234567fedcba98765432101234';
          qr = `VERIF-LIC-${p.folio}`;
        }

        return {
          ...p,
          status,
          zoningComplianceStatus: zoning || p.zoningComplianceStatus,
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
    kpis: MOCK_KPIS,
    organizations: MOCK_ORGANIZATIONS,
    properties: MOCK_PROPERTIES,
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
    infrastructureAssets: MOCK_INFRASTRUCTURE,
  };
}
