import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'MUN-PUE-001', description: 'Código único institucional' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Municipio de Puebla, Gobierno Municipal', description: 'Razón social' })
  @IsNotEmpty()
  @IsString()
  legalName: string;

  @ApiProperty({ example: 'H. Ayuntamiento de Puebla', description: 'Nombre comercial' })
  @IsNotEmpty()
  @IsString()
  tradeName: string;

  @ApiProperty({ example: 'MUNICIPALITY', enum: ['MUNICIPALITY', 'STATE_GOV', 'DEVELOPER', 'CONSTRUCTION'] })
  @IsEnum(['MUNICIPALITY', 'STATE_GOV', 'DEVELOPER', 'CONSTRUCTION'])
  tenantType: 'MUNICIPALITY' | 'STATE_GOV' | 'DEVELOPER' | 'CONSTRUCTION';

  @ApiProperty({ example: '21', description: 'Clave INEGI Entidad Federativa (01..32)', required: false })
  @IsOptional()
  @IsString()
  cveEnt?: string;

  @ApiProperty({ example: '114', description: 'Clave INEGI Municipio (001..2477)', required: false })
  @IsOptional()
  @IsString()
  cveMun?: string;
}
