import type { CreateUserDTO, User } from '../entities';
import type { IUserRepository } from '../repositories';
import type { ITenantRepository } from '../../../tenant/domain/repositories';

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(data: CreateUserDTO): Promise<User> {
    // Verify tenant exists and is active
    const tenant = await this.tenantRepository.findById(data.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    if (tenant.status !== 'active') {
      throw new Error('Tenant is not active');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email, data.tenantId);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    return await this.userRepository.create(data);
  }
}
