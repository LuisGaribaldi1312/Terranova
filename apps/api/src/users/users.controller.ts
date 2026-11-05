import { Controller, Get, Post, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Usuarios & Membresías (RBAC)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios de la organización activa con sus roles asignados' })
  @ApiHeader({ name: 'x-organization-id', required: false })
  findAll(@Headers('x-organization-id') orgId: string) {
    const activeOrg = orgId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    return this.usersService.findAllByOrganization(activeOrg);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar información de perfil institucional de un usuario' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post(':id/assign-role')
  @ApiOperation({ summary: 'Asignar o cambiar el rol de un usuario en la organización' })
  @ApiHeader({ name: 'x-organization-id', required: true })
  assignRole(
    @Param('id') id: string,
    @Headers('x-organization-id') orgId: string,
    @Body() body: { roleSlug: string; departmentId?: string }
  ) {
    return this.usersService.assignRole(id, orgId, body.roleSlug, body.departmentId);
  }
}
