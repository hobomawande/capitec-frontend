import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Appointment } from '../../Models/appointment/Appointment';
import { CreateAppointmentRequest } from '../../Models/appointment/CreateAppointmentRequest';
import { AppointmentStatus } from '../../Models/appointment/AppointmentStatus';
import { UpdateAppointmentRequest } from '../../Models/appointment/UpdateAppointmentRequest';
import { AppointmentResponse } from '../../Models/appointment/AppointmentResponse';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiUrl = `${environment.apiBase}/appointments`;

  constructor(private http: HttpClient) {}

  getMyAppointments(id: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/my-appointments/${id}`);
  }

  getAllAppointments(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(this.apiUrl);
  }

  getAppointmentById(id: string): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/${id}`);
  }

  createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, request);
  }

  updateAppointment(id: string, request: UpdateAppointmentRequest): Observable<Appointment> {
    debugger
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, request);
  }
  cancelAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/cancel/${id}`, {});
  }
  deleteAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/delete/${id}`, {});
  }

  confirmAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/confirm/${id}`, {});
  }

  completeAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/complete/${id}`, {});
  }

}
