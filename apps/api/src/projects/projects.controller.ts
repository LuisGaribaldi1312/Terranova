import { Controller, Get, Post, Patch, Body, Param, Headers, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateEstimationDto, UpdateEstimationStatusDto } from './dto/project.dto';

@ApiTags('Obras Públicas, Curva S y Estimaciones (TERRANOVA PROJECTS)')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos de obra pública y avance físico-financiero' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.findAll(activeOrg);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Métricas ejecutivas de inversión pública municipal, fondos y avance' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  getStats(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.getStats(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ficha técnica de obra con serie de Curva S y desglose de estimaciones' })
  @ApiParam({ name: 'id', example: 'prj-001' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findById(@Param('id') id: string, @Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.findById(id, activeOrg);
  }

  @Post(':id/estimations')
  @ApiOperation({ summary: 'Registrar estimación de obra con amortización de anticipo y retención 5 al millar' })
  @ApiParam({ name: 'id', example: 'prj-001' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  createEstimation(
    @Param('id') id: string,
    @Body() dto: CreateEstimationDto,
    @Headers('x-organization-id') orgId: string
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.createEstimation({ ...dto, projectId: id }, activeOrg);
  }

  @Patch(':id/estimations/:num/status')
  @ApiOperation({ summary: 'Aprobar o liquidar estimación de obra en tesorería con CFDI' })
  @ApiParam({ name: 'id', example: 'prj-001' })
  @ApiParam({ name: 'num', example: 1 })
  @ApiHeader({ name: 'x-organization-id', required: false })
  updateEstimationStatus(
    @Param('id') id: string,
    @Param('num', ParseIntPipe) num: number,
    @Body() dto: UpdateEstimationStatusDto,
    @Headers('x-organization-id') orgId: string
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.updateEstimationStatus(id, num, dto, activeOrg);
  }
}
