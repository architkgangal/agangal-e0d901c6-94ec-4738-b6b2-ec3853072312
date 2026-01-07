import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum RoleName {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: RoleName;

  @CreateDateColumn()
  createdAt: Date;
}