import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'lic.torres@municipio.gob.mx', description: 'Correo institucional' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'TerranovaPass2026#', description: 'Contraseña segura' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Lic. Claudia', description: 'Nombre(s)' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Torres Morales', description: 'Apellidos' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Coordinador GIS', description: 'Puesto o cargo institucional', required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ example: '2221234567', description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'ID de la organización o municipio' })
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'gis_coordinator', description: 'Slug del rol asignado (admin, director, gis_coordinator, inspector)', required: false })
  @IsOptional()
  @IsString()
  roleSlug?: string;
}
