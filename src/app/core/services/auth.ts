import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from "../../../environments/environment";
import { LoginRequest } from '../../Models/user/LoginRequest';
import { RegisterRequest} from '../../Models/user/RegisterRequest';
import { User } from '../../Models/user/User';
import { AuthResponse } from '../../Models/user/AuthResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBase}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    let xx = this.apiUrl.concat('/login');
    debugger
    return this.http.post<AuthResponse>(xx, request).pipe(
      tap((response) => {
        sessionStorage.setItem('token', response.accessToken);
        sessionStorage.setItem('user', JSON.stringify(response));
        debugger
      }),
    );
  }


  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.role === role;
  }
}
