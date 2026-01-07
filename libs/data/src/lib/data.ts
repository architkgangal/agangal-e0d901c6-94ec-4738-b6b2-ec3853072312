// Enums
export enum RoleName {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal'
}

// Interfaces
export interface User {
  id: number;
  email: string;
  password?: string; // Optional for responses
  roleId: number;
  organizationId: number;
  createdAt: Date;
}

export interface Organization {
  id: number;
  name: string;
  parentOrgId?: number | null;
  createdAt: Date;
}

export interface Role {
  id: number;
  name: RoleName;
  createdAt: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  category: TaskCategory;
  userId: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  timestamp: Date;
}

// DTOs for API requests
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  category: TaskCategory;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  organizationId: number;
}

// Response types
export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}