import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@ApiTags('Catastro & Predios (TERRANOVA PROPERTIES)')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar predios catastrales de la organización con geometrías y áreas' })
  @ApiHeader({ name: 'x-organization-id', required: false, description: 'ID del tenant' })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.findAll(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha técnica y cédula catastral de un predio' })
  findOne(@Headers('x-organization-id') orgId: string, @Param('id') id: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.findOne(activeOrg, id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo predio con validación topológica ST_IsValid' })
  create(@Headers('x-organization-id') orgId: string, @Body() dto: CreatePropertyDto) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.propertiesService.create(activeOrg, dto);
  }
}
