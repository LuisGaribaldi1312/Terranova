import { Controller, Get, Post, Patch, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-status.dto';

@ApiTags('Incidencias Urbanas & Mesa de Control (TERRANOVA INCIDENTS)')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar mesa de control de incidencias con filtros y SLA' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtro por estatus' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filtro por prioridad (Baja, Media, Alta, Crítica)' })
  @ApiQuery({ name: 'incidentType', required: false, description: 'Filtro por tipo de reporte' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por folio o ubicación' })
  findAll(
    @Headers('x-organization-id') orgId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('incidentType') incidentType?: string,
    @Query('search') search?: string,
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.findAll(activeOrg, { status, priority, incidentType, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener KPIs de mesa de control, cumplimiento de SLA y tiempos de resolución' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  getStats(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.getStats(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle, evidencias e historial de transiciones de una incidencia' })
  findOne(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.findOne(activeOrg, id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva incidencia con folio consecutivo oficial y cálculo de SLA' })
  create(@Headers('x-organization-id') orgId: string, @Body() dto: CreateIncidentDto) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.create(activeOrg, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estatus operativo, asignar cuadrilla técnica y cerrar incidencia' })
  updateStatus(
    @Headers('x-organization-id') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.updateStatus(activeOrg, id, dto);
  }
}
