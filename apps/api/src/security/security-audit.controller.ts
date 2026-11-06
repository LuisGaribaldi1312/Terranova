import { Controller, Post, Get, Body, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { SecurityAuditService } from './security-audit.service';
import {
  RunSecurityAuditDto,
  CreateIpRuleDto,
  ExportAuditWormDto,
  ConcurrencyStressDto,
} from './dto/security-audit.dto';

@Controller('security')
export class SecurityAuditController {
  constructor(private readonly securityService: SecurityAuditService) {}

  /**
   * Ejecutar auditoría integral de seguridad y escaneo OWASP
   */
  @Post('audit-scan')
  @UsePipes(new ValidationPipe({ transform: true }))
  async runAudit(@Body() dto: RunSecurityAuditDto) {
    return this.securityService.executeSecurityAudit(dto);
  }

  /**
   * Obtener postura de seguridad actual
   */
  @Get('posture')
  async getPosture(@Query('organizationId') organizationId: string) {
    return this.securityService.executeSecurityAudit({
      organizationId: organizationId || 'a0000000-0000-0000-0000-000000000001',
    });
  }

  /**
   * Crear regla perimetral de filtrado IP
   */
  @Post('ip-rules')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createIpRule(@Body() dto: CreateIpRuleDto) {
    return this.securityService.registerIpRule(dto);
  }

  /**
   * Generar y firmar manifiesto de auditoría legal WORM
   */
  @Post('worm-export')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportWorm(@Body() dto: ExportAuditWormDto) {
    return this.securityService.generateWormManifest(dto);
  }

  /**
   * Ejecutar prueba de estrés concurrente
   */
  @Post('concurrency-stress')
  @UsePipes(new ValidationPipe({ transform: true }))
  async stressTest(@Body() dto: ConcurrencyStressDto) {
    return this.securityService.runConcurrencyStress(dto);
  }
}
