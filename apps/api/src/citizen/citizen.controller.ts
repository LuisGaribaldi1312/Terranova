import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CitizenService, CitizenIncidentResponse, TaxBillStatement } from './citizen.service';
import { CreateCitizenReportDto, PayTaxBillDto } from './dto/citizen-portal.dto';

@ApiTags('Citizen Portal (Atención Ciudadana y Autoservicio)')
@Controller('citizen')
export class CitizenController {
  constructor(private readonly citizenService: CitizenService) {}

  @Get('incidents/:folio')
  @ApiOperation({
    summary: 'Consulta pública de incidente o reporte urbano por folio (sin autenticación)',
    description: 'Permite a los ciudadanos rastrear el avance, cuadrilla asignada y evidencias fotográficas de su reporte.',
  })
  @ApiParam({ name: 'folio', example: 'INC-2026-000412' })
  @ApiResponse({ status: 200, description: 'Detalle del reporte y línea de tiempo' })
  @ApiResponse({ status: 404, description: 'Folio no encontrado' })
  lookupIncident(@Param('folio') folio: string): CitizenIncidentResponse {
    return this.citizenService.lookupIncident(folio);
  }

  @Post('incidents')
  @ApiOperation({
    summary: 'Registro ciudadano de incidencia urbana (072 Digital)',
    description: 'Captura pública de fallas en vía pública con coordenadas geográficas y fotografía.',
  })
  @ApiResponse({ status: 201, description: 'Incidencia creada con folio oficial consecutivo' })
  createCitizenReport(@Body() dto: CreateCitizenReportDto): CitizenIncidentResponse {
    return this.citizenService.createCitizenReport(dto);
  }

  @Get('tax-statement')
  @ApiOperation({
    summary: 'Consulta de estado de cuenta predial por Clave Catastral oficial',
    description: 'Desglose oficial de avalúo, alícuota municipal (0.35%), descuento por pronto pago y línea de captura.',
  })
  @ApiQuery({ name: 'cadastralKey', example: '21-114-001-045-0012-000' })
  @ApiResponse({ status: 200, description: 'Estado de cuenta predial con línea de captura bancaria' })
  lookupTaxBill(@Query('cadastralKey') cadastralKey: string): TaxBillStatement {
    return this.citizenService.lookupTaxBill(cadastralKey);
  }

  @Post('tax-statement/pay')
  @ApiOperation({
    summary: 'Simulación y procesamiento de pago de impuesto predial municipal',
    description: 'Aplica el pago bancario (SPEI/Tarjeta/Ventanilla), emite sello digital SHA-256 y marca el estado a PAID.',
  })
  @ApiResponse({ status: 200, description: 'Comprobante digital oficial de pago emitido' })
  processTaxPayment(@Body() dto: PayTaxBillDto): TaxBillStatement {
    return this.citizenService.processTaxPayment(dto);
  }
}
