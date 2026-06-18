/**
 * @summary DTOs for authentication requests and responses.
 * @author SofTech
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface PropertyResponse {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  createdAt: string;
}

export interface PropertyRequest {
  userId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
}
