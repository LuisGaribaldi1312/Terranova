import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateCitizenReportDto, PayTaxBillDto } from './dto/citizen-portal.dto';

export interface CitizenIncidentResponse {
  folio: string;
  title: string;
  type: string;
  neighborhood: string;
  status: 'Recibida' | 'Validada' | 'Asignada' | 'En Proceso' | 'Resuelta';
  reportedAt: string;
  slaDeadline: string;
  assignedCrew?: string;
  progressPercentage: number;
  history: Array<{
    date: string;
    status: string;
    note: string;
  }>;
  evidences?: Array<{
    url: string;
    caption: string;
    stage: 'before' | 'after';
  }>;
}

export interface TaxBillStatement {
  paymentLine: string;
  cadastralKey: string;
  taxpayerName: string;
  fiscalYear: number;
  propertyAddress: string;
  neighborhood: string;
  landAreaM2: number;
  builtAreaM2: number;
  landCadastralValue: number;
  builtCadastralValue: number;
  totalCadastralValue: number;
  baseTaxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  totalDue: number;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED';
  expiresAt: string;
  paidAt?: string;
  digitalSeal?: string;
}

@Injectable()
export class CitizenService {
  // Mock In-Memory Store con persistencia de ciclo de vida para el portal ciudadano
  private publicIncidents: Map<string, CitizenIncidentResponse> = new Map([
    [
      'INC-2026-000412',
      {
        folio: 'INC-2026-000412',
        title: 'Bache profundo en carril de alta velocidad',
        type: 'Bacheo',
        neighborhood: 'Centro Histórico, Puebla',
        status: 'En Proceso',
        reportedAt: '2026-11-05T08:30:00.000Z',
        slaDeadline: '2026-11-06T08:30:00.000Z',
        assignedCrew: 'Cuadrilla Bacheo y Asfalto 03 (Centro)',
        progressPercentage: 65,
        history: [
          { date: '2026-11-05T08:30:00.000Z', status: 'Recibida', note: 'Reporte ingresado vía App Ciudadana con fotografía' },
          { date: '2026-11-05T09:15:00.000Z', status: 'Validada', note: 'Verificación técnica por Mesa de Control 072' },
          { date: '2026-11-05T10:00:00.000Z', status: 'Asignada', note: 'Cuadrilla Bacheo 03 despachada a sitio' },
          { date: '2026-11-05T11:20:00.000Z', status: 'En Proceso', note: 'Corte de asfalto dañado y aplicación de emulsión' },
        ],
        evidences: [
          {
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
            caption: 'Evidencia inicial del bache',
            stage: 'before',
          },
        ],
      },
    ],
    [
      'INC-2026-000413',
      {
        folio: 'INC-2026-000413',
        title: 'Fuga en red secundaria de 4 pulgadas',
        type: 'Agua Potable',
        neighborhood: 'Colonia La Paz, Puebla',
        status: 'Asignada',
        reportedAt: '2026-11-05T09:45:00.000Z',
        slaDeadline: '2026-11-05T13:45:00.000Z',
        assignedCrew: 'Cuadrilla Hidráulica 01 (Oriente)',
        progressPercentage: 40,
        history: [
          { date: '2026-11-05T09:45:00.000Z', status: 'Recibida', note: 'Reporte de emergencia ciudadana 072' },
          { date: '2026-11-05T10:05:00.000Z', status: 'Asignada', note: 'Brigada de emergencia hidráulica en ruta' },
        ],
        evidences: [
          {
            url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
            caption: 'Derrame de agua potable sobre banqueta',
            stage: 'before',
          },
        ],
      },
    ],
  ]);

  private taxBills: Map<string, TaxBillStatement> = new Map([
    [
      '21-114-001-045-0012-000',
      {
        paymentLine: '21114012026000048123',
        cadastralKey: '21-114-001-045-0012-000',
        taxpayerName: 'Ing. Alejandro Morales V.',
        fiscalYear: 2026,
        propertyAddress: 'Av. Juárez 2108, Col. La Paz',
        neighborhood: 'La Paz, Puebla',
        landAreaM2: 485.50,
        builtAreaM2: 320.00,
        landCadastralValue: 1699250.00,
        builtCadastralValue: 1760000.00,
        totalCadastralValue: 3459250.00,
        baseTaxAmount: 12107.38,
        discountPercentage: 15, // Descuento pronto pago
        discountAmount: 1816.11,
        totalDue: 10291.27,
        paymentStatus: 'PENDING',
        expiresAt: '2026-12-31T23:59:59.000Z',
      },
    ],
    [
      '21-114-002-018-0004-000',
      {
        paymentLine: '21114012026000089456',
        cadastralKey: '21-114-002-018-0004-000',
        taxpayerName: 'Dra. María Elena Garza',
        fiscalYear: 2026,
        propertyAddress: 'Calle 5 Poniente 1304, Centro Histórico',
        neighborhood: 'Centro Histórico, Puebla',
        landAreaM2: 310.20,
        builtAreaM2: 245.00,
        landCadastralValue: 1085700.00,
        builtCadastralValue: 1347500.00,
        totalCadastralValue: 2433200.00,
        baseTaxAmount: 8516.20,
        discountPercentage: 15,
        discountAmount: 1277.43,
        totalDue: 7238.77,
        paymentStatus: 'PAID',
        expiresAt: '2026-12-31T23:59:59.000Z',
        paidAt: '2026-11-04T16:20:00.000Z',
        digitalSeal: 'e7b9c2a1f480392d54e60183acbd9284fa0192837465abcde9876543210fedcb',
      },
    ],
  ]);

