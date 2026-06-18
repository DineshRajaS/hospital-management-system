import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment';
import { DoctorService } from '../../../core/services/doctor';
import { PatientService } from '../../../core/services/patient';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-container">
      <div class="container">
        <h1>Book Appointment</h1>

        @if (successMessage()) {
          <div class="alert alert-success">{{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
          <div class="form-group">
            <label for="doctorId">Select Doctor *</label>
            <select id="doctorId" formControlName="doctorId" (change)="onDoctorChange()">
              <option value="">Choose a doctor</option>
              @for (doctor of doctors(); track doctor.id) {
                <option [value]="doctor.id">
                  {{ doctor.User?.name }} - {{ doctor.specialization }} (\${{ doctor.consultationFee }})
                </option>
              }
            </select>
            @if (bookingForm.get('doctorId')?.invalid && bookingForm.get('doctorId')?.touched) {
              <span class="error-text">Please select a doctor</span>
            }
          </div>

          <div class="form-group">
            <label for="appointmentDate">Appointment Date *</label>
            <input 
              id="appointmentDate"
              type="date" 
              formControlName="appointmentDate"
              [min]="minDate"
            />
            @if (bookingForm.get('appointmentDate')?.invalid && bookingForm.get('appointmentDate')?.touched) {
              <span class="error-text">Please select a date</span>
            }
          </div>

          <div class="form-group">
            <label for="startTime">Appointment Time * (9 AM - 5 PM)</label>
            <input 
              id="startTime"
              type="time" 
              formControlName="startTime"
              min="09:00"
              max="17:00"
            />
            @if (bookingForm.get('startTime')?.invalid && bookingForm.get('startTime')?.touched) {
              <span class="error-text">Please select a time between 9 AM and 5 PM</span>
            }
          </div>

          @if (availabilityChecked() && !isAvailable()) {
            <div class="alert alert-warning">
              This time slot is not available. Please choose another time.
            </div>
          }

          @if (availabilityChecked() && isAvailable() && endTime()) {
            <div class="alert alert-info">
              ✓ Time slot available! Appointment duration: 30 minutes (ends at {{ endTime() }})
            </div>
          }

          <div class="form-group">
            <label for="reason">Reason for Visit</label>
            <textarea 
              id="reason"
              formControlName="reason"
              rows="4"
              placeholder="Describe your symptoms or reason for consultation"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="checkAvailability()"
              [disabled]="!bookingForm.get('doctorId')?.value || !bookingForm.get('appointmentDate')?.value || !bookingForm.get('startTime')?.value || checking()"
            >
              {{ checking() ? 'Checking...' : 'Check Availability' }}
            </button>

            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="bookingForm.invalid || !isAvailable() || loading()"
            >
              {{ loading() ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .booking-container {
      padding: 2rem 0;
      min-height: calc(100vh - 300px);
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 2rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .alert-warning {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .booking-form {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2d3748;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .error-text {
      color: #c33;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn:not(:disabled):hover {
      transform: translateY(-2px);
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
  `]
})
export class AppointmentBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);

  doctors = signal<any[]>([]);
  loading = signal(false);
  checking = signal(false);
  availabilityChecked = signal(false);
  isAvailable = signal(false);
  endTime = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  patientId: number | null = null;
  minDate: string;

  bookingForm = this.fb.group({
    doctorId: ['', Validators.required],
    appointmentDate: ['', Validators.required],
    startTime: ['', Validators.required],
    reason: ['']
  });

  constructor() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadPatientProfile();

    const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    if (doctorId) {
      this.bookingForm.patchValue({ doctorId });
    }
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        this.doctors.set(response.data);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadPatientProfile(): void {
    if (this.authService.isPatient()) {
      this.patientService.getMyProfile().subscribe({
        next: (response) => {
          this.patientId = response.data.id;
        },
        error: (error) => {
          console.error('Error loading patient profile:', error);
        }
      });
    }
  }

  onDoctorChange(): void {
    this.availabilityChecked.set(false);
    this.isAvailable.set(false);
  }

  checkAvailability(): void {
    const { doctorId, appointmentDate, startTime } = this.bookingForm.value;

    if (!doctorId || !appointmentDate || !startTime) {
      return;
    }

    this.checking.set(true);
    this.errorMessage.set('');

    this.appointmentService.checkAvailability({
      doctorId: Number(doctorId),
      appointmentDate,
      startTime
    }).subscribe({
      next: (response) => {
        this.checking.set(false);
        this.availabilityChecked.set(true);
        this.isAvailable.set(response.available);
        this.endTime.set(response.endTime || '');
      },
      error: (error) => {
        this.checking.set(false);
        this.availabilityChecked.set(true);
        this.isAvailable.set(false);
        this.errorMessage.set(error.message || 'Error checking availability');
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.patientId) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const appointmentData = {
        ...this.bookingForm.value,
        doctorId: Number(this.bookingForm.value.doctorId),
        patientId: this.patientId
      };

//       this.appointmentService.createAppointment(appointmentData).subscribe({
//         next: (response) => {
//           this.loading.set(  getRevenueReport(filters?: any): Observable<any> {
//     let params = new HttpParams();
//     if (filters) {
//       Object.keys(filters).forEach(key => {
//         if (filters[key]) {
//           params = params.set(key, filters[key]);
//         }
//       });
//     }
//     return this.http.get<any>(`${this.apiUrl}/reports/revenue`, { params });
//   }
// }

      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.successMessage.set('Appointment booked successfully!');
          
          setTimeout(() => {
            this.router.navigate(['/appointments']);
          }, 2000);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.message || 'Error booking appointment');
        }
      });
    }
  }
}

