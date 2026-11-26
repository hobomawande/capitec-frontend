import { Injectable, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../Models/appointment/Appointment';
import { CreateAppointmentRequest } from '../../Models/appointment/CreateAppointmentRequest';
import { AppointmentStatus } from '../../Models/appointment/AppointmentStatus';
import { UpdateAppointmentRequest } from '../../Models/appointment/UpdateAppointmentRequest';
import { AvailableSlot } from '../../Models/appointment/AvailableSlot';
import { AppointmentResponse } from '../../Models/appointment/AppointmentResponse';




@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiUrl = `${environment.apiBase}/appointments`;

  constructor(private http: HttpClient) {}

  // Customer: Get my appointments
  getMyAppointments(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/my-appointments`);
  }

  // Admin: Get all appointments
  getAllAppointments(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(this.apiUrl);
  }

  // Get appointment by ID
  getAppointmentById(id: string): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.apiUrl}/${id}`);
  }

  // Create appointment
  createAppointment(request: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, request);
  }

  // Update appointment
  updateAppointment(id: string, request: UpdateAppointmentRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, request);
  }

  // Cancel appointment
  cancelAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin: Confirm appointment
  confirmAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/confirm`, {});
  }

  // Admin: Complete appointment
  completeAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/complete`, {});
  }

  // Admin: Get appointments by status
  getAppointmentsByStatus(status: AppointmentStatus): Observable<AppointmentResponse[]> {
    const params = new HttpParams().set('status', status);

    return this.http.get<AppointmentResponse[]>(this.apiUrl, { params });
  }

  // Admin: Get appointments by branch
  getAppointmentsByBranch(branchId: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/branch/${branchId}`);
  }

  // Get available appointment slots for a branch and date
  getAvailableSlots(branchId: string, date: string): Observable<AvailableSlot[]> {
    const params = new HttpParams().set('branchId', branchId).set('date', date);

    return this.http.get<AvailableSlot[]>(`${this.apiUrl}/available-slots`, { params });
  }

}
