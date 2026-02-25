import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User } from '@trailsystem/types';

export interface TokenPayload {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * AuthService — Gerencia autenticação JWT com access + refresh tokens.
 *
 * Access token: curta duração (15min), enviado via httpOnly cookie.
 * Refresh token: longa duração (7d), enviado via httpOnly cookie separado.
 */
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(private jwtSecret: string) {}

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera um par de tokens (access + refresh).
   */
  generateTokenPair(user: User): TokenPair {
    const payload: TokenPayload = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  /**
   * @deprecated Use generateTokenPair() para novos fluxos.
   * Mantido para compatibilidade com clientes que ainda usam Bearer token.
   */
  generateToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
  }

  /**
   * Verifica e decodifica um token JWT.
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Verifica se um token é do tipo refresh.
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload & { type?: string };
      if (decoded.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
