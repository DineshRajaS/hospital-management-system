import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="container">
        <h1>My Profile</h1>

        @if (successMessage()) {
          <div class="alert alert-success">{{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        @if (loading()) {
          <div class="loading">Loading profile...</div>
        } @else {
          <div class="profile-sections">
            <!-- Personal Information -->
            <div class="profile-card">
              <h2>Personal Information</h2>
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="form-row">
                  <div class="form-group">
                    <label>Patient ID</label>
                    <input type="text" [value]="patient()?.patientId" disabled />
                  </div>
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" [value]="patient()?.User?.name" disabled />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [value]="patient()?.User?.email" disabled />
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" [value]="patient()?.User?.phone" disabled />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input id="dateOfBirth" type="date" formControlName="dateOfBirth" />
                  </div>
                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" formControlName="gender">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="address">Address</label>
                  <textarea id="address" formControlName="address" rows="3"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="emergencyContact">Emergency Contact</label>
                    <input id="emergencyContact" type="tel" formControlName="emergencyContact" />
                  </div>
                  <div class="form-group">
                    <label for="bloodGroup">Blood Group</label>
                    <select id="bloodGroup" formControlName="bloodGroup">
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || updating()">
                  {{ updating() ? 'Updating...' : 'Update Profile' }}
                </button>
              </form>
            </div>

            <!-- Medical History -->
            <div class="profile-card">
              <h2>Medical History</h2>
              <form [formGroup]="medicalForm" (ngSubmit)="updateMedicalHistory()">
                <div class="form-group">
                  <label for="medicalHistory">Past Illnesses & Surgeries</label>
                  <textarea id="medicalHistory" formControlName="medicalHistory" rows="3" 
                    placeholder="List any past illnesses, surgeries, or major health events"></textarea>
                </div>

                <div class="form-group">
                  <label for="allergies">Allergies</label>
                  <textarea id="allergies" formControlName="allergies" rows="2"
                    placeholder="List any known allergies (medications, food, etc.)"></textarea>
                </div>

                <div class="form-group">
                  <label for="chronicConditions">Chronic Conditions</label>
                  <textarea id="chronicConditions" formControlName="chronicConditions" rows="2"
                    placeholder="List any chronic conditions (diabetes, hypertension, etc.)"></textarea>
                </div>

                <div class="form-group">
                  <label for="currentMedications">Current Medications</label>
                  <textarea id="currentMedications" formControlName="currentMedications" rows="3"
                    placeholder="List all current medications with dosage"></textarea>
                </div>

                <button type="submit" class="btn btn-primary" [disabled]="updatingMedical()">
                  {{ updatingMedical() ? 'Updating...' : 'Update Medical History' }}
                </button>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem 0;
      min-height: calc(100vh - 300px);
    }

    .container {
      max-width: 1000px;
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

    .loading {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .profile-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .profile-card h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
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
      font-family: inherit;
    }

    input:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
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

    .btn:not(:disabled):hover {
      transform: translateY(-2px);
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);

  patient = signal<any>(null);
  loading = signal(false);
  updating = signal(false);
  updatingMedical = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profileForm = this.fb.group({
    dateOfBirth: [''],
    gender: [''],
    address: [''],
    emergencyContact: [''],
    bloodGroup: ['']
  });

  medicalForm = this.fb.group({
    medicalHistory: [''],
    allergies: [''],
    chronicConditions: [''],
    currentMedications: ['']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.patientService.getMyProfile().subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.profileForm.patchValue(response.data);
        this.medicalForm.patchValue(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error loading profile');
        this.loading.set(false);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating.set(true);
      this.successMessage.set('');
      this.errorMessage.set('');

      this.patientService.updateMyProfile(this.profileForm.value).subscribe({
        next: (response) => {
          this.updating.set(false);
          this.successMessage.set('Profile updated successfully!');
          this.patient.set(response.data);
        },
        error: (error) => {
          this.updating.set(false);
          this.errorMessage.set(error.message || 'Error updating profile');
        }
      });
    }
  }

  updateMedicalHistory(): void {
    this.updatingMedical.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.patientService.updateMedicalHistory(this.medicalForm.value).subscribe({
      next: (response) => {
        this.updatingMedical.set(false);
        this.successMessage.set('Medical history updated successfully!');
        this.patient.set(response.data);
      },
      error: (error) => {
        this.updatingMedical.set(false);
        this.errorMessage.set(error.message || 'Error updating medical history');
      }
    });
  }
}
