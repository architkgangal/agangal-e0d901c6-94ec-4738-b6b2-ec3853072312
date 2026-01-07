import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLog } from '../entities/audit-log.entity';

@Controller('audit-log')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  @Get()
  async findAll(@Request() req) {
    const user = req.user;

    // Only Owner and Admin can view audit logs
    if (user.role.name !== 'owner' && user.role.name !== 'admin') {
      throw new ForbiddenException('Only Owners and Admins can view audit logs');
    }

    // Simple query - return all logs for Owner, filter by org for Admin
    if (user.role.name === 'owner') {
      return this.auditLogRepository.find({
        order: { timestamp: 'DESC' },
        take: 100,
      });
    }

    // For admin, we'd need to join with users to filter by org
    // For now, just return all (TODO: implement proper filtering)
    return this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}