import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { InfrastructureService } from './infrastructure.service';

@ApiTags('Infraestructura Urbana (TERRANOVA INFRASTRUCTURE)')
@Controller('infrastructure')
export class InfrastructureController {
  constructor(private readonly infraService: InfrastructureService) {}

  @Get('assets')
  @ApiOperation({ summary: 'Inventario de activos urbanos (luminarias, semáforos, drenaje)' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.infraService.findAll(activeOrg);
  }
}
