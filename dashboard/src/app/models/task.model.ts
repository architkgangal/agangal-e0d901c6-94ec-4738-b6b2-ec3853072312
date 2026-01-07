export interface Task {
    id?: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    category: 'work' | 'personal';
    userId?: number;
    organizationId?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    category: 'work' | 'personal';
  }
  
  export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    category?: 'work' | 'personal';
  }