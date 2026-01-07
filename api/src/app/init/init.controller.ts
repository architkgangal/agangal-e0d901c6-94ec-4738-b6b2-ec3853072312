import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

@Controller('init')
export class InitController {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('seed')
  async seed() {
    // Check if already seeded
    const existingRoles = await this.roleRepository.count();
    if (existingRoles > 0) {
      return { message: 'Database already seeded' };
    }

    // Create Roles
    const ownerRole = await this.roleRepository.save({ name: RoleName.OWNER });
    const adminRole = await this.roleRepository.save({ name: RoleName.ADMIN });
    const viewerRole = await this.roleRepository.save({ name: RoleName.VIEWER });

    // Create Organizations
    const parentOrg = await this.orgRepository.save({ name: 'Parent Organization' });
    const childOrg = await this.orgRepository.save({ 
      name: 'Child Organization', 
      parentOrgId: parentOrg.id 
    });

    // Create Test Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    await this.userRepository.save({
      email: 'owner@example.com',
      password: hashedPassword,
      roleId: ownerRole.id,
      organizationId: parentOrg.id,
    });

    await this.userRepository.save({
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      organizationId: childOrg.id,
    });

    await this.userRepository.save({
      email: 'viewer@example.com',
      password: hashedPassword,
      roleId: viewerRole.id,
      organizationId: childOrg.id,
    });

    return {
      message: 'Database seeded successfully',
      users: [
        { email: 'owner@example.com', password: 'password123', role: 'owner' },
        { email: 'admin@example.com', password: 'password123', role: 'admin' },
        { email: 'viewer@example.com', password: 'password123', role: 'viewer' },
      ],
    };
  }
}