import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  recordPayment(paymentData: any): Observable<{ success: boolean; data: Payment }> {
    return this.http.post<{ success: boolean; data: Payment }>(this.apiUrl, paymentData);
  }

  initiatePayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/initiate`, data);
  }

  getAllPayments(filters?: any): Observable<{ success: boolean; data: Payment[] }> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<{ success: boolean; data: Payment[] }>(this.apiUrl, { params });
  }

  getPaymentById(id: number): Observable<{ success: boolean; data: Payment }> {
    return this.http.get<{ success: boolean; data: Payment }>(`${this.apiUrl}/${id}`);
  }

  getPaymentByBill(billId: number): Observable<{ success: boolean; data: Payment }> {
    return this.http.get<{ success: boolean; data: Payment }>(`${this.apiUrl}/bill/${billId}`);
  }

  getPaymentsByPatient(patientId: number): Observable<{ success: boolean; data: Payment[] }> {
    return this.http.get<{ success: boolean; data: Payment[] }>(`${this.apiUrl}/patient/${patientId}`);
  }

  getMyPayments(): Observable<{ success: boolean; data: Payment[] }> {
    return this.http.get<{ success: boolean; data: Payment[] }>(`${this.apiUrl}/my-payments/all`);
  }

  getRevenueReport(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/reports/revenue`, { params });
  }
}