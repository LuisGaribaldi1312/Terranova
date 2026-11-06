import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GeoAgentType {
  AUTO_ROUTER = 'AUTO_ROUTER',
  GEO_AGENT = 'GEO_AGENT',
  URBAN_AGENT = 'URBAN_AGENT',
  INFRA_AGENT = 'INFRA_AGENT',
  PROJECT_AGENT = 'PROJECT_AGENT',
  INCIDENT_AGENT = 'INCIDENT_AGENT',
}

export class ChatMessageDto {
  @ApiProperty({ description: 'ID de la organización / municipio', example: 'd3b07384-d113-4c92-800a-48a609d5718a' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ description: 'Mensaje o consulta en lenguaje natural del usuario' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ enum: GeoAgentType, default: GeoAgentType.AUTO_ROUTER })
  @IsEnum(GeoAgentType)
  @IsOptional()
  agent?: GeoAgentType;

  @ApiPropertyOptional({ description: 'ID de la sesión de conversación previa' })
  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class ToolCallRecordDto {
  @ApiProperty({ description: 'Nombre de la herramienta controlada invocada' })
  @IsString()
  toolName: string;

  @ApiProperty({ description: 'Parámetros estructurados tipados pasados a la herramienta' })
  arguments: Record<string, any>;

  @ApiProperty({ description: 'Estado de la ejecución' })
  status: 'SUCCESS' | 'BLOCKED_SQL_INJECTION' | 'FAILED';
}

export class OfficialCitationDto {
  @ApiProperty({ description: 'Nombre de la fuente o norma oficial' })
  source: string;

  @ApiProperty({ description: 'Artículo, norma o expediente específico' })
  reference: string;

  @ApiPropertyOptional({ description: 'Fecha de publicación o vigencia' })
  date?: string;
}

export class SuggestedActionDto {
  @ApiProperty({ description: 'Etiqueta del botón de acción' })
  label: string;

  @ApiProperty({ enum: ['FOCUS_MAP', 'VIEW_PERMIT', 'VIEW_PROJECT', 'VIEW_INCIDENT', 'EXPORT_REPORT'] })
  actionType: 'FOCUS_MAP' | 'VIEW_PERMIT' | 'VIEW_PROJECT' | 'VIEW_INCIDENT' | 'EXPORT_REPORT';

  @ApiPropertyOptional({ description: 'Parámetros de la acción (ej. coordenadas o ID)' })
  payload?: any;
}
