import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor';
import { Doctor } from '../../../core/models/interfaces';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-doctors-container">
      <div class="container">
        <div class="header-section">
          <h1>Manage Doctors</h1>
          <a routerLink="/admin/doctors/add" class="btn btn-primary">Add New Doctor</a>
        </div>

        @if (loading()) {
          <div class="loading">Loading doctors...</div>
        } @else if (doctors().length === 0) {
          <div class="no-data">No doctors found</div>
        } @else {
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (doctor of doctors(); track doctor.id) {
                  <tr>
                    <td>{{ doctor.id }}</td>
                    <td>{{ doctor.User?.name }}</td>
                    <td>{{ doctor.specialization }}</td>
                    <td>{{ doctor.experience }} years</td>
                    <td>\${{ doctor.consultationFee }}</td>
                    <td>⭐ {{ doctor.rating }}</td>
                    <td class="actions">
                      <button class="btn-icon" title="Edit" (click)="editDoctor(doctor.id)">✏️</button>
                      <button class="btn-icon" title="Delete" (click)="deleteDoctor(doctor.id)">🗑️</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-doctors-container {
      padding: 2rem 0;
    }

    .container {
      max-width: 1400px;
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

    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
      transition: transform 0.2s;
    }

    .btn-icon:hover {
      transform: scale(1.2);
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

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn:hover {
      transform: translateY(-2px);
    }
  `]
})
export class AdminDoctorsComponent implements OnInit {
  private doctorService = inject(DoctorService);

  doctors = signal<Doctor[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        this.doctors.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading.set(false);
      }
    });
  }

  editDoctor(id: number): void {
    alert('Edit doctor functionality - Navigate to edit form');
  }

  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          alert('Doctor deleted successfully');
          this.loadDoctors();
        },
        error: (error) => {
          alert('Error deleting doctor: ' + error.message);
        }
      });
    }
  }
}
