import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateProjectDto, CreateEstimationDto, UpdateEstimationStatusDto } from './dto/project.dto';

export interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  projectType: string;
  status: 'Planificada' | 'En Ejecución' | 'Licitación' | 'Concluida';
  budgetAllocated: number;
  budgetExercised: number;
  contractorName: string;
  contractorRfc: string;
  contractNumber: string;
  fundingSource: string;
  supervisorName: string;
  progressPercentage: number;
  physicalProgressPlanned: number;
  physicalProgressReal: number;
  financialProgress: number;
  startDate: string;
  scheduledEndDate: string;
  coordinates: [number, number];
  sCurve: Array<{
    month: string;
    planned: number;
    real: number;
    financial: number;
  }>;
  estimations: Array<{
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
  }>;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  // In-memory mock store sincronizado con el esquema de Puebla
  private mockProjects: ProjectDetail[] = [
    {
      id: 'prj-001',
      code: 'OP-PUE-2026-001',
      name: 'Modernización y Pavimentación con Concreto Hidráulico Blvd. Atlixco',
      projectType: 'Vialidad',
      status: 'En Ejecución',
      budgetAllocated: 48500000.00,
      budgetExercised: 35890000.00,
      contractorName: 'Pavimentos y Urbanizaciones del Altiplano S.A. de C.V.',
      contractorRfc: 'PUA980412KJ1',
      contractNumber: 'COP-PUE-2026-004',
      fundingSource: 'FAISMUN 2026',
      supervisorName: 'Ing. Carlos Mendoza (Supervisión Externa)',
      progressPercentage: 74.0,
      physicalProgressPlanned: 78.0,
      physicalProgressReal: 74.0,
      financialProgress: 74.0,
      startDate: '2026-01-15',
      scheduledEndDate: '2026-06-30',
      coordinates: [19.043, -98.201],
      sCurve: [
        { month: 'Ene 2026', planned: 12.0, real: 14.0, financial: 10.0 },
        { month: 'Feb 2026', planned: 28.0, real: 30.0, financial: 25.0 },
        { month: 'Mar 2026', planned: 48.0, real: 50.0, financial: 45.0 },
        { month: 'Abr 2026', planned: 65.0, real: 66.0, financial: 60.0 },
        { month: 'May 2026', planned: 78.0, real: 74.0, financial: 74.0 },
        { month: 'Jun 2026', planned: 100.0, real: 0.0, financial: 0.0 },
      ],
      estimations: [
        {
          id: 'est-001-1',
          estimationNumber: 1,
          period: '01/01/2026 - 31/01/2026',
          grossAmount: 7275000.00,
          advanceAmortization: 2182500.00, // 30%
          guaranteeRetention: 36375.00,   // 5 al millar (0.5%)
          netPayable: 5056125.00,
          status: 'PAID',
          cfdiUuid: '4A1B2C3D-E5F6-7A8B-9C0D-1E2F3A4B5C6D',
          paidAt: '2026-02-10T14:30:00.000Z',
        },
        {
          id: 'est-001-2',
          estimationNumber: 2,
          period: '01/02/2026 - 28/02/2026',
          grossAmount: 9700000.00,
          advanceAmortization: 2910000.00,
          guaranteeRetention: 48500.00,
          netPayable: 6741500.00,
          status: 'PAID',
          cfdiUuid: '5B2C3D4E-F6A7-8B9C-0D1E-2F3A4B5C6D7E',
          paidAt: '2026-03-12T16:00:00.000Z',
        },
        {
          id: 'est-001-3',
          estimationNumber: 3,
          period: '01/03/2026 - 31/03/2026',
          grossAmount: 11640000.00,
          advanceAmortization: 3492000.00,
          guaranteeRetention: 58200.00,
          netPayable: 8089800.00,
          status: 'PAID',
          cfdiUuid: '6C3D4E5F-A7B8-9C0D-1E2F-3A4B5C6D7E8F',
          paidAt: '2026-04-14T11:20:00.000Z',
        },
        {
          id: 'est-001-4',
          estimationNumber: 4,
          period: '01/04/2026 - 30/04/2026',
          grossAmount: 7275000.00,
          advanceAmortization: 2182500.00,
          guaranteeRetention: 36375.00,
          netPayable: 5056125.00,
          status: 'APPROVED_TREASURY',
          cfdiUuid: '7D4E5F6A-B8C9-0D1E-2F3A-4B5C6D7E8F9A',
        },
      ],
    },
    {
      id: 'prj-002',
      code: 'OP-PUE-2026-002',
      name: 'Construcción Colector Pluvial y Drenaje Sanitario San Baltazar Campeche',
      projectType: 'Hidráulica',
      status: 'En Ejecución',
      budgetAllocated: 24200000.00,
      budgetExercised: 10406000.00,
      contractorName: 'Infraestructura Hidráulica de Puebla S.A.',
      contractorRfc: 'IHP040921MZ3',
      contractNumber: 'COP-PUE-2026-009',
      fundingSource: 'FORTAMUN 2026',
      supervisorName: 'Ing. Laura Beltrán',
      progressPercentage: 43.0,
      physicalProgressPlanned: 45.0,
      physicalProgressReal: 43.0,
      financialProgress: 43.0,
      startDate: '2026-02-01',
      scheduledEndDate: '2026-08-31',
      coordinates: [19.018, -98.214],
      sCurve: [
        { month: 'Feb 2026', planned: 15.0, real: 16.0, financial: 15.0 },
        { month: 'Mar 2026', planned: 30.0, real: 32.0, financial: 30.0 },
        { month: 'Abr 2026', planned: 45.0, real: 43.0, financial: 43.0 },
        { month: 'May 2026', planned: 60.0, real: 0.0, financial: 0.0 },
        { month: 'Jun 2026', planned: 78.0, real: 0.0, financial: 0.0 },
      ],
      estimations: [
        {
          id: 'est-002-1',
          estimationNumber: 1,
          period: '01/02/2026 - 28/02/2026',
          grossAmount: 4840000.00,
          advanceAmortization: 1452000.00,
          guaranteeRetention: 24200.00,
          netPayable: 3363800.00,
          status: 'PAID',
          cfdiUuid: '8E5F6A7B-C9D0-1E2F-3A4B-5C6D7E8F9A0B',
          paidAt: '2026-03-15T12:00:00.000Z',
        },
      ],
    },
    {
      id: 'prj-003',
      code: 'OP-PUE-2026-003',
      name: 'Rehabilitación y Alumbrado LED Parque Centenario Laguna de Chapulco',
      projectType: 'Equipamiento',
      status: 'Concluida',
      budgetAllocated: 12800000.00,
      budgetExercised: 12800000.00,
      contractorName: 'Edificaciones y Alumbrados Ecológicos S.A. de C.V.',
      contractorRfc: 'EAE110815QX9',
      contractNumber: 'COP-PUE-2025-088',
      fundingSource: 'Recursos Propios',
      supervisorName: 'Arq. Fernando Rosas',
      progressPercentage: 100.0,
      physicalProgressPlanned: 100.0,
      physicalProgressReal: 100.0,
      financialProgress: 100.0,
      startDate: '2025-10-01',
      scheduledEndDate: '2026-02-28',
      coordinates: [18.995, -98.223],
      sCurve: [
        { month: 'Oct 2025', planned: 25.0, real: 25.0, financial: 25.0 },
        { month: 'Nov 2025', planned: 50.0, real: 52.0, financial: 50.0 },
        { month: 'Dic 2025', planned: 75.0, real: 76.0, financial: 75.0 },
        { month: 'Ene 2026', planned: 90.0, real: 92.0, financial: 90.0 },
        { month: 'Feb 2026', planned: 100.0, real: 100.0, financial: 100.0 },
      ],
      estimations: [],
    },
  ];

  async findAll(organizationId: string): Promise<ProjectDetail[]> {
    return this.mockProjects;
  }

  async findById(id: string, organizationId: string): Promise<ProjectDetail> {
    const prj = this.mockProjects.find((p) => p.id === id);
    if (!prj) {
      throw new NotFoundException(`Obra o contrato ${id} no encontrado.`);
    }
    return prj;
  }

  async getStats(organizationId: string) {
    const totalAllocated = this.mockProjects.reduce((acc, p) => acc + p.budgetAllocated, 0);
    const totalExercised = this.mockProjects.reduce((acc, p) => acc + p.budgetExercised, 0);
    const activeProjects = this.mockProjects.filter((p) => p.status === 'En Ejecución').length;
    const completedProjects = this.mockProjects.filter((p) => p.status === 'Concluida').length;
    const avgProgress =
      this.mockProjects.length > 0
        ? Number((this.mockProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / this.mockProjects.length).toFixed(1))
        : 0;

    return {
      totalProjects: this.mockProjects.length,
      activeProjects,
      completedProjects,
      totalAllocated,
      totalExercised,
      totalPending: totalAllocated - totalExercised,
      financialExecutionRate: Number(((totalExercised / totalAllocated) * 100).toFixed(1)),
      avgPhysicalProgress: avgProgress,
    };
  }

  async createEstimation(dto: CreateEstimationDto, organizationId: string) {
    const prj = await this.findById(dto.projectId, organizationId);

    const advanceRate = dto.advanceAmortizationRate ?? 30.0; // 30%
    const retentionRate = dto.guaranteeRetentionRate ?? 0.5; // 5 al millar (0.5%)

    const advanceAmortization = Number((dto.grossAmount * (advanceRate / 100)).toFixed(2));
    const guaranteeRetention = Number((dto.grossAmount * (retentionRate / 100)).toFixed(2));
    const netPayable = Number((dto.grossAmount - advanceAmortization - guaranteeRetention).toFixed(2));

    const newEst = {
      id: `est-${prj.id}-${dto.estimationNumber}`,
      estimationNumber: dto.estimationNumber,
      period: `${dto.periodStart} - ${dto.periodEnd}`,
      grossAmount: dto.grossAmount,
      advanceAmortization,
      guaranteeRetention,
      netPayable,
      status: 'DRAFT' as const,
      cfdiUuid: dto.cfdiUuid,
    };

    prj.estimations.push(newEst);
    return newEst;
  }

  async updateEstimationStatus(
    projectId: string,
    estimationNumber: number,
    dto: UpdateEstimationStatusDto,
    organizationId: string
  ) {
    const prj = await this.findById(projectId, organizationId);
    const est = prj.estimations.find((e) => e.estimationNumber === estimationNumber);
    if (!est) {
      throw new NotFoundException(`Estimación #${estimationNumber} no encontrada.`);
    }

    est.status = dto.status;
    if (dto.cfdiUuid) est.cfdiUuid = dto.cfdiUuid;
    if (dto.status === 'PAID') {
      est.paidAt = new Date().toISOString();
      prj.budgetExercised += est.grossAmount;
      prj.financialProgress = Number(((prj.budgetExercised / prj.budgetAllocated) * 100).toFixed(1));
    }

    return est;
  }
}
