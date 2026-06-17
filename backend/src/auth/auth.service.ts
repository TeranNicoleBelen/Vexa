import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as svgCaptcha from 'svg-captcha';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../common/logger.service';

// Almacén temporal de captchas
const captchaStore = new Map<string, { text: string; created: number }>();

// Limpiar captchas expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of captchaStore.entries()) {
    if (now - val.created > 5 * 60 * 1000) captchaStore.delete(key);
  }
}, 5 * 60 * 1000);

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  getCaptcha() {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: '#fff0f5',
      width: 160,
      height: 50,
      fontSize: 42,
    });
    const id = uuidv4();
    captchaStore.set(id, { text: captcha.text.toLowerCase(), created: Date.now() });
    return { success: true, captchaId: id, svg: captcha.data };
  }

  async login(body: any, clientInfo: any) {
    const { email, password, captchaId, captchaText } = body;
    const { browser, sistema_operativo, ip } = clientInfo;

    const stored = captchaStore.get(captchaId);
    if (!stored || stored.text !== (captchaText || '').toLowerCase()) {
      await this.logger.logAcceso({ email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'CAPTCHA inválido' });
      throw new BadRequestException('CAPTCHA inválido o expirado');
    }
    captchaStore.delete(captchaId);

    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    const [rows] = await this.db.query(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = ? AND u.eliminado = 0',
      [email],
    );

    if (rows.length === 0) {
      await this.logger.logAcceso({ email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'Email no encontrado' });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const user = rows[0];
    if (!user.activo) {
      throw new UnauthorizedException('Cuenta desactivada. Contacta al administrador.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await this.logger.logAcceso({ usuario_id: user.id, email, ip, evento: 'intento_fallido', browser, sistema_operativo, descripcion: 'Contraseña incorrecta' });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.jwtService.sign({ id: user.id, email: user.email, rol: user.rol_nombre });

    await this.logger.logAcceso({ usuario_id: user.id, email, ip, evento: 'ingreso', browser, sistema_operativo, descripcion: 'Login exitoso' });
    await this.logger.logActividad({ usuario_id: user.id, email, rol: user.rol_nombre, accion: 'Inicio de sesión', modulo: 'Auth', ip });

    const { password: _, ...userSafe } = user;
    return { success: true, token, user: userSafe };
  }

  async register(body: any, clientInfo: any) {
    const { nombre, apellido, email, password, telefono } = body;
    const { browser, sistema_operativo, ip } = clientInfo;

    if (!nombre || !apellido || !email || !password) {
      throw new BadRequestException('Todos los campos son requeridos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email inválido');
    }

    if (password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    const [existing] = await this.db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id) VALUES (?,?,?,?,?,3)',
      [nombre, apellido, email, hashed, telefono || null],
    );

    await this.logger.logAcceso({ usuario_id: result.insertId, email, ip, evento: 'registro', browser, sistema_operativo, descripcion: 'Registro de nuevo usuario' });
    await this.logger.logActividad({ usuario_id: result.insertId, email, rol: 'cliente', accion: 'Registro de usuario', modulo: 'Auth', ip });

    return { success: true, message: 'Usuario registrado exitosamente' };
  }

  async logout(user: any, clientInfo: any) {
    const { browser, sistema_operativo, ip } = clientInfo;
    if (user) {
      await this.logger.logAcceso({ usuario_id: user.id, email: user.email, ip, evento: 'salida', browser, sistema_operativo, descripcion: 'Cierre de sesión' });
      await this.logger.logActividad({ usuario_id: user.id, email: user.email, rol: user.rol_nombre, accion: 'Cierre de sesión', modulo: 'Auth', ip });
    }
    return { success: true, message: 'Sesión cerrada' };
  }

  getMe(user: any) {
    const { password: _, ...userSafe } = user;
    return { success: true, user: userSafe };
  }

  checkPassword(body: any) {
    const { password } = body;
    if (!password) throw new BadRequestException('Password requerido');

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = 'débil';
    let color = '#FF4444';
    if (score >= 4) { strength = 'fuerte'; color = '#00C851'; }
    else if (score >= 2) { strength = 'intermedio'; color = '#FF8800'; }

    return { success: true, strength, score, color };
  }
}
