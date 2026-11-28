import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Appointment } from '../../Models/appointment/Appointment';
import { CreateAppointmentRequest } from '../../Models/appointment/CreateAppointmentRequest';
import { AppointmentStatus } from '../../Models/appointment/AppointmentStatus';
import { UpdateAppointmentRequest } from '../../Models/appointment/UpdateAppointmentRequest';
import { AppointmentResponse } from '../../Models/appointment/AppointmentResponse';
import { request } from 'express';

class AppointmentsUpdate {}

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
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, request);
  }
  cancelAppointment(request: AppointmentsUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/cancel`, request);
  }
  deleteAppointment(request: AppointmentsUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/delete`, request);
  }

  confirmAppointment(request: AppointmentsUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/confirm`, request);
  }

  completeAppointment(request: AppointmentsUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/complete`, request);
  }
  noshowAppointment(request: AppointmentsUpdate): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/noshow`, request);
  }
}
