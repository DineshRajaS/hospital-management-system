import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/patients`;

  getAllPatients(): Observable<{ success: boolean; data: Patient[] }> {
    return this.http.get<{ success: boolean; data: Patient[] }>(this.apiUrl);
  }

  getPatientById(id: number): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.apiUrl}/${id}`);
  }

  createPatient(patientData: any): Observable<{ success: boolean; data: Patient }> {
    return this.http.post<{ success: boolean; data: Patient }>(this.apiUrl, patientData);
  }

  updatePatient(id: number, patientData: any): Observable<{ success: boolean; data: Patient }> {
    return this.http.put<{ success: boolean; data: Patient }>(`${this.apiUrl}/${id}`, patientData);
  }

  getMyProfile(): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.apiUrl}/profile/me`);
  }

  updateMyProfile(data: any): Observable<{ success: boolean; data: Patient }> {
    return this.http.put<{ success: boolean; data: Patient }>(`${this.apiUrl}/profile/me`, data);
  }

  updateMedicalHistory(data: any): Observable<{ success: boolean; data: Patient }> {
    return this.http.put<{ success: boolean; data: Patient }>(`${this.apiUrl}/medical-history/me`, data);
  }
}
