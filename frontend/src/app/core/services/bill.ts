import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bill } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bills`;

  createBill(billData: any): Observable<{ success: boolean; data: Bill }> {
    return this.http.post<{ success: boolean; data: Bill }>(this.apiUrl, billData);
  }

  getAllBills(filters?: any): Observable<{ success: boolean; data: Bill[] }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<{ success: boolean; data: Bill[] }>(this.apiUrl, { params });
  }

  getBillById(id: number): Observable<{ success: boolean; data: Bill }> {
    return this.http.get<{ success: boolean; data: Bill }>(`${this.apiUrl}/${id}`);
  }

  getBillsByDoctor(doctorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getBillsByPatient(patientId: number): Observable<{ success: boolean; data: Bill[] }> {
    return this.http.get<{ success: boolean; data: Bill[] }>(`${this.apiUrl}/patient/${patientId}`);
  }

  getMyBills(): Observable<{ success: boolean; data: Bill[] }> {
    return this.http.get<{ success: boolean; data: Bill[] }>(`${this.apiUrl}/my-bills/all`);
  }

  updateBill(id: number, billData: any): Observable<{ success: boolean; data: Bill }> {
    return this.http.put<{ success: boolean; data: Bill }>(`${this.apiUrl}/${id}`, billData);
  }

  getBillingSummary(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/reports/summary`, { params });
  }
}
