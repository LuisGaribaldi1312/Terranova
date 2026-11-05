import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ing.ramirez@municipio.gob.mx', description: 'Correo electrónico institucional' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'PueblaSegura2026!*', description: 'Contraseña del usuario (mínimo 8 caracteres)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: '123456', description: 'Código TOTP MFA de 6 dígitos si está habilitado', required: false })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}
