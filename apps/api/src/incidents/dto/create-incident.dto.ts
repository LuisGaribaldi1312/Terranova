import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Bache profundo en carril central' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Bache', 
    enum: ['Bache', 'Fuga de Agua', 'Alumbrado', 'Drenaje Obstruido', 'Basura', 'Señalización', 'Poda y Arbolado'] 
  })
  @IsNotEmpty()
  @IsString()
  incidentType: string;

  @ApiProperty({ example: 'Alta', enum: ['Baja', 'Media', 'Alta', 'Crítica'] })
  @IsEnum(['Baja', 'Media', 'Alta', 'Crítica'])
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  @ApiProperty({ example: 'Existe riesgo para vehículos y peatones en el cruce' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Av. Juárez 2108' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 'Col. La Paz' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ example: 'Frente a Farmacia Guadalajara' })
  @IsOptional()
  @IsString()
  addressReference?: string;

  @ApiProperty({ example: 'Lic. Fernando Gómez' })
  @IsOptional()
  @IsString()
  citizenName?: string;

  @ApiProperty({ example: '222-345-6789' })
  @IsOptional()
  @IsString()
  citizenPhone?: string;

  @ApiProperty({ example: 'PORTAL', enum: ['PORTAL', 'FIELD_PWA', 'CALL_CENTER_072', 'SOCIAL_MEDIA'] })
  @IsOptional()
  @IsString()
  sourceChannel?: string;

  @ApiProperty({ example: -98.2250, description: 'Longitud WGS84' })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 19.0490, description: 'Latitud WGS84' })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;
}
