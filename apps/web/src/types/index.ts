export type ModuleId = 
  | 'dashboard'
  | 'gis'
  | 'properties'
  | 'infrastructure'
  | 'incidents'
  | 'citizen'
  | 'projects'
  | 'permits'
  | 'analytics'
  | 'field'
  | 'digital-twin'
  | 'ai'
  | 'admin';

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'MUNICIPALITY' | 'STATE_GOV' | 'DEVELOPER' | 'CONSTRUCTION';
  state: string; // Entidad Federativa (INEGI)
  municipality: string;
  badge: string;
  crs: string; // EPSG:6362, EPSG:32614, etc.
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
}

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  sublabel: string;
  iconName: string;
}

export interface PropertyItem {
  id: string;
  cadastralKey: string; // Clave Catastral INEGI/Municipal: ENT-MUN-ZON-MAN-PRE-EDI-DEP
  neighborhood: string;
  street?: string;
  postalCode?: string;
  landArea: number; // m²
  builtArea: number; // m²
  levelsCount?: number;
  landUse: 'Habitacional' | 'Comercial' | 'Mixto' | 'Equipamiento' | 'Industrial';
  status: 'Registrado' | 'En Revisión' | 'Disputa';
  propertyRegime?: 'Privada' | 'Ejidal' | 'Comunal' | 'Pública' | 'Condominio';
  cadastralValue: number;
  landCadastralValue?: number;
  constructionCadastralValue?: number;
  landValueUnitSqm?: number;
  constructionValueUnitSqm?: number;
  taxStatus?: 'Al Corriente' | 'Con Adeudo' | 'Exento';
  annualPropertyTax?: number;
  taxDebtAmount?: number;
  boundaryNorth?: string;
  boundarySouth?: string;
  boundaryEast?: string;
  boundaryWest?: string;
  cadastralCertificateFolio?: string;
  cadastralCertificateIssuedAt?: string;
  digitalStamp?: string;
  coordinates: [number, number]; // Centroide [lng, lat]
  polygonVertices?: [number, number][];
  owner: string;
  ownerRfc?: string;
  ownerCurp?: string;
}

export interface IncidentItem {
  id: string;
  folio: string;
  title: string;
  type: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  status: 'Recibida' | 'Validada' | 'Asignada' | 'En Proceso' | 'Resuelta' | 'Cerrada';
  description?: string;
  street?: string;
  neighborhood: string;
  citizenName?: string;
  citizenPhone?: string;
  sourceChannel?: 'Portal Web' | 'PWA Campo' | 'Línea 072' | 'Redes Sociales';
  reportedAt: string;
  assignedDept: string;
  assignedCrew?: string;
  slaHours?: number;
  slaDeadline?: string;
  isSlaBreached?: boolean;
  evidenceBeforeUrl?: string;
  evidenceAfterUrl?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  originChannel?: string;
  evidences?: Array<{
    id: string;
    url: string;
    caption: string;
    stage: 'before' | 'after';
    uploadedAt: string;
  }>;
  history?: Array<{
    date: string;
    status: string;
    note: string;
    author: string;
  }>;
  coordinates: [number, number];
}

export interface ProjectEstimation {
  id: string;
  estimationNumber: number;
  period: string;
  grossAmount: number;
  advanceAmortization: number;
  guaranteeRetention: number;
  netPayable: number;
  status: 'DRAFT' | 'VALIDATED_SUPERVISOR' | 'APPROVED_TREASURY' | 'PAID';
  cfdiUuid?: string;
  paidAt?: string;
}

export interface ProjectSCurvePoint {
  month: string;
  planned: number;
  real: number;
  financial: number;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  type: 'Vialidad' | 'Hidráulica' | 'Equipamiento' | 'Electrificación' | string;
  budgetAllocated: number;
  budgetExercised: number;
  progressPercentage: number;
  contractor: string;
  status: 'Planificada' | 'En Ejecución' | 'Licitación' | 'Concluida';
  startDate: string;
  endDate: string;
  contractNumber?: string;
  contractorRfc?: string;
  fundingSource?: string;
  supervisorName?: string;
  physicalProgressPlanned?: number;
  physicalProgressReal?: number;
  financialProgress?: number;
  coordinates?: [number, number];
  sCurve?: ProjectSCurvePoint[];
  estimations?: ProjectEstimation[];
}

export interface LayerItem {
  id: string;
  name: string;
  category: 'Territorio' | 'Catastro' | 'Infraestructura' | 'Operación';
  active: boolean;
  count: number;
  color: string;
}

export interface InfrastructureAssetItem {
  id: string;
  assetCode: string;
  networkType: 'Agua Potable' | 'Drenaje' | 'Alumbrado' | 'Vialidad' | 'Telecom';
  assetType: string;
  status: 'Operativo' | 'En Mantenimiento' | 'Falla / Dañado' | 'Baja';
  condition: 'Excelente' | 'Bueno' | 'Regular' | 'Crítico';
  modelOrBrand: string;
  installationDate: string;
  costInstallation: number;
  accumulatedMaintenanceCost: number;
  expectedLifespanYears: number;
  remainingLifespanYears: number;
  lastInspectionAt?: string;
  nextMaintenanceDue?: string;
  neighborhood: string;
  street: string;
  coordinates: [number, number];
  technicalSpecs: Record<string, any>;
  maintenanceLogs?: MaintenanceLogItem[];
}

export interface MaintenanceLogItem {
  id: string;
  workOrderFolio: string;
  maintenanceType: 'Preventivo' | 'Correctivo' | 'Emergencia';
  cost: number;
  performedAt: string;
  performedBy: string;
  notes: string;
}
