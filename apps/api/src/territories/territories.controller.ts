import { Controller, Get, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TerritoriesService } from './territories.service';

@ApiTags('Territorios & Marco Geoestadístico INEGI')
@Controller('territories')
export class TerritoriesController {
  constructor(private readonly territoriesService: TerritoriesService) {}

  @Get('states')
  @ApiOperation({ summary: 'Obtener las 32 Entidades Federativas de México (INEGI)' })
  getStates() {
    return this.territoriesService.getMexicanStates();
  }

  @Get('states/:cveEnt/municipalities')
  @ApiOperation({ summary: 'Consultar municipios por Clave de Estado' })
  getMunicipalities(@Param('cveEnt') cveEnt: string) {
    return this.territoriesService.getMunicipalitiesByState(cveEnt);
  }

  @Get('neighborhoods')
  @ApiOperation({ summary: 'Listar colonias y sectores territoriales de la organización activa' })
  getNeighborhoods(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.territoriesService.getNeighborhoods(activeOrg);
  }
}
