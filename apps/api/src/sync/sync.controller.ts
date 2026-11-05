import { Controller, Get, Post, Body, Query, Param, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncPushDto, ResolveConflictDto } from './dto/sync.dto';

@ApiTags('Sincronización Offline (PWA Sync)')
@Controller('sync')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('handshake')
  @ApiOperation({ summary: 'Verificación de conectividad, latencia y compatibilidad PWA' })
  @ApiQuery({ name: 'organizationId', required: true, description: 'ID de la organización' })
  @ApiQuery({ name: 'clientVersion', required: true, description: 'Versión del cliente PWA' })
  @ApiResponse({ status: 200, description: 'Servidor listo para sincronización bidireccional' })
  async handshake(
    @Query('organizationId') organizationId: string,
    @Query('clientVersion') clientVersion: string,
  ) {
    return this.syncService.handshake(organizationId, clientVersion);
  }

  @Post('push')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recepción transaccional de lote de operaciones offline con garantía de idempotencia' })
  @ApiResponse({ status: 200, description: 'Lote procesado exitosamente sin duplicados' })
  async pushBatch(@Body() dto: SyncPushDto) {
    return this.syncService.processPushBatch(dto);
  }

  @Get('pull')
  @ApiOperation({ summary: 'Descarga delta de cambios del servidor hacia el cliente offline' })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'since', required: false, description: 'Timestamp ISO de la última sincronización' })
  async pullDelta(
    @Query('organizationId') organizationId: string,
    @Query('since') since?: string,
  ) {
    return this.syncService.getDelta(organizationId, since);
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Consulta de conflictos de sincronización concurrentes' })
  @ApiQuery({ name: 'organizationId', required: true })
  async getConflicts(@Query('organizationId') organizationId: string) {
    return this.syncService.getConflicts(organizationId);
  }

  @Post('conflicts/:id/resolve')
  @ApiOperation({ summary: 'Resolución pericial de conflicto de sincronización' })
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body() dto: ResolveConflictDto,
  ) {
    return this.syncService.resolveConflict(conflictId, dto);
  }
}
