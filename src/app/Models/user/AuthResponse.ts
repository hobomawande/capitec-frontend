export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  staffId: string;
  fullName: string;
  email: string;
  role: string;
}
