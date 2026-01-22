export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export const mapApiUserToFrontend = (apiUser: User): FrontendUser => ({
  id: apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  role: apiUser.role,
  avatar: apiUser.avatar,
  phone: apiUser.phone,
  address: apiUser.address,
  status: apiUser.isActive ? 'active' : 'inactive',
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}