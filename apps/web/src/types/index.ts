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
  type: 'Bache' | 'Fuga de Agua' | 'Alumbrado' | 'Basura' | 'Señalización';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  status: 'Recibida' | 'Validada' | 'Asignada' | 'En Proceso' | 'Resuelta' | 'Cerrada';
  neighborhood: string;
  reportedAt: string;
  assignedDept: string;
  coordinates: [number, number];
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  type: 'Vialidad' | 'Hidráulica' | 'Equipamiento' | 'Electrificación';
  budgetAllocated: number;
  budgetExercised: number;
  progressPercentage: number;
  contractor: string;
  status: 'Planificada' | 'En Ejecución' | 'Licitación' | 'Concluida';
  startDate: string;
  endDate: string;
}

export interface LayerItem {
  id: string;
  name: string;
  category: 'Territorio' | 'Catastro' | 'Infraestructura' | 'Operación';
  active: boolean;
  count: number;
  color: string;
}
