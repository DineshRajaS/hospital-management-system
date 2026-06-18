import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // ==================== PUBLIC ROUTES ====================
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./features/doctors/doctor-list/doctor-list').then(m => m.DoctorListComponent)
  },
  {
    path: 'doctors/:id',
    loadComponent: () => import('./features/doctors/doctor-details/doctor-details').then(m => m.DoctorDetailsComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then(m => m.AboutComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services').then(m => m.ServicesComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then(m => m.ContactComponent)
  },

  // ==================== PATIENT ROUTES ====================
  {
    path: 'profile',
    canActivate: [authGuard, roleGuard(['patient'])],
    loadComponent: () => import('./features/patients/patient-profile/patient-profile').then(m => m.PatientProfileComponent)
  },
  {
    path: 'bills',
    canActivate: [authGuard, roleGuard(['patient'])],
    loadComponent: () => import('./features/bills/bill-list/bill-list').then(m => m.BillListComponent)
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent)
  },
  {
    path: 'appointments/book',
    canActivate: [authGuard, roleGuard(['patient', 'admin'])],
    loadComponent: () => import('./features/appointments/appointment-booking/appointment-booking').then(m => m.AppointmentBookingComponent)
  },
  // {
  //   path: 'appointments/:id',
  //   canActivate: [authGuard],
  //   loadComponent: () => import('./features/appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent)
  // },
  {
    path: 'appointments/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/appointments/appointment-details/appointment-details').then(m => m.AppointmentDetailsComponent)
  },

  // ==================== DOCTOR ROUTES ====================
  {
    path: 'doctor/schedule',
    canActivate: [authGuard, roleGuard(['doctor'])],
    loadComponent: () => import('./features/appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent)
  },
  {
    path: 'doctor/profile',
    canActivate: [authGuard, roleGuard(['doctor'])],
    loadComponent: () => import('./features/doctors/doctor-profile-update/doctor-profile-update')
    .then(m => m.DoctorProfileUpdateComponent)
  },

  // ==================== ADMIN ROUTES - FIXED ====================
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/doctors',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-doctors/admin-doctors').then(m => m.AdminDoctorsComponent)
  },
  {
    path: 'admin/doctors/add',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  // ✅ FIXED: Now using proper AdminPatientsComponent
  {
    path: 'admin/patients',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-patients/admin-patients').then(m => m.AdminPatientsComponent)
  },
  {
    path: 'admin/patients/add',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'admin/appointments',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/appointments/appointment-list/appointment-list').then(m => m.AppointmentListComponent)
  },
  {
    path: 'admin/bills',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-bills/admin-bills').then(m => m.AdminBillsComponent)
  },
  {
    path: 'admin/payments',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-payments/admin-payments').then(m => m.AdminPaymentsComponent)
  },
  {
    path: 'admin/reports',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./features/admin/admin-reports/admin-reports').then(m => m.AdminReportsComponent)
  },

  // ==================== WILDCARD ROUTE ====================
  {
    path: '**',
    redirectTo: ''
  }
];