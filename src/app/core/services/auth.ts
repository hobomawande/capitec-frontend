import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import { LoginRequest } from '../../Models/user/LoginRequest';
import { RegisterRequest } from '../../Models/user/RegisterRequest';
import { User } from '../../Models/user/User';
import { AuthResponse } from '../../Models/user/AuthResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBase}/auth`;

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient) {}

  // ==============================
  // LOGIN
  // ==============================

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (!response || !response.accessToken) {
          throw new Error('Invalid authentication response.');
        }

        sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);

        sessionStorage.setItem(this.USER_KEY, JSON.stringify(response));
      }),

    );
  }

  // ==============================
  // REGISTER
  // ==============================

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  // ==============================
  // LOGOUT
  // ==============================

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  // ==============================
  // GET TOKEN
  // ==============================

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // ==============================
  // GET CURRENT USER
  // ==============================

  getCurrentUser(): User | null {
    const user = sessionStorage.getItem(this.USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch {
      this.logout();

      return null;
    }
  }

  // ==============================
  // AUTHENTICATION CHECK
  // ==============================

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ==============================
  // ROLE CHECK
  // ==============================

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();

    return currentUser?.role?.toUpperCase() === role.toUpperCase();
  }

  // ==============================
  // MULTIPLE ROLE CHECK
  // ==============================

  hasAnyRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();

    if (!currentUser?.role) {
      return false;
    }

    return roles.some((role) => role.toUpperCase() === currentUser.role.toUpperCase());
  }
}
