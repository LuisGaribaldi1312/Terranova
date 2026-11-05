import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsEnum, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  code: string; // Ej: OP-PUE-2026-004

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  projectType: string; // 'Vialidad', 'Hidráulica', 'Equipamiento', 'Electrificación'

  @IsNumber()
  @Min(0)
  budgetAllocated: number;

  @IsString()
  @IsNotEmpty()
  contractorName: string;

  @IsString()
  @IsOptional()
  contractorRfc?: string;

  @IsString()
  @IsOptional()
  contractNumber?: string;

  @IsString()
  @IsOptional()
  fundingSource?: string; // FAISMUN, FORTAMUN, Recursos Propios

  @IsDateString()
  startDate: string;

  @IsDateString()
  scheduledEndDate: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class CreateEstimationDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsNumber()
  @Min(1)
  estimationNumber: number;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsNumber()
  @Min(0)
  grossAmount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  advanceAmortizationRate?: number; // Por defecto 30%

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  guaranteeRetentionRate?: number; // Por defecto 0.5% (5 al millar)

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  cfdiUuid?: string;
}

export class UpdateEstimationStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['DRAFT', 'VALIDATED_SUPERVISOR', 'APPROVED_TREASURY', 'PAID'])
  status: 'DRAFT' | 'VALIDATED_SUPERVISOR' | 'APPROVED_TREASURY' | 'PAID';

  @IsString()
  @IsOptional()
  cfdiUuid?: string;
}
