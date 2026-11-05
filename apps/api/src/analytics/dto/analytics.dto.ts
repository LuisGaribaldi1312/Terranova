import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsTimeframe {
  LAST_7_DAYS = '7D',
  LAST_30_DAYS = '30D',
  LAST_90_DAYS = '90D',
  YEAR_TO_DATE = 'YTD',
}

export class AnalyticsQueryDto {
  @ApiProperty({ description: 'ID de la organización / municipio', example: 'd3b07384-d113-4c92-800a-48a609d5718a' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ enum: AnalyticsTimeframe, default: AnalyticsTimeframe.LAST_30_DAYS })
  @IsEnum(AnalyticsTimeframe)
  @IsOptional()
  timeframe?: AnalyticsTimeframe;

  @ApiPropertyOptional({ description: 'Filtrar por colonia específica' })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de incidente o infraestructura' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class HeatmapQueryDto {
  @ApiProperty({ description: 'ID de la organización / municipio' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ description: 'Resolución de cuadrícula en grados (ej. 0.005 para ~500m)', default: 0.005 })
  @IsNumber()
  @IsOptional()
  @Min(0.001)
  @Max(0.05)
  gridResolution?: number;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de falla urbana' })
  @IsString()
  @IsOptional()
  type?: string;
}

export class ExportReportDto {
  @ApiProperty({ description: 'ID de la organización' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ enum: ['PDF', 'CSV', 'EXCEL'], description: 'Formato de exportación solicitado' })
  @IsEnum(['PDF', 'CSV', 'EXCEL'])
  format: 'PDF' | 'CSV' | 'EXCEL';

  @ApiPropertyOptional({ enum: AnalyticsTimeframe })
  @IsEnum(AnalyticsTimeframe)
  @IsOptional()
  timeframe?: AnalyticsTimeframe;
}
