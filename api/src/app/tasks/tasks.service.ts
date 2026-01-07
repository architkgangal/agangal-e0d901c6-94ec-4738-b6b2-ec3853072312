import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createTaskDto: any, user: User) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId: user.id,
      organizationId: user.organizationId,
    });

    const savedTask = (await this.taskRepository.save(task)) as unknown as Task;

    // Audit log
    await this.logAudit(user.id, 'CREATE', 'task', savedTask.id);

    return savedTask;
  }

  async findAll(user: User) {
    const query = this.taskRepository.createQueryBuilder('task');

    // Owner sees all tasks
    if (user.role.name === 'owner') {
      // No filter
    }
    // Admin sees tasks in their org and child orgs
    else if (user.role.name === 'admin') {
      query.where('task.organizationId = :orgId', { orgId: user.organizationId });
    }
    // Viewer sees only their own tasks
    else if (user.role.name === 'viewer') {
      query.where('task.userId = :userId', { userId: user.id });
    }

    return query.getMany();
  }

  async findOne(id: number, user: User) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check access
    this.checkAccess(task, user);

    return task;
  }

  async update(id: number, updateTaskDto: any, user: User) {
    const task = await this.findOne(id, user);

    // Viewers cannot update
    if (user.role.name === 'viewer') {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    Object.assign(task, updateTaskDto);
    const updated = (await this.taskRepository.save(task)) as unknown as Task;

    // Audit log
    await this.logAudit(user.id, 'UPDATE', 'task', id);

    return updated;
  }

  async remove(id: number, user: User) {
    const task = await this.findOne(id, user);

    // Only owner and admin can delete
    if (user.role.name === 'viewer') {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    await this.taskRepository.remove(task);

    // Audit log
    await this.logAudit(user.id, 'DELETE', 'task', id);

    return { deleted: true };
  }

  private checkAccess(task: Task, user: User) {
    if (user.role.name === 'owner') {
      return; // Owner can access all
    }

    if (user.role.name === 'admin' && task.organizationId === user.organizationId) {
      return; // Admin can access org tasks
    }

    if (user.role.name === 'viewer' && task.userId === user.id) {
      return; // Viewer can access own tasks
    }

    throw new ForbiddenException('You do not have access to this task');
  }

  private async logAudit(userId: number, action: string, resource: string, resourceId?: number) {
    await this.auditLogRepository.save({
      userId,
      action,
      resource,
      resourceId,
    });
  }
}