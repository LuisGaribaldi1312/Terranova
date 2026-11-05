import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Matches } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ 
    example: '21-114-001-045-0012-000', 
    description: 'Clave catastral estandarizada mexicana (ENT-MUN-ZON-MAN-PRE-EDI-DEP)' 
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{4}-[0-9]{3}$/, {
    message: 'La clave catastral debe seguir el formato oficial mexicano: ENT-MUN-ZON-MAN-PRE-EDI (ej. 21-114-001-045-0012-000)'
  })
  cadastralKey: string;

  @ApiProperty({ example: 'URBANO', enum: ['URBANO', 'SUBURBANO', 'RUSTICO', 'INDUSTRIAL'] })
  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @ApiProperty({ example: 'HABITACIONAL', enum: ['HABITACIONAL', 'COMERCIAL', 'MIXTO', 'INDUSTRIAL', 'EQUIPAMIENTO'] })
  @IsNotEmpty()
  @IsString()
  landUse: string;

  @ApiProperty({ example: 'PRIVADA', enum: ['PRIVADA', 'EJIDAL', 'COMUNAL', 'PUBLICA', 'CONDOMINIO'] })
  @IsOptional()
  @IsString()
  propertyRegime?: string;

  @ApiProperty({ example: 450.50, description: 'Superficie de terreno en metros cuadrados' })
  @IsNotEmpty()
  @IsNumber()
  landAreaSqm: number;

  @ApiProperty({ example: 310.00, description: 'Superficie construida en metros cuadrados' })
  @IsOptional()
  @IsNumber()
  builtAreaSqm?: number;

  @ApiProperty({ example: 2, description: 'Número de niveles o pisos' })
  @IsOptional()
  @IsNumber()
  levelsCount?: number;

  @ApiProperty({ example: 3500.00, description: 'Valor catastral unitario de terreno ($/m²)' })
  @IsOptional()
  @IsNumber()
  landValueUnitSqm?: number;

  @ApiProperty({ example: 6000.00, description: 'Valor catastral unitario de construcción ($/m²)' })
  @IsOptional()
  @IsNumber()
  constructionValueUnitSqm?: number;

  @ApiProperty({ example: 'CURRENT', enum: ['CURRENT', 'DELINQUENT', 'EXEMPT'] })
  @IsOptional()
  @IsString()
  taxStatus?: string;

  @ApiProperty({ example: 12500.00, description: 'Impuesto predial anual calculado' })
  @IsOptional()
  @IsNumber()
  annualPropertyTax?: number;

  @ApiProperty({ example: 0.00, description: 'Monto de adeudo predial acumulado' })
  @IsOptional()
  @IsNumber()
  taxDebtAmount?: number;

  @ApiProperty({ example: 'Av. Juárez 2108' })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiProperty({ example: 'Col. La Paz' })
  @IsOptional()
  @IsString()
  addressNeighborhood?: string;

  @ApiProperty({ example: '72160' })
  @IsOptional()
  @IsString()
  addressPostalCode?: string;

  @ApiProperty({ example: 'Con Lote 11 (25.00 m)' })
  @IsOptional()
  @IsString()
  boundaryNorth?: string;

  @ApiProperty({ example: 'Con Av. Juárez (18.00 m)' })
  @IsOptional()
  @IsString()
  boundarySouth?: string;

  @ApiProperty({ example: 'Con Lote 14 (25.00 m)' })
  @IsOptional()
  @IsString()
  boundaryEast?: string;

  @ApiProperty({ example: 'Con Calle Teziutlán Sur (18.00 m)' })
  @IsOptional()
  @IsString()
  boundaryWest?: string;

  @ApiProperty({ example: 'Desarrollos e Inmuebles de Puebla S.A. de C.V.' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({ example: 'DIP980312AB3' })
  @IsOptional()
  @IsString()
  ownerRfc?: string;

  @ApiProperty({ 
    example: 'POLYGON((-98.2285 19.0512, -98.2275 19.0512, -98.2275 19.0505, -98.2285 19.0505, -98.2285 19.0512))',
    description: 'Polígono en WKT o GeoJSON con proyección EPSG:4326'
  })
  @IsNotEmpty()
  @IsString()
  wktPolygon: string;
}
