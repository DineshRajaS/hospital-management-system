import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor';
import { Doctor } from '../../../core/models/interfaces';

@Component({
  selector: 'app-doctor-list',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="doctors-container">
      <div class="container">
        <h1>Our Doctors</h1>

        <!-- Search and Filter Section -->
        <div class="filters-section">
          <div class="filter-group">
            <label>Search by Name</label>
            <input 
              type="text" 
              [(ngModel)]="searchName"
              placeholder="Doctor name"
              (input)="searchDoctors()"
            />
          </div>

          <div class="filter-group">
            <label>Specialization</label>
            <select [(ngModel)]="searchSpecialization" (change)="searchDoctors()">
              <option value="">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="ENT Specialist">ENT Specialist</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Max Fee</label>
            <input 
              type="number" 
              [(ngModel)]="maxFee"
              placeholder="Maximum fee"
              (input)="searchDoctors()"
            />
          </div>

          <button class="btn btn-secondary" (click)="clearFilters()">Clear Filters</button>
        </div>

        <!-- Doctors Grid -->
        @if (loading()) {
          <div class="loading">Loading doctors...</div>
        } @else if (doctors().length === 0) {
          <div class="no-data">No doctors found matching your criteria.</div>
        } @else {
          <div class="doctors-grid">
            @for (doctor of doctors(); track doctor.id) {
              <div class="doctor-card">
                <div class="doctor-avatar">
                  @if (doctor.profilePicture) {
                    <img [src]="doctor.profilePicture" [alt]="doctor.User?.name" />
                  } @else {
                    <div class="avatar-placeholder">👨‍⚕️</div>
                  }
                </div>

                <h3>{{ doctor.User?.name }}</h3>
                <p class="specialization">{{ doctor.specialization }}</p>
                <p class="qualification">{{ doctor.qualification }}</p>

                <div class="doctor-details">
                  <div class="detail-item">
                    <span class="label">Experience:</span>
                    <span class="value">{{ doctor.experience }} years</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Fee:</span>
                    <span class="value">\${{ doctor.consultationFee }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Rating:</span>
                    <span class="value">⭐ {{ doctor.rating }}/5</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Department:</span>
                    <span class="value">{{ doctor.department || 'General' }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <a [routerLink]="['/doctors', doctor.id]" class="btn btn-primary">View Profile</a>
                  <a [routerLink]="['/appointments/book']" [queryParams]="{doctorId: doctor.id}" class="btn btn-secondary">Book Now</a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .doctors-container {
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 2rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2d3748;
    }

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .doctor-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .doctor-card:hover {
      transform: translateY(-5px);
    }

    .doctor-avatar {
      text-align: center;
      margin-bottom: 1rem;
    }

    .doctor-avatar img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }

    .doctor-card h3 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .specialization {
      text-align: center;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .qualification {
      text-align: center;
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .doctor-details {
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .detail-item .label {
      color: #718096;
      font-size: 0.9rem;
    }

    .detail-item .value {
      color: #2d3748;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      text-align: center;
      text-decoration: none;
      transition: transform 0.2s;
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

    .loading, .no-data {
      text-align: center;
      padding: 3rem;
      color: #718096;
      font-size: 1.2rem;
    }
  `]
})
export class DoctorListComponent implements OnInit {
  private doctorService = inject(DoctorService);

  doctors = signal<Doctor[]>([]);
  allDoctors = signal<Doctor[]>([]);
  loading = signal(false);

  searchName = '';
  searchSpecialization = '';
  maxFee: number | null = null;

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        this.doctors.set(response.data);
        this.allDoctors.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading.set(false);
      }
    });
  }

  searchDoctors(): void {
    if (!this.searchName && !this.searchSpecialization) {
      this.filterDoctors();
      return;
    }

    const params: any = {};
    if (this.searchName) params.name = this.searchName;
    if (this.searchSpecialization) params.specialization = this.searchSpecialization;

    console.log("doctorListTs-", this.searchSpecialization);
    console.log("doctorListTs-", params);
    this.loading.set(true);
    this.doctorService.searchDoctors(params).subscribe({
      next: (response) => {
        this.doctors.set(response.data);
        this.filterDoctors();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching doctors:', error);
        this.loading.set(false);
      }
    });
  }

  filterDoctors(): void {
    // let filtered = this.allDoctors();

    // if (this.maxFee) {
    //   filtered = filtered.filter(d => d.consultationFee <= this.maxFee!);
    // }

    // this.doctors.set(filtered);

    if (this.maxFee) {
      const filtered = this.doctors().filter(
        doctor => doctor.consultationFee <= this.maxFee!
      );
      this.doctors.set(filtered);
    }
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchSpecialization = '';
    this.maxFee = null;
    this.doctors.set(this.allDoctors());
  }
}
