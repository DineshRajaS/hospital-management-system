import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../../core/services/patient';
import { Patient } from '../../../core/models/interfaces';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-patients-container">
      <div class="container">
        <div class="header-section">
          <h1>Manage Patients</h1>
          <a routerLink="/admin/patients/add" class="btn btn-primary">Add New Patient</a>
        </div>

        @if (loading()) {
          <div class="loading">Loading patients...</div>
        } @else if (patients().length === 0) {
          <div class="no-data">No patients found</div>
        } @else {
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (patient of patients(); track patient.id) {
                  <tr>
                    <td>{{ patient.patientId }}</td>
                    <td>{{ patient.User?.name }}</td>
                    <td>{{ patient.User?.email }}</td>
                    <td>{{ patient.User?.phone }}</td>
                    <td>{{ patient.bloodGroup || 'N/A' }}</td>
                    <td>{{ patient.gender || 'N/A' }}</td>
                    <td class="actions">
                      <button class="btn-icon" title="View" (click)="viewPatient(patient.id)">👁️</button>
                      <button class="btn-icon" title="Edit" (click)="editPatient(patient.id)">✏️</button>
                      <button class="btn-icon" title="Medical History" (click)="viewMedicalHistory(patient.id)">📋</button>
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
    .admin-patients-container {
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
export class AdminPatientsComponent implements OnInit {
  private patientService = inject(PatientService);

  patients = signal<Patient[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.patientService.getAllPatients().subscribe({
      next: (response) => {
        this.patients.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading.set(false);
      }
    });
  }

  viewPatient(id: number): void {
    alert(`View patient details - ID: ${id}\nNavigate to patient detail page`);
  }

  editPatient(id: number): void {
    alert(`Edit patient - ID: ${id}\nNavigate to patient edit form`);
  }

  viewMedicalHistory(id: number): void {
    alert(`View medical history - Patient ID: ${id}\nShow medical history modal or page`);
  }
}
