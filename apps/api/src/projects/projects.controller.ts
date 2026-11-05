import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('Obras & Proyectos (TERRANOVA PROJECTS)')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar obras públicas y proyectos de infraestructura con avance de Curva S' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.projectsService.findAll(activeOrg);
  }
}
