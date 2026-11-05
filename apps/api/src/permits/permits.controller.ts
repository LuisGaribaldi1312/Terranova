import { Controller, Get, Post, Patch, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam } from '@nestjs/swagger';
import { PermitsService } from './permits.service';
import { CreatePermitDto, ReviewPermitDto, UpdateRequirementDto } from './dto/permit.dto';

@ApiTags('Permisos y Expedientes Urbanos (TERRANOVA PERMITS)')
@Controller('permits')
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar expedientes de licencias de construcción, uso de suelo y alineamiento' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.findAll(activeOrg);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Métricas ejecutivas de ventanilla única: expedientes, tiempos y tasa de aprobación' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  getStats(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.getStats(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha técnica de expediente digital con checklist de requisitos y dictamen' })
  @ApiParam({ name: 'id', example: 'per-001' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findById(@Param('id') id: string, @Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.findById(id, activeOrg);
  }

  @Post()
  @ApiOperation({ summary: 'Ingresar nuevo trámite o expediente de licencia urbana con clave catastral' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  createPermit(@Body() dto: CreatePermitDto, @Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.createPermit(dto, activeOrg);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Emitir dictamen técnico pericial y generar licencia oficial con sello digital SHA-256' })
  @ApiParam({ name: 'id', example: 'per-001' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  reviewPermit(
    @Param('id') id: string,
    @Body() dto: ReviewPermitDto,
    @Headers('x-organization-id') orgId: string
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.reviewPermit(id, dto, activeOrg);
  }

  @Patch(':id/requirements/:reqId')
  @ApiOperation({ summary: 'Actualizar estatus de validación de documento en checklist' })
  @ApiParam({ name: 'id', example: 'per-001' })
  @ApiParam({ name: 'reqId', example: 'req-1' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  updateRequirement(
    @Param('id') id: string,
    @Param('reqId') reqId: string,
    @Body() dto: UpdateRequirementDto,
    @Headers('x-organization-id') orgId: string
  ) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.permitsService.updateRequirement(id, reqId, dto, activeOrg);
  }
}
