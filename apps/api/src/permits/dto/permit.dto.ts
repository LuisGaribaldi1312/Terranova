import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, Matches } from 'class-validator';

export class CreatePermitDto {
  @IsString()
  @IsNotEmpty()
  permitType:
    | 'Licencia de Uso de Suelo'
    | 'Alineamiento y Número Oficial'
    | 'Licencia de Construcción (Obra Mayor)'
    | 'Licencia de Construcción (Obra Menor)'
    | 'Terminación de Obra y Ocupación'
    | 'Factibilidad de Servicios Urbanos';

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]{3}-[0-9]{4}-[0-9]{3}$/, {
    message: 'La clave catastral debe tener el formato oficial mexicano ENT-MUN-ZON-MAN-PRE-EDI',
  })
  cadastralKey: string;

  @IsString()
  @IsNotEmpty()
  propertyAddress: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @IsString()
  @IsOptional()
  applicantRfc?: string;

  @IsString()
  @IsOptional()
  applicantEmail?: string;

  @IsString()
  @IsOptional()
  applicantPhone?: string;

  @IsString()
  @IsOptional()
  droName?: string;

  @IsString()
  @IsOptional()
  droLicenseNumber?: string;

  @IsString()
  @IsNotEmpty()
  projectDescription: string;

  @IsNumber()
  @Min(0)
  proposedBuiltAreaM2: number;

  @IsNumber()
  @Min(1)
  levelsCount: number;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class ReviewPermitDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'En Revisión Técnica',
    'Prevención / Observaciones',
    'Dictamen Favorable',
    'Aprobado y Sellado',
    'Rechazado',
  ])
  status:
    | 'En Revisión Técnica'
    | 'Prevención / Observaciones'
    | 'Dictamen Favorable'
    | 'Aprobado y Sellado'
    | 'Rechazado';

  @IsString()
  @IsOptional()
  @IsEnum(['COMPATIBLE', 'CONDICIONADO', 'INCOMPATIBLE'])
  zoningComplianceStatus?: 'COMPATIBLE' | 'CONDICIONADO' | 'INCOMPATIBLE';

  @IsString()
  @IsNotEmpty()
  technicalNotes: string;

  @IsString()
  @IsOptional()
  reviewedBy?: string;
}

export class UpdateRequirementDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['PENDIENTE', 'VALIDADO', 'OBSERVADO'])
  status: 'PENDIENTE' | 'VALIDADO' | 'OBSERVADO';

  @IsString()
  @IsOptional()
  validatedBy?: string;
}
