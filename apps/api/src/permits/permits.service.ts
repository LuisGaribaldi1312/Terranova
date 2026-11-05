import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreatePermitDto, ReviewPermitDto, UpdateRequirementDto } from './dto/permit.dto';

export interface UrbanPermitItem {
  id: string;
  folio: string;
  permitType: string;
  cadastralKey: string;
  propertyAddress: string;
  neighborhood: string;
  applicantName: string;
  applicantRfc: string;
  applicantPhone: string;
  applicantEmail: string;
  droName: string;
  droLicenseNumber: string;
  projectDescription: string;
  proposedBuiltAreaM2: number;
  levelsCount: number;
  pduZoneClassification: string;
  zoningComplianceStatus: 'COMPATIBLE' | 'CONDICIONADO' | 'INCOMPATIBLE';
  status:
    | 'Ingresado'
    | 'En Revisión Técnica'
    | 'Prevención / Observaciones'
    | 'Dictamen Favorable'
    | 'Aprobado y Sellado'
    | 'Rechazado';
  officialDigitalSeal?: string;
  qrVerificationCode?: string;
  technicalNotes?: string;
  issuedAt?: string;
  expiresAt?: string;
  coordinates: [number, number];
  requirements: Array<{
    id: string;
    documentName: string;
    isMandatory: boolean;
    status: 'PENDIENTE' | 'VALIDADO' | 'OBSERVADO';
    fileUrl?: string;
  }>;
  history: Array<{
    date: string;
    status: string;
    note: string;
    author: string;
  }>;
}

