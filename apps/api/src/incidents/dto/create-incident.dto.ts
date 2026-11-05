import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Bache profundo en carril central' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Bache', enum: ['Bache', 'Fuga de Agua', 'Alumbrado', 'Basura', 'Señalización'] })
  @IsNotEmpty()
  @IsString()
  incidentType: string;

  @ApiProperty({ example: 'Alta', enum: ['Baja', 'Media', 'Alta', 'Crítica'] })
  @IsEnum(['Baja', 'Media', 'Alta', 'Crítica'])
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';

  @ApiProperty({ example: 'Existe riesgo para vehículos de alta velocidad' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Col. La Paz, frente a Farmacia Guadalajara' })
  @IsOptional()
  @IsString()
  addressReference?: string;

  @ApiProperty({ example: -98.2250, description: 'Longitud WGS84' })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 19.0490, description: 'Latitud WGS84' })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;
}
