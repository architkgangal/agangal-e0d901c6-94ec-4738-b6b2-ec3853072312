import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string, organizationId: number) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default to viewer role for new users
    const viewerRole = await this.roleRepository.findOne({ where: { name: 'viewer' as any } });
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      roleId: viewerRole.id,
      organizationId,
    });

    await this.userRepository.save(user);
    
    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'organization'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      organizationId: user.organizationId,
    };

    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'organization'],
    });
  }
}