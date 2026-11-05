import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class RecordMaintenanceDto {
  @ApiProperty({ example: 'OT-2026-00812', description: 'Folio de la Orden de Trabajo' })
  @IsNotEmpty()
  @IsString()
  workOrderFolio: string;

  @ApiProperty({ example: 'PREVENTIVE', enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'] })
  @IsNotEmpty()
  @IsString()
  maintenanceType: string;

  @ApiProperty({ example: 4850.00, description: 'Costo total de la intervención' })
  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @ApiProperty({ example: 'Cuadrilla 4 - Red Hidráulica Poniente' })
  @IsNotEmpty()
  @IsString()
  performedBy: string;

  @ApiProperty({ example: 'Sustitución de diafragma y calibración de piloto de presión a 45 PSI.' })
  @IsNotEmpty()
  @IsString()
  notes: string;

  @ApiProperty({ example: 'EXCELLENT', enum: ['EXCELLENT', 'GOOD', 'FAIR', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  newCondition?: string;
}
