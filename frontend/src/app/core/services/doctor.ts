import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/doctors`;

  getAllDoctors(filters?: any): Observable<{ success: boolean; data: Doctor[] }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<{ success: boolean; data: Doctor[] }>(this.apiUrl, { params });
  }

  getDoctorById(id: number): Observable<{ success: boolean; data: Doctor }> {
    return this.http.get<{ success: boolean; data: Doctor }>(`${this.apiUrl}/${id}`);
  }

  searchDoctors(searchParams: any): Observable<{ success: boolean; data: Doctor[] }> {
    let params = new HttpParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params = params.set(key, searchParams[key]);
        console.log("@@@SearchDoctor-",params);
      }
    });
    console.log(`${this.apiUrl}/search`, { params });
    return this.http.get<{ success: boolean; data: Doctor[] }>(`${this.apiUrl}/search`, { params });
  }

  createDoctor(doctorData: any): Observable<{ success: boolean; data: Doctor }> {
    return this.http.post<{ success: boolean; data: Doctor }>(this.apiUrl, doctorData);
  }

  updateDoctor(id: number, doctorData: any): Observable<{ success: boolean; data: Doctor }> {
    return this.http.put<{ success: boolean; data: Doctor }>(`${this.apiUrl}/${id}`, doctorData);
  }

  deleteDoctor(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  updateOwnProfile(data: any): Observable<{ success: boolean; data: Doctor }> {
    return this.http.put<{ success: boolean; data: Doctor }>(`${this.apiUrl}/profile/me`, data);
  }
}