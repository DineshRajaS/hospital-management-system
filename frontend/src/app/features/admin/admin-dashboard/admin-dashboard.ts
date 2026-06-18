import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { DoctorService } from '../../../core/services/doctor';
import { PatientService } from '../../../core/services/patient';
import { BillService } from '../../../core/services/bill';
import { Payment } from '../../../core/models/interfaces';
import { PaymentService } from '../../../core/services/payment';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="container">
        <h1>Admin Dashboard</h1>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👨‍⚕️</div>
            <div class="stat-info">
              <h3>{{ totalDoctors() }}</h3>
              <p>Total Doctors</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🏥</div>
            <div class="stat-info">
              <h3>{{ totalPatients() }}</h3>
              <p>Total Patients</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <h3>{{ totalAppointments() }}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3>\${{ totalRevenue() }}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <a routerLink="/admin/doctors/add" class="action-card">
              <div class="action-icon">➕</div>
              <h3>Add Doctor</h3>
              <p>Register a new doctor</p>
            </a>

            <a routerLink="/admin/patients/add" class="action-card">
              <div class="action-icon">➕</div>
              <h3>Add Patient</h3>
              <p>Register a new patient</p>
            </a>

            <a routerLink="/admin/appointments" class="action-card">
              <div class="action-icon">📋</div>
              <h3>View Appointments</h3>
              <p>Manage all appointments</p>
            </a>

            <a routerLink="/admin/bills" class="action-card">
              <div class="action-icon">💵</div>
              <h3>Generate Bill</h3>
              <p>Create patient bills</p>
            </a>

            <a routerLink="/admin/payments" class="action-card">
              <div class="action-icon">💳</div>
              <h3>Record Payment</h3>
              <p>Process patient payments</p>
            </a>

            <a routerLink="/admin/reports" class="action-card">
              <div class="action-icon">📊</div>
              <h3>View Reports</h3>
              <p>Analytics and insights</p>
            </a>
          </div>
        </div>

        <!-- Recent Appointments -->
        <div class="recent-section">
          <h2>Recent Appointments</h2>
          @if (recentAppointments().length > 0) {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (appointment of recentAppointments(); track appointment.id) {
                    <tr>
                      <td>{{ formatDate(appointment.appointmentDate) }}</td>
                      <td>{{ appointment.Patient?.User?.name }}</td>
                      <td>{{ appointment.Doctor?.User?.name }}</td>
                      <td>{{ appointment.startTime }}</td>
                      <td>
                        <span class="status-badge" [class]="'badge-' + appointment.status">
                          {{ appointment.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="no-data">No recent appointments</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem 0;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 2rem;
    }

    h2 {
      color: #2d3748;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 3rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info h3 {
      font-size: 2rem;
      color: #667eea;
      margin-bottom: 0.25rem;
    }

    .stat-info p {
      color: #718096;
      margin: 0;
    }

    .quick-actions {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      text-decoration: none;
      transition: all 0.3s;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-5px);
      border-color: #667eea;
      background: white;
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .action-card p {
      color: #718096;
      margin: 0;
      font-size: 0.9rem;
    }

    .recent-section {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f7fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #2d3748;
      border-bottom: 2px solid #e2e8f0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }

    tr:hover {
      background: #f7fafc;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-scheduled {
      background: #bee3f8;
      color: #2c5282;
    }

    .badge-completed {
      background: #c6f6d5;
      color: #22543d;
    }

    .badge-cancelled {
      background: #fed7d7;
      color: #742a2a;
    }

    .no-data {
      text-align: center;
      padding: 2rem;
      color: #718096;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private patientService = inject(PatientService);
  private billService = inject(BillService);
  private paymentService = inject(PaymentService);

  totalDoctors = signal(0);
  totalPatients = signal(0);
  totalAppointments = signal(0);
  totalRevenue = signal(0);
  payments = signal<Payment[]>([]);
  recentAppointments = signal<any[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load doctors count
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        this.totalDoctors.set(response.data.length);
      }
    });

    // Load patients count
    this.patientService.getAllPatients().subscribe({
      next: (response) => {
        this.totalPatients.set(response.data.length);
      }
    });

    // Load appointments
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.totalAppointments.set(response.data.length);
        this.recentAppointments.set(response.data.slice(0, 5));
      }
    });

    // Load billing summary
    // this.billService.getBillingSummary().subscribe({
    //   next: (response) => {
    //     this.totalRevenue.set(response.data.totalRevenue || 0);
    //   }
    // });

    this.paymentService.getAllPayments().subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.calculateTotalRevenue();
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    })
  }

  calculateTotalRevenue(): void {
    const total = this.payments().reduce((sum, payment) => {
      if (payment.paymentStatus === 'completed') {
        return sum + Number(payment.amount);
      }
      return sum;
    }, 0);
    this.totalRevenue.set(total);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}
