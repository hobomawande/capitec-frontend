import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import { LoginRequest } from '../../Models/user/LoginRequest';
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

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): any | null {
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

  isAuthenticated(): boolean {
    return !!this.getToken();
  }


  hasRole(role: string | string[]): boolean {
    const currentUser = this.getCurrentUser();
    const currentRole = currentUser?.role?.toUpperCase();

    if (!currentRole || !role) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.some((r) => r.toUpperCase() === currentRole);
    }

    return role.toUpperCase() === currentRole;
  }

}
