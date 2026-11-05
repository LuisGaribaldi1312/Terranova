import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { InfrastructureService } from './infrastructure.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { RecordMaintenanceDto } from './dto/record-maintenance.dto';

@ApiTags('Infraestructura Urbana & Redes (TERRANOVA INFRASTRUCTURE)')
@Controller('infrastructure')
export class InfrastructureController {
  constructor(private readonly infraService: InfrastructureService) {}

  @Get()
  @ApiOperation({ summary: 'Listar activos de infraestructura urbana con filtros temáticos' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  @ApiQuery({ name: 'networkType', required: false, description: 'Filtro por red (AGUA_POTABLE, DRENAJE, ALUMBRADO, VIALIDAD, TELECOM)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtro por estatus operativo' })
  @ApiQuery({ name: 'condition', required: false, description: 'Filtro por condición física (EXCELLENT, GOOD, FAIR, CRITICAL)' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por código, tipo o calle' })
  findAll(
    @Headers('x-organization-id') orgId: string,
    @Query('networkType') networkType?: string,
    @Query('status') status?: string,
    @Query('condition') condition?: string,
    @Query('search') search?: string,
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.findAll(activeOrg, { networkType, status, condition, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'KPIs globales de redes urbanas, operatividad y costos de mantenimiento' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  getStats(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.getStats(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha técnica y bitácora de mantenimiento de un activo' })
  findOne(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.findOne(activeOrg, id);
  }

  @Post()
  @ApiOperation({ summary: 'Dar de alta nuevo activo de infraestructura con validación espacial' })
  create(@Headers('x-organization-id') orgId: string, @Body() dto: CreateAssetDto) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.create(activeOrg, dto);
  }

  @Post(':id/maintenance')
  @ApiOperation({ summary: 'Registrar intervención en bitácora de mantenimiento del activo' })
  recordMaintenance(
    @Headers('x-organization-id') orgId: string,
    @Param('id') id: string,
    @Body() dto: RecordMaintenanceDto,
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.recordMaintenance(activeOrg, id, dto);
  }
}
