import { CreateUserDTO, User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { ITenantRepository } from '../repositories/ITenantRepository';

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
