import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncBatchDto } from './dto/sync-batch.dto';

@ApiTags('Sincronización Offline (TERRANOVA SYNC)')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Recibir lote de mutaciones capturadas sin internet con garantía de idempotencia' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  push(
    @Headers('x-organization-id') orgId: string,
    @Body() dto: SyncBatchDto
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const systemUser = 'd4e5f6a7-b89c-0d1e-2f3a-4b5c6d7e8f9a';
    return this.syncService.processSyncBatch(activeOrg, systemUser, dto);
  }

  @Get('catalogs')
  @ApiOperation({ summary: 'Descargar catálogos maestros para persistencia local en Dexie.js' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  getCatalogs(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.syncService.getCatalogsForOffline(activeOrg);
  }
}
