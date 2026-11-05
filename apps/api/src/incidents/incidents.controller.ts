import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@ApiTags('Incidencias Urbanas (TERRANOVA INCIDENTS)')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar mesa de control de incidencias de la organización' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.findAll(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle y evidencias de una incidencia por ID' })
  findOne(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.findOne(activeOrg, id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva incidencia con geocodificación y generación de folio' })
  create(@Headers('x-organization-id') orgId: string, @Body() dto: CreateIncidentDto) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.incidentsService.create(activeOrg, dto);
  }
}
