import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SyncEntityType {
  INCIDENTS = 'incidents',
  INSPECTIONS = 'inspections',
  PROPERTIES = 'properties',
  ASSETS = 'assets',
}

export enum SyncOperationType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class SyncOperationItemDto {
  @ApiProperty({ description: 'Identificador único de la operación generado en el cliente móvil (UUID v4)' })
  @IsUUID('4')
  @IsNotEmpty()
  clientOperationId: string;

  @ApiProperty({ enum: SyncEntityType, description: 'Tipo de entidad objetivo' })
  @IsEnum(SyncEntityType)
  entityType: SyncEntityType;

  @ApiProperty({ enum: SyncOperationType, description: 'Tipo de mutación' })
  @IsEnum(SyncOperationType)
  operationType: SyncOperationType;

  @ApiProperty({ description: 'Payload con los datos de la entidad' })
  @IsNotEmpty()
  payload: any;

  @ApiProperty({ description: 'Timestamp ISO de captura en campo en el dispositivo' })
  @IsString()
  @IsNotEmpty()
  clientTimestamp: string;
}

export class SyncPushDto {
  @ApiProperty({ description: 'ID de la organización / municipio', example: 'd3b07384-d113-4c92-800a-48a609d5718a' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional({ description: 'ID del usuario / brigadista en campo' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Versión del cliente PWA', example: '1.10.0' })
  @IsString()
  @IsNotEmpty()
  clientVersion: string;

  @ApiProperty({ type: [SyncOperationItemDto], description: 'Lote de operaciones transaccionales pendientes' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationItemDto)
  operations: SyncOperationItemDto[];
}

export class SyncHandshakeDto {
  @ApiProperty({ description: 'ID de la organización' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Versión del cliente PWA' })
  @IsString()
  @IsNotEmpty()
  clientVersion: string;
}

export class ResolveConflictDto {
  @ApiProperty({ enum: ['RESOLVED_CLIENT', 'RESOLVED_SERVER', 'MERGED'], description: 'Estrategia de resolución' })
  @IsEnum(['RESOLVED_CLIENT', 'RESOLVED_SERVER', 'MERGED'])
  resolutionStrategy: 'RESOLVED_CLIENT' | 'RESOLVED_SERVER' | 'MERGED';

  @ApiPropertyOptional({ description: 'Payload fusionado en caso de resolución MERGED' })
  @IsOptional()
  mergedPayload?: any;

  @ApiProperty({ description: 'Notas u observaciones del supervisor' })
  @IsString()
  @IsNotEmpty()
  resolutionNotes: string;
}
