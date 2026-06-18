import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Register - Get Well Soon</h2>
        
        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input id="name" type="text" formControlName="name" placeholder="Enter your full name" />
            @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
              <span class="error-text">Name is required</span>
            }
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="Enter your email" />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-text">Valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input id="phone" type="tel" formControlName="phone" placeholder="10-digit phone number" />
            @if (registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched) {
              <span class="error-text">Valid 10-digit phone number required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Minimum 8 characters" />
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-text">Password must be at least 8 characters</span>
            }
          </div>

          <div class="form-group">
            <label for="role">Register As</label>
            <select id="role" formControlName="role">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          @if (registerForm.get('role')?.value === 'doctor') {
            <div class="doctor-fields">
              <div class="form-group">
                <label for="specialization">Specialization</label>
                <input id="specialization" type="text" formControlName="specialization" placeholder="e.g., Cardiologist" />
              </div>

              <div class="form-group">
                <label for="qualification">Qualification</label>
                <input id="qualification" type="text" formControlName="qualification" placeholder="e.g., MBBS, MD" />
              </div>

              <div class="form-group">
                <label for="experience">Experience (Years)</label>
                <input id="experience" type="number" formControlName="experience" placeholder="Years of experience" />
              </div>

              <div class="form-group">
                <label for="consultationFee">Consultation Fee</label>
                <input id="consultationFee" type="number" formControlName="consultationFee" placeholder="Fee in dollars" />
              </div>

              <div class="form-group">
                <label for="department">Department</label>
                <input id="department" type="text" formControlName="department" placeholder="e.g., Cardiology" />
              </div>
            </div>
          }

          <button type="submit" class="btn btn-primary btn-block" [disabled]="registerForm.invalid || loading">
            @if (loading) {
              Registering...
            } @else {
              Register
            }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 200px);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2 {
      text-align: center;
      color: #667eea;
      margin-bottom: 2rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1rem;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    input, select {
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

    .doctor-fields {
      border: 2px dashed #667eea;
      padding: 1rem;
      border-radius: 5px;
      margin: 1rem 0;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
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

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['patient', Validators.required],
    specialization: [''],
    qualification: [''],
    experience: [0],
    consultationFee: [0],
    department: ['']
  });

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;
      
      if (formData.role === 'patient') {
        delete formData.specialization;
        delete formData.qualification;
        delete formData.experience;
        delete formData.consultationFee;
        delete formData.department;
      }

      this.authService.register(formData as any).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}