import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User } from '@trailsystem/types';

export class AuthService {
  constructor(private jwtSecret: string) {}

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    const payload = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
