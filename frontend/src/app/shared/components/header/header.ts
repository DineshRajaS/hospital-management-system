import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a routerLink="/">
              <h1>🏥 Get Well Soon</h1>
            </a>
          </div>
          
          <!-- Only render navigation after auth check is complete -->
          <!-- @if (isAuthChecked) { -->
            <nav class="nav-menu">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
              <a routerLink="/doctors" routerLinkActive="active">Our Doctors</a>
              
              @if (authService.isAuthenticated()) {
                <!-- <a routerLink="/appointments" routerLinkActive="active">Appointments</a> -->
                
                @if (authService.isPatient()) {
                  <a routerLink="/appointments" routerLinkActive="active">Appointments</a>
                  <a routerLink="/bills" routerLinkActive="active">My Bills</a>
                  <a routerLink="/profile" routerLinkActive="active">Profile</a>
                }
                
                @if (authService.isDoctor()) {
                  <a routerLink="/appointments" routerLinkActive="active">Appointments</a>
                  <a routerLink="/doctor/schedule" routerLinkActive="active">My Schedule</a>
                  <a routerLink="/doctor/profile" routerLinkActive="active">Profile</a>
                }
                
                @if (authService.isAdmin()) {
                  <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
                  <a routerLink="/admin/doctors" routerLinkActive="active">Doctors</a>
                  <a routerLink="/admin/patients" routerLinkActive="active">Patients</a>
                  <a routerLink="/admin/appointments" routerLinkActive="active">Appointments</a>
                  <a routerLink="/admin/bills" routerLinkActive="active">Bills</a>
                  <a routerLink="/admin/payments" routerLinkActive="active">Payments</a>
                  <a routerLink="/admin/reports" routerLinkActive="active">Reports</a>
                }
              }
              
              <a routerLink="/about" routerLinkActive="active">About</a>
              <a routerLink="/services" routerLinkActive="active">Services</a>
              <a routerLink="/contact" routerLinkActive="active">Contact</a>
            </nav>

            <div class="auth-section">
              @if (authService.isAuthenticated()) {
                <span class="user-name">👤 {{ authService.currentUser()?.name }}</span>
                <button class="btn btn-secondary" (click)="logout()">Logout</button>
              } @else {
                <a routerLink="/login" class="btn btn-primary">Login</a>
                <a routerLink="/register" class="btn btn-secondary">Register</a>
              }
            </div>
          <!-- } -->
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 50px; /* Prevent height jumping */
    }

    .logo {
      flex-shrink: 0;
    }

    .logo h1 {
      margin: 0;
      font-size: 1.5rem;
      color: white;
      white-space: nowrap;
    }

    .logo a {
      color: white;
      text-decoration: none;
    }

    .nav-menu {
      display: flex;
      gap: 1rem;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.3) transparent;
      padding: 0.5rem 0;
      -webkit-overflow-scrolling: touch;
    }

    .nav-menu::-webkit-scrollbar {
      height: 6px;
    }

    .nav-menu::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }

    .nav-menu::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 3px;
    }

    .nav-menu::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.5);
    }

    .nav-menu a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
      white-space: nowrap;
      padding: 0.25rem 0.5rem;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      opacity: 0.8;
      text-decoration: underline;
    }

    .auth-section {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-shrink: 0;
    }

    .user-name {
      font-weight: 500;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: transform 0.2s;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-primary {
      background: white;
      color: #667eea;
    }

    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    @media (max-width: 1200px) {
      .logo h1 {
        font-size: 1.2rem;
      }

      .nav-menu {
        gap: 0.75rem;
      }

      .nav-menu a {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
      }

      .logo {
        flex: 0 0 100%;
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .nav-menu {
        flex: 0 0 100%;
        justify-content: flex-start;
        order: 3;
        margin-top: 0.5rem;
        padding-bottom: 0.25rem;
      }

      .auth-section {
        flex: 0 0 100%;
        justify-content: center;
        order: 2;
      }
    }
  `]
})
export class HeaderComponent  {
  authService = inject(AuthService);
  private router = inject(Router);
  
  // isAuthChecked = false;

  // ngOnInit(): void {
  //   // Wait for auth service to initialize
  //   setTimeout(() => {
  //     this.isAuthChecked = true;
  //   }, 0);
  // }

  logout(): void {
    this.authService.logout();
  }
}