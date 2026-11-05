import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { GisService } from './gis.service';

@ApiTags('Inteligencia Geoespacial & GIS (TERRANOVA GIS)')
@Controller('gis')
export class GisController {
  constructor(private readonly gisService: GisService) {}

  @Get('layers')
  @ApiOperation({ summary: 'Obtener capas temáticas y simbologías configuradas' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  getLayers(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.gisService.getLayers(activeOrg);
  }

  @Get('distance')
  @ApiOperation({ summary: 'Cálculo de distancia geodésica oficial de México en EPSG:6362' })
  @ApiQuery({ name: 'lng1', example: -98.2285 })
  @ApiQuery({ name: 'lat1', example: 19.0512 })
  @ApiQuery({ name: 'lng2', example: -98.1983 })
  @ApiQuery({ name: 'lat2', example: 19.0438 })
  calculateDistance(
    @Query('lng1') lng1: number,
    @Query('lat1') lat1: number,
    @Query('lng2') lng2: number,
    @Query('lat2') lat2: number
  ) {
    return this.gisService.calculateDistance(Number(lng1), Number(lat1), Number(lng2), Number(lat2));
  }
}
