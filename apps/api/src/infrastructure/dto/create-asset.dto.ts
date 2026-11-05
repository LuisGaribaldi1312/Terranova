import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'INF-AGU-VAL-00412', description: 'Código único de inventario del activo' })
  @IsNotEmpty()
  @IsString()
  assetCode: string;

  @ApiProperty({ 
    example: 'AGUA_POTABLE', 
    enum: ['AGUA_POTABLE', 'DRENAJE', 'ALUMBRADO', 'VIALIDAD', 'TELECOM'],
    description: 'Red urbana a la que pertenece'
  })
  @IsNotEmpty()
  @IsString()
  networkType: string;

  @ApiProperty({ example: 'Válvula Reguladora de Presión', description: 'Tipo específico de activo' })
  @IsNotEmpty()
  @IsString()
  assetType: string;

  @ApiProperty({ example: 'OPERATIONAL', enum: ['OPERATIONAL', 'MAINTENANCE', 'DAMAGED', 'DECOMMISSIONED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'GOOD', enum: ['EXCELLENT', 'GOOD', 'FAIR', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  assetCondition?: string;

  @ApiProperty({ example: 'Cla-Val Modelo 90-01' })
  @IsOptional()
  @IsString()
  modelOrBrand?: string;

  @ApiProperty({ example: '2023-05-18' })
  @IsOptional()
  @IsString()
  installationDate?: string;

  @ApiProperty({ example: 45000.00, description: 'Costo original de suministro e instalación' })
  @IsOptional()
  @IsNumber()
  costInstallation?: number;

  @ApiProperty({ example: 20, description: 'Vida útil estimada en años' })
  @IsOptional()
  @IsNumber()
  expectedLifespanYears?: number;

  @ApiProperty({ example: 'Av. Juárez y Calle 23 Sur' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 'Col. La Paz' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ 
    example: 'POINT(-98.2285 19.0512)',
    description: 'Geometría WKT (Point o LineString) en proyección WGS84 EPSG:4326'
  })
  @IsNotEmpty()
  @IsString()
  wktGeometry: string;

  @ApiProperty({ 
    example: { diameterInches: 6, pressurePsi: 55, material: 'Hierro Dúctil' },
    description: 'Ficha técnica extensible en JSON'
  })
  @IsOptional()
  technicalSpecs?: Record<string, any>;
}
