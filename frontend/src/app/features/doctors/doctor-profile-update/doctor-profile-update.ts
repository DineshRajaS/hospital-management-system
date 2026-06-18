import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-doctor-profile-update',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="container">
        <h1>My Doctor Profile</h1>

        @if (successMessage()) {
          <div class="alert alert-success">{{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="alert alert-error">{{ errorMessage() }}</div>
        }

        @if (loading()) {
          <div class="loading">Loading profile...</div>
        } @else {
          <div class="profile-card">
            <h2>Professional Information</h2>
            
            @if (doctor()) {
              <div class="info-section">
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ doctor()!.User?.name }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ doctor()!.User?.email }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">{{ doctor()!.User?.phone }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Specialization:</span>
                  <span class="value">{{ doctor()!.specialization }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Qualification:</span>
                  <span class="value">{{ doctor()!.qualification }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Experience:</span>
                  <span class="value">{{ doctor()!.experience }} years</span>
                </div>
                <div class="info-row">
                  <span class="label">Department:</span>
                  <span class="value">{{ doctor()!.department || 'General' }}</span>
                </div>
              </div>
            }
          </div>

          <div class="profile-card">
            <h2>Update Consultation Settings</h2>
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <div class="form-group">
                <label for="consultationFee">Consultation Fee (\$) *</label>
                <input 
                  id="consultationFee"
                  type="number" 
                  formControlName="consultationFee"
                  step="0.01"
                  min="0"
                />
                @if (profileForm.get('consultationFee')?.invalid && profileForm.get('consultationFee')?.touched) {
                  <span class="error-text">Valid consultation fee is required</span>
                }
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="workingHoursStart">Working Hours Start *</label>
                  <input 
                    id="workingHoursStart"
                    type="time" 
                    formControlName="workingHoursStart"
                  />
                </div>

                <div class="form-group">
                  <label for="workingHoursEnd">Working Hours End *</label>
                  <input 
                    id="workingHoursEnd"
                    type="time" 
                    formControlName="workingHoursEnd"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="profileForm.invalid || updating()"
              >
                {{ updating() ? 'Updating...' : 'Update Profile' }}
              </button>
            </form>
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
      max-width: 800px;
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

    .profile-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .profile-card h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row .label {
      font-weight: 600;
      color: #4a5568;
    }

    .info-row .value {
      color: #2d3748;
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

    input {
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

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: transform 0.2s;
      width: 100%;
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
export class DoctorProfileUpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private authService = inject(AuthService);

  doctor = signal<any>(null);
  loading = signal(false);
  updating = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  profileForm = this.fb.group({
    consultationFee: [0, [Validators.required, Validators.min(0)]],
    workingHoursStart: ['09:00', Validators.required],
    workingHoursEnd: ['17:00', Validators.required]
  });

  ngOnInit(): void {
    this.loadDoctorProfile();
  }

  loadDoctorProfile(): void {
    this.loading.set(true);
    const userId = this.authService.currentUser()?.id;
    
    // Get all doctors and find current user's doctor profile
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        const doctorProfile = response.data.find(d => d.userId === userId);
        if (doctorProfile) {
          this.doctor.set(doctorProfile);
          this.profileForm.patchValue({
            consultationFee: doctorProfile.consultationFee,
            workingHoursStart: doctorProfile.workingHoursStart,
            workingHoursEnd: doctorProfile.workingHoursEnd
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctor profile:', error);
        this.loading.set(false);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      this.doctorService.updateOwnProfile(this.profileForm.value).subscribe({
        next: (response) => {
          this.updating.set(false);
          this.successMessage.set('Profile updated successfully!');
          this.doctor.set(response.data);
        },
        error: (error) => {
          this.updating.set(false);
          this.errorMessage.set(error.message || 'Error updating profile');
        }
      });
    }
  }
}
