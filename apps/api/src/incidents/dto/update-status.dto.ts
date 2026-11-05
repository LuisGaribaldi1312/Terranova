import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateIncidentStatusDto {
  @ApiProperty({ 
    example: 'IN_PROGRESS', 
    enum: ['RECEIVED', 'VALIDATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    description: 'Nuevo estatus en el flujo de atención'
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ example: 'Cuadrilla 2 - Bacheo y Pavimentos', required: false })
  @IsOptional()
  @IsString()
  assignedCrew?: string;

  @ApiProperty({ example: 'Cuadrilla despachada con 4 toneladas de mezcla asfáltica en caliente.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'Bache reparado y compactado al 95% con sello perimetral.' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiProperty({ example: 'https://storage.terranova.mx/evidence/inc-2026-000412-after.jpg' })
  @IsOptional()
  @IsString()
  evidenceAfterUrl?: string;
}
