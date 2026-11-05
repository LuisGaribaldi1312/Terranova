import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateCitizenReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string; // 'Bacheo', 'Agua Potable', 'Alumbrado', 'Drenaje', 'Señalización', 'Basura'

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  citizenName: string;

  @IsString()
  @IsNotEmpty()
  citizenPhone: string;

  @IsString()
  @IsOptional()
  evidenceUrl?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class LookupTaxBillDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{4}-[0-9]{3}$/, {
    message: 'La clave catastral debe tener el formato oficial mexicano ENT-MUN-ZON-MAN-PRE-EDI',
  })
  cadastralKey: string;
}

export class PayTaxBillDto {
  @IsString()
  @IsNotEmpty()
  paymentLine: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['SPEI', 'TARJETA_CREDITO', 'VENTANILLA_BANCARIA'])
  paymentMethod: string;

  @IsString()
  @IsOptional()
  bankReference?: string;
}
