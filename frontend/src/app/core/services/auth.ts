import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Only run auth check if browser environment is detected
    if (this.isBrowser()) {
      this.checkAuth();
    }
  }

  /**
   * Checks if the current environment has window/localStorage.
   * Prevents ReferenceError during SSR or testing.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private checkAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('accessToken') : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('refreshToken') : null;
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return !!user && user.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  isPatient(): boolean {
    return this.hasRole('patient');
  }
}





// --------x-------------


// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Observable, tap } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/interfaces';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private http = inject(HttpClient);
//   private router = inject(Router);
  
//   private apiUrl = `${environment.apiUrl}/auth`;
  
//   currentUser = signal<User | null>(null);
//   isAuthenticated = signal<boolean>(false);

//   constructor() {
//     this.checkAuth();
//   }

//   private checkAuth(): void {
//     const token = this.getToken();
//     const user = this.getStoredUser();
    
//     if (token && user) {
//       this.currentUser.set(user);
//       this.isAuthenticated.set(true);
//     }
//   }

//   login(credentials: LoginRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
//       tap(response => this.handleAuthSuccess(response))
//     );
//   }

//   register(userData: RegisterRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
//       tap(response => this.handleAuthSuccess(response))
//     );
//   }

//   private handleAuthSuccess(response: AuthResponse): void {
//     localStorage.setItem('accessToken', response.accessToken);
//     localStorage.setItem('refreshToken', response.refreshToken);
//     localStorage.setItem('user', JSON.stringify(response.user));
    
//     this.currentUser.set(response.user);
//     this.isAuthenticated.set(true);
//   }

//   logout(): void {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
    
//     this.currentUser.set(null);
//     this.isAuthenticated.set(false);
    
//     this.router.navigate(['/login']);
//   }

//   private isBrowser(): boolean {
//     return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
//   }

//   getToken(): string | null {
//     return this.isBrowser() ? localStorage.getItem('accessToken') : null;
//   }

//   // getToken(): string | null {
//   //   return localStorage.getItem('accessToken');
//   // }

//   getRefreshToken(): string | null {
//     return localStorage.getItem('refreshToken');
//   }

//   private getStoredUser(): User | null {
//     const userStr = localStorage.getItem('user');
//     return userStr ? JSON.parse(userStr) : null;
//   }

//   hasRole(role: string): boolean {
//     return this.currentUser()?.role === role;
//   }

//   isAdmin(): boolean {
//     return this.hasRole('admin');
//   }

//   isDoctor(): boolean {
//     return this.hasRole('doctor');
//   }

//   isPatient(): boolean {
//     return this.hasRole('patient');
//   }
// }