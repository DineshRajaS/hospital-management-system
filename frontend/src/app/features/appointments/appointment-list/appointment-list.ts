import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { Appointment } from '../../../core/models/interfaces';

@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="appointments-container">
      <div class="container">
        <div class="header-section">
          <h1>My Appointments</h1>
          @if (authService.isPatient()) {
            <a routerLink="/appointments/book" class="btn btn-primary">Book New Appointment</a>
          }
        </div>

        @if (loading()) {
          <div class="loading">Loading appointments...</div>
        } @else if (appointments().length === 0) {
          <div class="no-data">
            <p>No appointments found.</p>
            @if (authService.isPatient()) {
              <a routerLink="/appointments/book" class="btn btn-primary">Book Your First Appointment</a>
            }
          </div>
        } @else {
          <div class="appointments-list">
            @for (appointment of appointments(); track appointment.id) {
              <div class="appointment-card" [class]="'status-' + appointment.status">
                <div class="appointment-header">
                  <div class="status-badge" [class]="'badge-' + appointment.status">
                    {{ appointment.status }}
                  </div>
                  <div class="appointment-date">
                    📅 {{ formatDate(appointment.appointmentDate) }}
                  </div>
                </div>

                <div class="appointment-body">
                  @if (authService.isPatient()) {
                    <div class="info-row">
                      <span class="label">Doctor:</span>
                      <span class="value">{{ appointment.Doctor?.User?.name }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Specialization:</span>
                      <span class="value">{{ appointment.Doctor?.specialization }}</span>
                    </div>
                  }

                  @if (authService.isDoctor()) {
                    <div class="info-row">
                      <span class="label">Patient:</span>
                      <span class="value">{{ appointment.Patient?.User?.name }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">Patient ID:</span>
                      <span class="value">{{ appointment.Patient?.patientId }}</span>
                    </div>
                  }

                  <div class="info-row">
                    <span class="label">Time:</span>
                    <span class="value">{{ appointment.startTime }} - {{ appointment.endTime }}</span>
                  </div>

                  @if (appointment.reason) {
                    <div class="info-row">
                      <span class="label">Reason:</span>
                      <span class="value">{{ appointment.reason }}</span>
                    </div>
                  }

                  @if (appointment.consultationNotes) {
                    <div class="info-row">
                      <span class="label">Notes:</span>
                      <span class="value">{{ appointment.consultationNotes }}</span>
                    </div>
                  }

                  @if (appointment.prescription) {
                    <div class="info-row">
                      <span class="label">Prescription:</span>
                      <span class="value">{{ appointment.prescription }}</span>
                    </div>
                  }
                </div>

                <div class="appointment-actions">
                    <!-- Add this button for all users -->
                    <a 
                      [routerLink]="['/appointments', appointment.id]" 
                      class="btn btn-info btn-sm"
                    >
                      View Details
                    </a>
                    
                    @if (appointment.status === 'scheduled' && authService.isPatient()) {
                      <button 
                        class="btn btn-danger btn-sm"
                        (click)="cancelAppointment(appointment.id)"
                      >
                        Cancel
                      </button>
                    }

                    @if (appointment.status === 'scheduled' && authService.isDoctor()) {
                      <a 
                        [routerLink]="['/appointments', appointment.id]"
                        class="btn btn-primary btn-sm"
                      >
                        Start Consultation
                      </a>
                    }
                  </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .appointments-container {
      padding: 2rem 0;
      min-height: calc(100vh - 300px);
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: #2d3748;
      margin: 0;
    }

    .loading, .no-data {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .no-data p {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .appointment-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
      transition: transform 0.2s;
    }

    .appointment-card:hover {
      transform: translateX(5px);
    }

    .appointment-card.status-completed {
      border-left-color: #48bb78;
    }

    .appointment-card.status-cancelled {
      border-left-color: #f56565;
      opacity: 0.7;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
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

    .badge-no-show {
      background: #feebc8;
      color: #7c2d12;
    }

    .appointment-date {
      color: #667eea;
      font-weight: 600;
    }

    .appointment-body {
      margin-bottom: 1rem;
    }

    .info-row {
      display: flex;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }

    .info-row .label {
      font-weight: 600;
      color: #4a5568;
      min-width: 140px;
    }

    .info-row .value {
      color: #2d3748;
    }

    .appointment-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      transition: transform 0.2s;
      display: inline-block;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.875rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-danger {
      background: #f56565;
      color: white;
    }
    
    .btn-info {
      background: #4299e1;
      color: white;
    }
  `]
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  authService = inject(AuthService);

  appointments = signal<Appointment[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          alert('Error cancelling appointment: ' + error.message);
        }
      });
    }
  }

  completeAppointment(id: number): void {
    this.appointmentService.updateAppointmentStatus(id, 'completed').subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (error) => {
        alert('Error updating appointment: ' + error.message);
      }
    });
  }
}
