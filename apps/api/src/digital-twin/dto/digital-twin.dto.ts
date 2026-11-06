import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBuildings3dDto {
  @ApiProperty({ description: 'ID de la organización / municipio', example: 'd3b07384-d113-4c92-800a-48a609d5718a' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ description: 'Nivel de detalle del modelo', default: 'LoD1', enum: ['LoD1', 'LoD2', 'LoD3'] })
  @IsEnum(['LoD1', 'LoD2', 'LoD3'])
  @IsOptional()
  lod?: 'LoD1' | 'LoD2' | 'LoD3';

  @ApiPropertyOptional({ description: 'Filtrar por colonia o cuadrante' })
  @IsString()
  @IsOptional()
  neighborhood?: string;
}

export class SolarSimulationDto {
  @ApiProperty({ description: 'ID de la organización' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Hora del día (formato 24h, ej. 14.5 para las 14:30h)', minimum: 6, maximum: 19 })
  @IsNumber()
  @Min(6)
  @Max(19)
  timeOfDayHours: number;

  @ApiPropertyOptional({ description: 'Día del año (1 a 365, default solsticio de verano 172)', default: 172 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(365)
  dayOfYear?: number;

  @ApiPropertyOptional({ description: 'Latitud del municipio (ej. 19.0414 para Puebla)', default: 19.0414 })
  @IsNumber()
  @IsOptional()
  latitude?: number;
}

export class RunoffSimulationDto {
  @ApiProperty({ description: 'ID de la organización' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Intensidad de precipitación en mm/hora', default: 50, minimum: 5, maximum: 150 })
  @IsNumber()
  @Min(5)
  @Max(150)
  rainfallIntensityMmH: number;

  @ApiPropertyOptional({ description: 'Duración del evento pluvial en minutos', default: 60 })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;
}
