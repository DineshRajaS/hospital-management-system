import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment';
import { PatientService } from '../../../core/services/patient';
import { AuthService } from '../../../core/services/auth';
import { Appointment } from '../../../core/models/interfaces';

@Component({
  selector: 'app-appointment-details',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="appointment-details-container">
      <div class="container">
        <div class="header-section">
          <h1>Appointment Details</h1>
          <button class="btn btn-secondary" (click)="goBack()">← Back</button>
        </div>

        @if (loading()) {
          <div class="loading">Loading appointment details...</div>
        } @else if (appointment()) {
          <div class="details-grid">
            <!-- Patient Information -->
            <div class="info-card">
              <h2>Patient Information</h2>
              <div class="info-content">
                <div class="info-row">
                  <span class="label">Patient ID:</span>
                  <span class="value">{{ appointment()!.Patient?.patientId }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ appointment()!.Patient?.User?.name }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ appointment()!.Patient?.User?.email }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">{{ appointment()!.Patient?.User?.phone }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Blood Group:</span>
                  <span class="value">{{ appointment()!.Patient?.bloodGroup || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Age:</span>
                  <span class="value">{{ calculateAge(appointment()!.Patient?.dateOfBirth) }}</span>
                </div>
              </div>
            </div>

            <!-- Medical History -->
            <div class="info-card">
              <h2>Medical History</h2>
              <div class="info-content">
                <div class="medical-section">
                  <h4>Allergies</h4>
                  <p>{{ appointment()!.Patient?.allergies || 'None reported' }}</p>
                </div>
                <div class="medical-section">
                  <h4>Chronic Conditions</h4>
                  <p>{{ appointment()!.Patient?.chronicConditions || 'None reported' }}</p>
                </div>
                <div class="medical-section">
                  <h4>Current Medications</h4>
                  <p>{{ appointment()!.Patient?.currentMedications || 'None' }}</p>
                </div>
                <div class="medical-section">
                  <h4>Past Medical History</h4>
                  <p>{{ appointment()!.Patient?.medicalHistory || 'No history available' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Details -->
          <div class="info-card">
            <h2>Appointment Details</h2>
            <div class="appointment-info">
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">{{ formatDate(appointment()!.appointmentDate) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">{{ appointment()!.startTime }} - {{ appointment()!.endTime }}</span>
              </div>
              <div class="info-row">
                <span class="label">Reason for Visit:</span>
                <span class="value">{{ appointment()!.reason || 'Not specified' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="status-badge" [class]="'badge-' + appointment()!.status">
                  {{ appointment()!.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Doctor Actions (Only for Doctors) -->
          @if (authService.isDoctor() && appointment()!.status === 'scheduled') {
            <div class="info-card">
              <h2>Consultation Form</h2>

              @if (successMessage()) {
                <div class="alert alert-success">{{ successMessage() }}</div>
              }

              @if (errorMessage()) {
                <div class="alert alert-error">{{ errorMessage() }}</div>
              }

              <form [formGroup]="consultationForm" (ngSubmit)="saveConsultation()">
                <div class="form-group">
                  <label for="consultationNotes">Consultation Notes *</label>
                  <textarea 
                    id="consultationNotes"
                    formControlName="consultationNotes"
                    rows="4"
                    placeholder="Enter consultation notes, diagnosis, observations..."
                  ></textarea>
                  @if (consultationForm.get('consultationNotes')?.invalid && consultationForm.get('consultationNotes')?.touched) {
                    <span class="error-text">Consultation notes are required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="prescription">Prescription / Medicines *</label>
                  <textarea 
                    id="prescription"
                    formControlName="prescription"
                    rows="5"
                    placeholder="Medicine Name - Dosage - Duration - Instructions
Example:
1. Paracetamol 500mg - 1 tablet - 3 times daily - After meals - 5 days
2. Amoxicillin 250mg - 1 capsule - 2 times daily - Before meals - 7 days"
                  ></textarea>
                  @if (consultationForm.get('prescription')?.invalid && consultationForm.get('prescription')?.touched) {
                    <span class="error-text">Prescription is required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="labTests">Lab Tests / Investigations</label>
                  <textarea 
                    id="labTests"
                    formControlName="labTests"
                    rows="3"
                    placeholder="Enter required lab tests and investigations
Example:
1. Complete Blood Count (CBC)
2. Blood Sugar (Fasting)
3. Chest X-Ray"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label for="followUp">Follow-up Instructions</label>
                  <textarea 
                    id="followUp"
                    formControlName="followUp"
                    rows="2"
                    placeholder="Follow-up date, precautions, lifestyle advice..."
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="consultationForm.invalid || saving()"
                  >
                    {{ saving() ? 'Saving...' : 'Save & Complete Appointment' }}
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- View Consultation Details (For completed appointments) -->
          @if (appointment()!.status === 'completed') {
            <div class="info-card">
              <h2>Consultation Details</h2>
              <div class="consultation-details">
                <div class="detail-section">
                  <h4>Consultation Notes</h4>
                  <p>{{ appointment()!.consultationNotes || 'No notes available' }}</p>
                </div>

                <div class="detail-section">
                  <h4>Prescription</h4>
                  <pre class="prescription-text">{{ appointment()!.prescription || 'No prescription' }}</pre>
                </div>

                @if (labTests()) {
                  <div class="detail-section">
                    <h4>Lab Tests Ordered</h4>
                    <pre class="prescription-text">{{ labTests() }}</pre>
                  </div>
                }

                @if (followUp()) {
                  <div class="detail-section">
                    <h4>Follow-up Instructions</h4>
                    <p>{{ followUp() }}</p>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .appointment-details-container {
      padding: 2rem 0;
      min-height: calc(100vh - 300px);
    }

    .container {
      max-width: 1200px;
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

    .loading {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 968px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    .info-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .info-card h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .info-row .label {
      font-weight: 600;
      color: #4a5568;
    }

    .info-row .value {
      color: #2d3748;
    }

    .medical-section {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .medical-section:last-child {
      border-bottom: none;
    }

    .medical-section h4 {
      color: #667eea;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .medical-section p {
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .appointment-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2d3748;
    }

    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
    }

    .error-text {
      color: #c33;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: transform 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .btn:not(:disabled):hover {
      transform: translateY(-2px);
    }

    .consultation-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-section {
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .detail-section h4 {
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .detail-section p {
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .prescription-text {
      background: white;
      padding: 1rem;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
      color: #2d3748;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', monospace;
      margin: 0;
    }
  `]
})
export class AppointmentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private patientService = inject(PatientService);
  authService = inject(AuthService);

  appointment = signal<Appointment | null>(null);
  loading = signal(false);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  labTests = signal('');
  followUp = signal('');

  consultationForm = this.fb.group({
    consultationNotes: ['', Validators.required],
    prescription: ['', Validators.required],
    labTests: [''],
    followUp: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAppointment(Number(id));
    }
  }

  loadAppointment(id: number): void {
    this.loading.set(true);
    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response.data);
        
        // Extract lab tests and follow-up from prescription if stored together
        if (response.data.prescription) {
          this.parseConsultationData(response.data.prescription);
        }
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointment:', error);
        this.errorMessage.set('Error loading appointment details');
        this.loading.set(false);
      }
    });
  }

  parseConsultationData(data: string): void {
    // Simple parsing - in production, use structured data
    const labTestMatch = data.match(/LAB TESTS:(.*?)(?:FOLLOW-UP:|$)/s);
    const followUpMatch = data.match(/FOLLOW-UP:(.*?)$/s);
    
    if (labTestMatch) this.labTests.set(labTestMatch[1].trim());
    if (followUpMatch) this.followUp.set(followUpMatch[1].trim());
  }

  calculateAge(dateOfBirth: string | undefined): string {
    if (!dateOfBirth) return 'N/A';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} years`;
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

  saveConsultation(): void {
    if (this.consultationForm.valid && this.appointment()) {
      this.saving.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formData = this.consultationForm.value;
      
      // Combine all data into prescription field with markers
      let fullPrescription = formData.prescription || '';
      
      if (formData.labTests) {
        fullPrescription += `\n\nLAB TESTS:\n${formData.labTests}`;
      }
      
      if (formData.followUp) {
        fullPrescription += `\n\nFOLLOW-UP:\n${formData.followUp}`;
      }

      const consultationData = {
        consultationNotes: formData.consultationNotes,
        prescription: fullPrescription
      };

      this.appointmentService.addConsultationNotes(this.appointment()!.id, consultationData).subscribe({
        next: (response) => {
          this.saving.set(false);
          this.successMessage.set('Consultation saved and appointment marked as completed!');
          
          setTimeout(() => {
            this.router.navigate(['/doctor/schedule']);
          }, 2000);
        },
        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(error.message || 'Error saving consultation');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/appointments']);
  }
}
