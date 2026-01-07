export interface User {
    id: number;
    email: string;
    roleId: number;
    organizationId: number;
    role?: {
      id: number;
      name: 'owner' | 'admin' | 'viewer';
    };
    organization?: {
      id: number;
      name: string;
    };
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }