import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@ApiTags('Catastro & Predios (TERRANOVA PROPERTIES)')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar predios catastrales de la organización con filtros y geometrías' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por clave o dirección' })
  @ApiQuery({ name: 'landUse', required: false, description: 'Filtro por uso de suelo' })
  @ApiQuery({ name: 'taxStatus', required: false, description: 'Filtro por estatus de impuesto predial' })
  @ApiQuery({ name: 'propertyRegime', required: false, description: 'Filtro por régimen jurídico' })
  findAll(
    @Headers('x-organization-id') orgId: string,
    @Query('search') search?: string,
    @Query('landUse') landUse?: string,
    @Query('taxStatus') taxStatus?: string,
    @Query('propertyRegime') propertyRegime?: string,
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.findAll(activeOrg, { search, landUse, taxStatus, propertyRegime });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas globales del padrón catastral municipal' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  getStats(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.getCadastreStats(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha técnica completa de un predio' })
  findOne(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.findOne(activeOrg, id);
  }

  @Get(':id/cedula')
  @ApiOperation({ summary: 'Generar Cédula Catastral Oficial con linderos, avalúo y sello digital SHA-256' })
  getCedula(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.generateCedulaCatastral(activeOrg, id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo predio con avalúo automático y validación ST_IsValid' })
  create(@Headers('x-organization-id') orgId: string, @Body() dto: CreatePropertyDto) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.create(activeOrg, dto);
  }
}
