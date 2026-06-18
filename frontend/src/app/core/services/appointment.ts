import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/appointments`;

  createAppointment(appointmentData: any): Observable<{ success: boolean; data: Appointment }> {
    return this.http.post<{ success: boolean; data: Appointment }>(this.apiUrl, appointmentData);
  }

  getAppointments(filters?: any): Observable<{ success: boolean; data: Appointment[] }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<{ success: boolean; data: Appointment[] }>(this.apiUrl, { params });
  }

  getMyAppointments(): Observable<{ success: boolean; data: Appointment[] }> {
    return this.http.get<{ success: boolean; data: Appointment[] }>(`${this.apiUrl}/my-appointments`);
  }

  getAppointmentsByDoctor(doctorId: number): Observable<{ success: boolean; data: Appointment[] }> {
    return this.http.get<{ success: boolean; data: Appointment[] }>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<{ success: boolean; data: Appointment[] }> {
    return this.http.get<{ success: boolean; data: Appointment[] }>(`${this.apiUrl}/patient/${patientId}`);
  }

  getAppointmentById(id: number): Observable<{ success: boolean; data: Appointment }> {
    return this.http.get<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}`);
  }

  updateAppointment(id: number, data: any): Observable<{ success: boolean; data: Appointment }> {
    return this.http.put<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}`, data);
  }

  updateAppointmentStatus(id: number, status: string): Observable<{ success: boolean; data: Appointment }> {
    return this.http.patch<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}/status`, { status });
  }

  addConsultationNotes(id: number, data: any): Observable<{ success: boolean; data: Appointment }> {
    return this.http.patch<{ success: boolean; data: Appointment }>(`${this.apiUrl}/${id}/notes`, data);
  }

  cancelAppointment(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  checkAvailability(data: any): Observable<{ success: boolean; available: boolean; endTime?: string }> {
    return this.http.post<{ success: boolean; available: boolean; endTime?: string }>(
      `${this.apiUrl}/check-availability`, 
      data
    );
  }
}
