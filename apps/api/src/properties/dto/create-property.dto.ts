import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: '21-114-001-045-0012-000', description: 'Clave catastral estandarizada' })
  @IsNotEmpty()
  @IsString()
  cadastralKey: string;

  @ApiProperty({ example: 'URBANO', enum: ['URBANO', 'SUBURBANO', 'RUSTICO', 'INDUSTRIAL'] })
  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @ApiProperty({ example: 'HABITACIONAL', enum: ['HABITACIONAL', 'COMERCIAL', 'MIXTO', 'INDUSTRIAL'] })
  @IsNotEmpty()
  @IsString()
  landUse: string;

  @ApiProperty({ example: 450.50, description: 'Superficie de terreno en metros cuadrados' })
  @IsNotEmpty()
  @IsNumber()
  landAreaSqm: number;

  @ApiProperty({ example: 310.00, description: 'Superficie construida en metros cuadrados' })
  @IsOptional()
  @IsNumber()
  builtAreaSqm?: number;

  @ApiProperty({ example: 3450000.00, description: 'Valor catastral estimado' })
  @IsOptional()
  @IsNumber()
  cadastralValue?: number;

  @ApiProperty({ example: 'Av. Juárez 2108, Col. La Paz' })
  @IsOptional()
  @IsString()
  addressStreet?: string;

  @ApiProperty({ 
    example: 'POLYGON((-98.2285 19.0512, -98.2275 19.0512, -98.2275 19.0505, -98.2285 19.0505, -98.2285 19.0512))',
    description: 'Polígono en WKT o GeoJSON con proyección EPSG:4326'
  })
  @IsNotEmpty()
  @IsString()
  wktPolygon: string;
}
