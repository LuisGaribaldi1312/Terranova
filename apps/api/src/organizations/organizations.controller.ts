import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@ApiTags('Organizaciones & Multi-Tenant')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar organizaciones y municipios registrados' })
  @ApiResponse({ status: 200, description: 'Catálogo de organizaciones activas' })
  findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar organización por ID' })
  findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nueva organización o municipio' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.create(dto);
  }
}