  /**
   * Consulta pública de reporte ciudadano por folio
   */
  lookupIncident(folio: string): CitizenIncidentResponse {
    const normalized = folio.trim().toUpperCase();
    const incident = this.publicIncidents.get(normalized);
    if (!incident) {
      throw new NotFoundException(`No se encontró ningún reporte con el folio ${folio}. Verifique e intente nuevamente.`);
    }
    return incident;
  }

  /**
   * Registro exprés de nuevo reporte ciudadano
   */
  createCitizenReport(dto: CreateCitizenReportDto): CitizenIncidentResponse {
    const consecutive = 415 + this.publicIncidents.size + 1;
    const year = new Date().getFullYear();
    const folio = `INC-${year}-${String(consecutive).padStart(6, '0')}`;
    const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24h por defecto

    const newReport: CitizenIncidentResponse = {
      folio,
      title: dto.title,
      type: dto.type,
      neighborhood: dto.neighborhood,
      status: 'Recibida',
      reportedAt: new Date().toISOString(),
      slaDeadline: deadline,
      assignedCrew: 'En proceso de asignación por Mesa de Control',
      progressPercentage: 15,
      history: [
        {
          date: new Date().toISOString(),
          status: 'Recibida',
          note: `Reporte ingresado por el ciudadano ${dto.citizenName} vía Portal Web Ciudadano.`,
        },
      ],
      evidences: dto.evidenceUrl
        ? [
            {
              url: dto.evidenceUrl,
              caption: 'Evidencia fotográfica inicial del ciudadano',
              stage: 'before',
            },
          ]
        : [],
    };

    this.publicIncidents.set(folio, newReport);
    return newReport;
  }

  /**
   * Consulta pública de estado de cuenta predial por Clave Catastral
   */
  lookupTaxBill(cadastralKey: string): TaxBillStatement {
    const key = cadastralKey.trim();
    let statement = this.taxBills.get(key);

    if (!statement) {
      // Si la clave no está precargada, calculamos dinámicamente el estado de cuenta
      const parts = key.split('-');
      if (parts.length < 6) {
        throw new BadRequestException('Clave catastral incompleta o inválida.');
      }
      const ent = parts[0] || '21';
      const mun = parts[1] || '114';
      const landArea = 350.0;
      const builtArea = 210.0;
      const landVal = landArea * 3200;
      const builtVal = builtArea * 4800;
      const totalVal = landVal + builtVal;
      const baseTax = Number((totalVal * 0.0035).toFixed(2));
      const discount = Number((baseTax * 0.15).toFixed(2));
      const total = Number((baseTax - discount).toFixed(2));

      const line = this.generateBankPaymentLine(ent, mun, this.taxBills.size + 1);

      statement = {
        paymentLine: line,
        cadastralKey: key,
        taxpayerName: 'Propietario Registrado en Padrón Municipal',
        fiscalYear: 2026,
        propertyAddress: `Sector Catastral Zona ${parts[2]} Manzana ${parts[3]}`,
        neighborhood: 'Municipio de Puebla, Pue.',
        landAreaM2: landArea,
        builtAreaM2: builtArea,
        landCadastralValue: landVal,
        builtCadastralValue: builtVal,
        totalCadastralValue: totalVal,
        baseTaxAmount: baseTax,
        discountPercentage: 15,
        discountAmount: discount,
        totalDue: total,
        paymentStatus: 'PENDING',
        expiresAt: '2026-12-31T23:59:59.000Z',
      };
      this.taxBills.set(key, statement);
    }

    return statement;
  }

  /**
   * Generación y procesamiento de pago de impuesto predial
   */
  processTaxPayment(dto: PayTaxBillDto): TaxBillStatement {
    let foundStatement: TaxBillStatement | null = null;
    let foundKey = '';

    for (const [k, bill] of this.taxBills.entries()) {
      if (bill.paymentLine === dto.paymentLine) {
        foundStatement = bill;
        foundKey = k;
        break;
      }
    }

    if (!foundStatement) {
      throw new NotFoundException(`Línea de captura ${dto.paymentLine} no encontrada.`);
    }

    if (foundStatement.paymentStatus === 'PAID') {
      return foundStatement;
    }

    const paidAt = new Date().toISOString();
    const rawPayload = `${foundStatement.paymentLine}|${foundStatement.cadastralKey}|${foundStatement.totalDue}|${paidAt}|${dto.paymentMethod}`;
    const digitalSeal = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const updatedStatement: TaxBillStatement = {
      ...foundStatement,
      paymentStatus: 'PAID',
      paidAt,
      digitalSeal,
    };

    this.taxBills.set(foundKey, updatedStatement);
    return updatedStatement;
  }

  /**
   * Algoritmo de línea de captura bancaria mexicana de 20 dígitos:
   * [Entidad 2][Municipio 3][Concepto 2][Año 4][Folio 7][Checksum Módulo 10: 2]
   */
  generateBankPaymentLine(entidad: string, municipio: string, folioNum = 1): string {
    const ent = entidad.padStart(2, '0').slice(0, 2);
    const mun = municipio.padStart(3, '0').slice(0, 3);
    const concepto = '01'; // 01 = Impuesto Predial
    const anio = '2026';
    const folio = String(folioNum).padStart(7, '0').slice(0, 7);

    const base = `${ent}${mun}${concepto}${anio}${folio}`; // 18 dígitos

    // Cálculo de dígito verificador Módulo 10 ponderado
    const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      let prod = parseInt(base[i], 10) * weights[i];
      if (prod >= 10) prod = Math.floor(prod / 10) + (prod % 10);
      sum += prod;
    }
    const check1 = (10 - (sum % 10)) % 10;
    const check2 = (check1 * 3 + 7) % 10;

    return `${base}${check1}${check2}`;
  }
}
