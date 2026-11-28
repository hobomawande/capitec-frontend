import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {StaffResponse} from '../../Models/user/StaffResponse';
import { RegisterRequest } from '../../Models/user/RegisterRequest';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private readonly apiUrl = `${environment.apiBase}/staff`;

  constructor(private http: HttpClient) {}

  getAllStaff(): Observable<StaffResponse[]> {
    return this.http.get<StaffResponse[]>(this.apiUrl);
  }

  getStaffById(id: string): Observable<StaffResponse> {
    return this.http.get<StaffResponse>(`${this.apiUrl}/${id}`);
  }

  updateRole(id: string, role: string): Observable<StaffResponse> {
    const params = new HttpParams().set('role', role);
    return this.http.patch<StaffResponse>(`${this.apiUrl}/role/${id}`, {}, { params });
  }

  updateStatus(id: string, enabled: boolean): Observable<StaffResponse> {
    const params = new HttpParams().set('enabled', enabled);
    return this.http.patch<StaffResponse>(`${this.apiUrl}/status/${id}`, {}, { params });
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }
}
