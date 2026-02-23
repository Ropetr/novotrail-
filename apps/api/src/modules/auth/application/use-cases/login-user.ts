import type { LoginDTO, User } from '../../domain/entities';
import type { IUserRepository } from '../../domain/repositories';

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginDTO): Promise<User> {
    if (!data.tenantId) {
      throw new Error('Tenant ID is required');
    }

    const user = await this.userRepository.findByEmail(data.email, data.tenantId);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('User is not active');
    }

    return user;
  }
}
