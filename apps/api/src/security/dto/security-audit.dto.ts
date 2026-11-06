import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUUID, IsNumber, Min, Max } from 'class-validator';

export enum ScanTriggerType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  PIPELINE_CI_CD = 'PIPELINE_CI_CD',
}

export enum IpRuleAction {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  CHALLENGE = 'CHALLENGE',
}

export class RunSecurityAuditDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @IsEnum(ScanTriggerType)
  @IsOptional()
  trigger?: ScanTriggerType = ScanTriggerType.MANUAL;

  @IsBoolean()
  @IsOptional()
  includeRlsCheck?: boolean = true;

  @IsBoolean()
  @IsOptional()
  includeOwaspCheck?: boolean = true;
}

export class CreateIpRuleDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  ipCidr!: string;

  @IsEnum(IpRuleAction)
  @IsNotEmpty()
  action!: IpRuleAction;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ExportAuditWormDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @IsString()
  @IsNotEmpty()
  periodStart!: string;

  @IsString()
  @IsNotEmpty()
  periodEnd!: string;

  @IsString()
  @IsNotEmpty()
  requestedByEmail!: string;
}

export class ConcurrencyStressDto {
  @IsNumber()
  @Min(10)
  @Max(500)
  @IsOptional()
  concurrentRequestsCount?: number = 100;
}
