import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  ConflictException,
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../common/database.service';
import { AuditService } from '../common/audit.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Autenticación con verificación de contraseña BCrypt y validación de MFA
   */
  async login(dto: LoginDto, ipAddress = '127.0.0.1', userAgent = 'TERRANOVA Client') {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas o usuario no registrado');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificación de MFA si está habilitado en la cuenta
    if (user.mfa_enabled) {
      if (!dto.mfaCode) {
        return {
          mfaRequired: true,
          userId: user.id,
          message: 'Se requiere código de autenticación de dos factores (TOTP)',
        };
      }

      const isValidMfa = this.verifyTotp(user.mfa_secret, dto.mfaCode);
      if (!isValidMfa) {
        throw new UnauthorizedException('Código de autenticación multifactor inválido o expirado');
      }
    }

    // Generar tokens de acceso
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role_slug || 'inspector',
    };

    const accessToken = this.jwtService.sign(payload);

    // Registro de auditoría
    await this.audit.log({
      organizationId: user.organization_id || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      userId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      entityName: 'users',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutos
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role_slug || 'inspector',
        roleName: user.role_name || 'Inspector de Campo',
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        organizationCode: user.organization_code,
        mfaEnabled: user.mfa_enabled,
      },
    };
  }

  /**
   * Registro de nuevo usuario institucional con membresía y hashing BCrypt
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`El correo electrónico ${dto.email} ya está registrado`);
    }

    // Hash robusto con BCrypt (factor de costo 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Inserción en base de datos
    const userRes = await this.db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, job_title, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, created_at;`,
      [dto.email.toLowerCase(), passwordHash, dto.firstName, dto.lastName, dto.jobTitle || '', dto.phone || '']
    );

    const newUser = userRes.rows[0];

    // Asignar rol inicial en la organización
    const roleSlug = dto.roleSlug || 'inspector';
    await this.usersService.assignRole(newUser.id, dto.organizationId, roleSlug);

    return {
      message: 'Usuario registrado exitosamente en la organización',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        organizationId: dto.organizationId,
        role: roleSlug,
      },
    };
  }

  /**
   * Generación de secreto para Google Authenticator / Authy
   */
  async generateMfaSecret(userId: string) {
    const secret = crypto.randomBytes(20).toString('hex').slice(0, 32);
    await this.usersService.updateMfa(userId, secret, false);

    const user = await this.usersService.findById(userId);
    const otpAuthUrl = `otpauth://totp/TERRANOVA:${user.email}?secret=${secret}&issuer=TERRANOVA`;

    return {
      secret,
      otpAuthUrl,
      instructions: 'Escanea el código QR o ingresa la clave secreta en Google Authenticator o Authy.',
    };
  }

  /**
   * Confirmación y activación de MFA con código TOTP
   */
  async verifyAndEnableMfa(userId: string, code: string) {
    const user = await this.db.query(`SELECT id, mfa_secret FROM users WHERE id = $1;`, [userId]);
    const secret = user.rows[0]?.mfa_secret;

    if (!secret) {
      throw new BadRequestException('No se ha generado una clave secreta MFA previamente');
    }

    const isValid = this.verifyTotp(secret, code);
    if (!isValid) {
      throw new BadRequestException('Código de verificación incorrecto');
    }

    await this.usersService.updateMfa(userId, secret, true);
    return { status: 'success', message: 'Autenticación Multifactor (MFA) activada correctamente' };
  }

  /**
   * Verificación algorítmica TOTP RFC 6238
   */
  private verifyTotp(secret: string, code: string): boolean {
    if (!secret || !code) return false;
    // Ventana de tolerancia de tiempo de 30 segundos
    const step = 30;
    const epoch = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(epoch / step);

    for (let i = -1; i <= 1; i++) {
      const generated = this.generateTotpCode(secret, currentCounter + i);
      if (generated === code.trim()) {
        return true;
      }
    }
    return false;
  }

  private generateTotpCode(secret: string, counter: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
    hmac.update(buffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);
    const otp = binary % 1000000;
    return String(otp).padStart(6, '0');
  }
}
