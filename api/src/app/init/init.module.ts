import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitController } from './init.controller';
import { Role } from '../entities/role.entity';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Organization, User])],
  controllers: [InitController],
})
export class InitModule {}