@Injectable()
export class PermitsService {
  private mockPermits: UrbanPermitItem[] = [
    {
      id: 'per-001',
      folio: 'LIC-OBR-2026-00412',
      permitType: 'Licencia de Construcción (Obra Mayor)',
      cadastralKey: '21-114-001-045-0012-000',
      propertyAddress: 'Av. Juárez 2108',
      neighborhood: 'Colonia La Paz, Puebla',
      applicantName: 'Desarrolladora Inmobiliaria Angelópolis S.A. de C.V.',
      applicantRfc: 'DIA120304QW1',
      applicantPhone: '222-245-8900',
      applicantEmail: 'contacto@angelopolis-dev.mx',
      droName: 'Ing. Fernando Valenzuela Ramos',
      droLicenseNumber: 'DRO-PUE-2018-048',
      projectDescription: 'Construcción de edificio corporativo sustentable de 6 niveles con estacionamiento subterráneo.',
      proposedBuiltAreaM2: 2450.00,
      levelsCount: 6,
      pduZoneClassification: 'C-3 (Comercial y Servicios Intensivos)',
      zoningComplianceStatus: 'COMPATIBLE',
      status: 'Aprobado y Sellado',
      officialDigitalSeal: 'c4e7f9a2b1d3085694a1209384756abcdef8901234567fedcba98765432101234',
      qrVerificationCode: 'VERIF-LIC-PUE-2026-00412',
      issuedAt: '2026-03-15T10:00:00.000Z',
      expiresAt: '2028-03-15T23:59:59.000Z', // 24 meses de vigencia legal para obra mayor
      coordinates: [19.043, -98.201],
      requirements: [
        { id: 'req-1', documentName: 'Escritura Pública y Título de Propiedad RPPC', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-2', documentName: 'Boleta de Impuesto Predial 2026 al Corriente', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-3', documentName: 'Memoria de Cálculo y Análisis Estructural Firmada por DRO', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-4', documentName: 'Estudio de Mecánica de Suelos y Sondeo', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-5', documentName: 'Dictamen Favorable de Impacto Vial y Protección Civil', isMandatory: true, status: 'VALIDADO' },
      ],
      history: [
        { date: '2026-03-01T09:00:00.000Z', status: 'Ingresado', note: 'Expediente digital ingresado vía Ventanilla Única', author: 'Ventanilla Única Digital' },
        { date: '2026-03-05T12:00:00.000Z', status: 'En Revisión Técnica', note: 'Revisión por Perito Dictaminador de Obras', author: 'Arq. Mariana Ortiz (Perito Municipal)' },
        { date: '2026-03-12T16:30:00.000Z', status: 'Dictamen Favorable', note: 'Cumple al 100% con coeficientes COS (0.7) y CUS (3.5) del PDU', author: 'Dirección de Desarrollo Urbano' },
        { date: '2026-03-15T10:00:00.000Z', status: 'Aprobado y Sellado', note: 'Licencia formalmente emitida con firma electrónica y QR', author: 'Secretaría de Gestión y Desarrollo Urbano' },
      ],
    },
    {
      id: 'per-002',
      folio: 'LIC-USO-2026-00189',
      permitType: 'Licencia de Uso de Suelo',
      cadastralKey: '21-114-002-018-0004-000',
      propertyAddress: 'Calle 5 Poniente 1304',
      neighborhood: 'Centro Histórico, Puebla',
      applicantName: 'Dra. María Elena Garza',
      applicantRfc: 'GAM850711PL9',
      applicantPhone: '222-198-4422',
      applicantEmail: 'm.garza@consultores.com',
      droName: 'Arq. Roberto Santillán',
      droLicenseNumber: 'DRO-PUE-2015-112',
      projectDescription: 'Cambio de uso de suelo habitacional a consultorio médico y clínica dental especializada.',
      proposedBuiltAreaM2: 320.00,
      levelsCount: 2,
      pduZoneClassification: 'H-M (Habitacional Mixto con Comercio Vecinal)',
      zoningComplianceStatus: 'CONDICIONADO',
      status: 'En Revisión Técnica',
      coordinates: [19.041, -98.204],
      requirements: [
        { id: 'req-201', documentName: 'Escritura Pública Notariada', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-202', documentName: 'Boleta Predial 2026 Liquidada', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-203', documentName: 'Dictamen de Factibilidad INAH (Zona Monumental)', isMandatory: true, status: 'OBSERVADO' },
        { id: 'req-204', documentName: 'Cajones de Estacionamiento en Predio', isMandatory: true, status: 'PENDIENTE' },
      ],
      history: [
        { date: '2026-04-10T11:00:00.000Z', status: 'Ingresado', note: 'Ingreso de solicitud de cambio de uso de suelo', author: 'Ventanilla Única Digital' },
        { date: '2026-04-14T15:20:00.000Z', status: 'En Revisión Técnica', note: 'Se solicita anuencia del Instituto Nacional de Antropología e Historia (INAH)', author: 'Perito Revisor de Centro Histórico' },
      ],
    },
    {
      id: 'per-003',
      folio: 'LIC-ALN-2026-00094',
      permitType: 'Alineamiento y Número Oficial',
      cadastralKey: '21-114-003-012-0056-000',
      propertyAddress: 'Circuito Juan Pablo II No. 2405',
      neighborhood: 'Colonia San Manuel, Puebla',
      applicantName: 'Ing. David Téllez Méndez',
      applicantRfc: 'TEM790324KR2',
      applicantPhone: '222-389-1100',
      applicantEmail: 'dtellez@infraestructura.mx',
      droName: 'Ing. Fernando Valenzuela Ramos',
      droLicenseNumber: 'DRO-PUE-2018-048',
      projectDescription: 'Constancia oficial de alineamiento y asignación de número oficial para deslinde predial.',
      proposedBuiltAreaM2: 0.00,
      levelsCount: 1,
      pduZoneClassification: 'H-2 (Habitacional)',
      zoningComplianceStatus: 'COMPATIBLE',
      status: 'Dictamen Favorable',
      coordinates: [19.022, -98.209],
      requirements: [
        { id: 'req-301', documentName: 'Título de Propiedad Inscrito en RPPC', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-302', documentName: 'Identificación Oficial de Propietario', isMandatory: true, status: 'VALIDADO' },
        { id: 'req-303', documentName: 'Croquis Georreferenciado con Medidas y Colindancias', isMandatory: true, status: 'VALIDADO' },
      ],
      history: [
        { date: '2026-04-20T09:30:00.000Z', status: 'Ingresado', note: 'Solicitud ingresada con levantamiento topográfico', author: 'Ventanilla Digital' },
        { date: '2026-04-24T14:00:00.000Z', status: 'Dictamen Favorable', note: 'Levantamiento topográfico coincide con traza municipal oficial', author: 'Departamento de Cartografía y Alineamiento' },
      ],
    },
  ];

  findAll(orgId: string): UrbanPermitItem[] {
    return this.mockPermits;
  }

  findById(id: string, orgId: string): UrbanPermitItem {
    const permit = this.mockPermits.find((p) => p.id === id || p.folio === id);
    if (!permit) {
      throw new NotFoundException(`Expediente o trámite ${id} no encontrado.`);
    }
    return permit;
  }

  getStats(orgId: string) {
    const total = this.mockPermits.length;
    const approved = this.mockPermits.filter((p) => p.status === 'Aprobado y Sellado' || p.status === 'Dictamen Favorable').length;
    const inReview = this.mockPermits.filter((p) => p.status === 'En Revisión Técnica' || p.status === 'Ingresado').length;
    const withObservations = this.mockPermits.filter((p) => p.status === 'Prevención / Observaciones').length;
    const totalM2Constructed = this.mockPermits.reduce((acc, p) => acc + p.proposedBuiltAreaM2, 0);

    return {
      totalExpedientes: total,
      approved,
      inReview,
      withObservations,
      totalM2Constructed,
      approvalRate: total > 0 ? Number(((approved / total) * 100).toFixed(1)) : 100,
      avgReviewDays: 4.8,
    };
  }

  createPermit(dto: CreatePermitDto, orgId: string): UrbanPermitItem {
    const nextSeq = 412 + this.mockPermits.length + 1;
    const year = new Date().getFullYear();
    const typePrefix =
      dto.permitType.includes('Uso de Suelo') ? 'USO' :
      dto.permitType.includes('Construcción') ? 'OBR' :
      dto.permitType.includes('Alineamiento') ? 'ALN' : 'URB';

    const folio = `LIC-${typePrefix}-${year}-${String(nextSeq).padStart(5, '0')}`;

    const newPermit: UrbanPermitItem = {
      id: `per-${Date.now()}`,
      folio,
      permitType: dto.permitType,
      cadastralKey: dto.cadastralKey,
      propertyAddress: dto.propertyAddress,
      neighborhood: dto.neighborhood,
      applicantName: dto.applicantName,
      applicantRfc: dto.applicantRfc || 'XAXX010101000',
      applicantPhone: dto.applicantPhone || 'N/A',
      applicantEmail: dto.applicantEmail || 'N/A',
      droName: dto.droName || 'Por Asignar en Ventanilla',
      droLicenseNumber: dto.droLicenseNumber || 'S/N',
      projectDescription: dto.projectDescription,
      proposedBuiltAreaM2: dto.proposedBuiltAreaM2,
      levelsCount: dto.levelsCount,
      pduZoneClassification: 'H-2 (Habitacional)',
      zoningComplianceStatus: 'COMPATIBLE',
      status: 'Ingresado',
      coordinates: [dto.latitude || 19.043, dto.longitude || -98.201],
      requirements: [
        { id: `req-${Date.now()}-1`, documentName: 'Escritura Pública y Boleta Predial', isMandatory: true, status: 'VALIDADO' },
        { id: `req-${Date.now()}-2`, documentName: 'Memoria Técnica y Planos Arquitectónicos', isMandatory: true, status: 'PENDIENTE' },
        { id: `req-${Date.now()}-3`, documentName: 'Carta Responsiva de DRO / Perito', isMandatory: true, status: 'PENDIENTE' },
      ],
      history: [
        {
          date: new Date().toISOString(),
          status: 'Ingresado',
          note: `Expediente ingresado por ${dto.applicantName}.`,
          author: 'Ventanilla Única Digital',
        },
      ],
    };

    this.mockPermits.unshift(newPermit);
    return newPermit;
  }

  reviewPermit(id: string, dto: ReviewPermitDto, orgId: string): UrbanPermitItem {
    const permit = this.findById(id, orgId);

    permit.status = dto.status;
    if (dto.zoningComplianceStatus) {
      permit.zoningComplianceStatus = dto.zoningComplianceStatus;
    }
    permit.technicalNotes = dto.technicalNotes;

    // Si se aprueba formalmente, emitimos el Sello Digital SHA-256 oficial y vigencia reglamentaria
    if (dto.status === 'Aprobado y Sellado') {
      const issuedAt = new Date().toISOString();
      const isObraMayor = permit.permitType.includes('Obra Mayor');
      // 24 meses para obra mayor, 12 meses para obra menor / uso de suelo
      const validityMonths = isObraMayor ? 24 : 12;
      const expires = new Date();
      expires.setMonth(expires.getMonth() + validityMonths);

      const rawPayload = `${permit.folio}|${permit.cadastralKey}|${permit.droLicenseNumber}|${issuedAt}|${expires.toISOString()}`;
      const officialSeal = crypto.createHash('sha256').update(rawPayload).digest('hex');

      permit.issuedAt = issuedAt;
      permit.expiresAt = expires.toISOString();
      permit.officialDigitalSeal = officialSeal;
      permit.qrVerificationCode = `VERIF-LIC-${permit.folio}`;
    }

    permit.history.push({
      date: new Date().toISOString(),
      status: dto.status,
      note: dto.technicalNotes,
      author: dto.reviewedBy || 'Dirección de Desarrollo Urbano Municipal',
    });

    return permit;
  }

  updateRequirement(permitId: string, reqId: string, dto: UpdateRequirementDto, orgId: string) {
    const permit = this.findById(permitId, orgId);
    const req = permit.requirements.find((r) => r.id === reqId);
    if (!req) {
      throw new NotFoundException(`Requisito ${reqId} no encontrado en el expediente.`);
    }

    req.status = dto.status;
    return req;
  }
}
