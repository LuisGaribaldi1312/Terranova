import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyMfaDto {
  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos generado por Google Authenticator o Authy' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
