import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyMfaDto } from './dto/mfa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Autenticación, Sesiones & MFA (TERRANOVA AUTH)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión con credenciales y verificación opcional de MFA TOTP' })
  @ApiResponse({ status: 200, description: 'JWT Access Token y perfil del usuario' })
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser';
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario institucional vinculado a una organización' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar perfil del usuario autenticado con su rol y permisos' })
  getProfile(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user,
    };
  }

  @Post('mfa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar clave secreta y URI para Google Authenticator' })
  generateMfa(@CurrentUser() user: any) {
    return this.authService.generateMfaSecret(user.userId);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar código TOTP de 6 dígitos y activar MFA en la cuenta' })
  verifyMfa(@CurrentUser() user: any, @Body() dto: VerifyMfaDto) {
    return this.authService.verifyAndEnableMfa(user.userId, dto.code);
  }
}
