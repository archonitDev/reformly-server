import { Gender, Role } from "@prisma/client";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: Role;
  gender: Gender;
}