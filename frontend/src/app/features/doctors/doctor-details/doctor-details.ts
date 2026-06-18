import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor';
import { Doctor } from '../../../core/models/interfaces';

@Component({
  selector: 'app-doctor-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="doctor-details-container">
      <div class="container">
        @if (loading()) {
          <div class="loading">Loading doctor details...</div>
        } @else if (doctor()) {
          <div class="doctor-profile">
            <div class="profile-header">
              <div class="doctor-avatar-large">
                @if (doctor()!.profilePicture) {
                  <img [src]="doctor()!.profilePicture" [alt]="doctor()!.User?.name" />
                } @else {
                  <div class="avatar-placeholder">👨‍⚕️</div>
                }
              </div>
              <div class="profile-info">
                <h1>{{ doctor()!.User?.name }}</h1>
                <p class="specialization">{{ doctor()!.specialization }}</p>
                <p class="qualification">{{ doctor()!.qualification }}</p>
                <div class="rating">
                  ⭐ {{ doctor()!.rating }}/5.0
                </div>
              </div>
            </div>

            <div class="profile-body">
              <div class="info-card">
                <h2>Professional Information</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Experience:</span>
                    <span class="value">{{ doctor()!.experience }} years</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Department:</span>
                    <span class="value">{{ doctor()!.department || 'General' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Consultation Fee:</span>
                    <span class="value">\${{ doctor()!.consultationFee }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Working Hours:</span>
                    <span class="value">{{ doctor()!.workingHoursStart }} - {{ doctor()!.workingHoursEnd }}</span>
                  </div>
                </div>
              </div>

              <div class="info-card">
                <h2>Contact Information</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ doctor()!.User?.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Phone:</span>
                    <span class="value">{{ doctor()!.User?.phone }}</span>
                  </div>
                </div>
              </div>

              <div class="action-section">
                <a 
                  [routerLink]="['/appointments/book']" 
                  [queryParams]="{doctorId: doctor()!.id}"
                  class="btn btn-primary btn-large"
                >
                  Book Appointment
                </a>
                <a routerLink="/doctors" class="btn btn-secondary">
                  Back to Doctors List
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .doctor-details-container {
      padding: 2rem 0;
      min-height: calc(100vh - 300px);
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .doctor-profile {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
    }

    .doctor-avatar-large img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
    }

    .avatar-placeholder {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      border: 4px solid white;
    }

    .profile-info h1 {
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .specialization {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      opacity: 0.95;
    }

    .qualification {
      font-size: 1rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .rating {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .profile-body {
      padding: 2rem;
    }

    .info-card {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .info-card:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-card h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item .label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .info-item .value {
      color: #2d3748;
      font-size: 1.1rem;
    }

    .action-section {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: transform 0.2s;
    }

    .btn-large {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
    }

    .btn:hover {
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
export class DoctorDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);

  doctor = signal<Doctor | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDoctor(Number(id));
    }
  }

  loadDoctor(id: number): void {
    this.loading.set(true);
    this.doctorService.getDoctorById(id).subscribe({
      next: (response) => {
        this.doctor.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
        this.loading.set(false);
      }
    });
  }
}
