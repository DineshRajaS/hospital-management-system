import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BillService } from '../../../core/services/bill';
import { AppointmentService } from '../../../core/services/appointment';
import { Bill } from '../../../core/models/interfaces';

@Component({
  selector: 'app-admin-bills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-bills-container">
      <div class="container">
        <div class="header-section">
          <h1>Manage Bills</h1>
          <div class="header-actions">
            <span class="pending-indicator">
              ⚠️ {{ pendingBillsCount() }} Appointments Pending Bill
            </span>
            <button class="btn btn-primary" (click)="toggleBillForm()">
              {{ showForm() ? 'Cancel' : '+ Generate Bill' }}
            </button>
          </div>
        </div>

        <!-- Bill Generation Form -->
        @if (showForm()) {
          <div class="bill-form-card">
            <h2>Generate New Bill</h2>

            @if (successMessage()) {
              <div class="alert alert-success">{{ successMessage() }}</div>
            }

            @if (errorMessage()) {
              <div class="alert alert-error">{{ errorMessage() }}</div>
            }

            <form [formGroup]="billForm" (ngSubmit)="generateBill()">
              <div class="form-row">
                <div class="form-group full-width">
                  <label for="appointmentId">Select Appointment *</label>
                  <select id="appointmentId" formControlName="appointmentId" (change)="onAppointmentChange()">
                    <option value="">Choose appointment</option>
                    @for (appointment of completedAppointments(); track appointment.id) {
                      <option [value]="appointment.id">
                        {{ appointment.Patient?.User?.name }} - {{ appointment.Doctor?.User?.name }} ({{ formatDate(appointment.appointmentDate) }})
                      </option>
                    }
                  </select>
                  @if (billForm.get('appointmentId')?.invalid && billForm.get('appointmentId')?.touched) {
                    <span class="error-text">Please select an appointment</span>
                  }
                </div>
              </div>

              @if (selectedAppointment()) {
                <div class="appointment-info">
                  <h3>Appointment Details</h3>
                  <p><strong>Patient:</strong> {{ selectedAppointment()!.Patient?.User?.name }}</p>
                  <p><strong>Doctor:</strong> {{ selectedAppointment()!.Doctor?.User?.name }}</p>
                  <p><strong>Date:</strong> {{ formatDate(selectedAppointment()!.appointmentDate) }}</p>
                  <p><strong>Consultation Fee:</strong> \${{ selectedAppointment()!.Doctor?.consultationFee }}</p>
                  
                  @if (prescribedMedicines().length > 0) {
                    <div class="prescription-section">
                      <h4>💊 Prescribed Medicines</h4>
                      <ul>
                        @for (medicine of prescribedMedicines(); track $index) {
                          <li>{{ medicine }}</li>
                        }
                      </ul>
                    </div>
                  }

                  @if (orderedTests().length > 0) {
                    <div class="tests-section">
                      <h4>🧪 Lab Tests Ordered</h4>
                      <ul>
                        @for (test of orderedTests(); track $index) {
                          <li>{{ test }}</li>
                        }
                      </ul>
                      <p class="info-text">💡 Add test fees in the form below</p>
                    </div>
                  } @else {
                    <p class="warning-text">⚠️ No lab tests ordered for this appointment</p>
                  }
                </div>
              }

              <div class="form-row">
                <div class="form-group">
                  <label for="consultationFee">Consultation Fee *</label>
                  <input 
                    id="consultationFee"
                    type="number" 
                    formControlName="consultationFee"
                    step="0.01"
                    readonly
                  />
                </div>

                <div class="form-group">
                  <label for="medicineFee">Medicine Fee</label>
                  <input 
                    id="medicineFee"
                    type="number" 
                    formControlName="medicineFee"
                    step="0.01"
                    placeholder="Based on prescription"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="testFee">
                    Lab Test Fee 
                    @if (orderedTests().length > 0) {
                      <span class="required-indicator">* (Tests ordered: {{ orderedTests().length }})</span>
                    }
                  </label>
                  <input 
                    id="testFee"
                    type="number" 
                    formControlName="testFee"
                    step="0.01"
                    [placeholder]="orderedTests().length > 0 ? 'Enter total test fee' : 'No tests ordered'"
                  />
                </div>

                <div class="form-group">
                  <label for="procedureFee">Procedure Fee</label>
                  <input 
                    id="procedureFee"
                    type="number" 
                    formControlName="procedureFee"
                    step="0.01"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tax">Tax (%)</label>
                  <input 
                    id="tax"
                    type="number" 
                    formControlName="tax"
                    step="0.01"
                  />
                </div>

                <div class="form-group">
                  <label for="discount">Discount</label>
                  <input 
                    id="discount"
                    type="number" 
                    formControlName="discount"
                    step="0.01"
                  />
                </div>
              </div>

              <!-- Total Calculation -->
              <div class="total-section">
                <div class="calculation-breakdown">
                  <div class="calc-row">
                    <span>Consultation:</span>
                    <span>\${{ billForm.get('consultationFee')?.value || 0 }}</span>
                  </div>
                  <div class="calc-row">
                    <span>Medicine:</span>
                    <span>\${{ billForm.get('medicineFee')?.value || 0 }}</span>
                  </div>
                  <div class="calc-row">
                    <span>Lab Tests:</span>
                    <span>\${{ billForm.get('testFee')?.value || 0 }}</span>
                  </div>
                  <div class="calc-row">
                    <span>Procedures:</span>
                    <span>\${{ billForm.get('procedureFee')?.value || 0 }}</span>
                  </div>
                  <div class="calc-row">
                    <span>Tax:</span>
                    <span>\${{ calculateTaxAmount() }}</span>
                  </div>
                  <div class="calc-row discount-row">
                    <span>Discount:</span>
                    <span>-\${{ billForm.get('discount')?.value || 0 }}</span>
                  </div>
                  <div class="calc-row total-row">
                    <span>Total Amount:</span>
                    <span>\${{ calculateTotal() }}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-block"
                [disabled]="billForm.invalid || generating()"
              >
                {{ generating() ? 'Generating...' : 'Generate Bill' }}
              </button>
            </form>
          </div>
        }

        <!-- Bills List with Filters -->
        <div class="bills-section">
          <div class="section-header">
            <h2>All Bills</h2>
            
            <!-- Filters -->
            <div class="filters-section">
              <div class="filter-group">
                <input 
                  type="text" 
                  [(ngModel)]="searchPatient"
                  (input)="applyFilters()"
                  placeholder="🔍 Search patient name..."
                  class="search-input"
                />
              </div>

              <div class="filter-group">
                <input 
                  type="text" 
                  [(ngModel)]="searchDoctor"
                  (input)="applyFilters()"
                  placeholder="🔍 Search doctor name..."
                  class="search-input"
                />
              </div>

              <div class="filter-group">
                <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div class="filter-group">
                <input 
                  type="date" 
                  [(ngModel)]="filterStartDate"
                  (change)="applyFilters()"
                  class="date-input"
                  placeholder="Start Date"
                />
              </div>

              <div class="filter-group">
                <input 
                  type="date" 
                  [(ngModel)]="filterEndDate"
                  (change)="applyFilters()"
                  class="date-input"
                  placeholder="End Date"
                />
              </div>

              <button class="btn btn-secondary btn-sm" (click)="clearFilters()">
                Clear Filters
              </button>
            </div>
          </div>

          @if (loading()) {
            <div class="loading">Loading bills...</div>
          } @else if (filteredBills().length === 0) {
            <div class="no-data">
              @if (bills().length === 0) {
                No bills generated yet
              } @else {
                No bills match your filter criteria
              }
            </div>
          } @else {
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th (click)="sortBy('billNumber')" class="sortable">
                      Bill # 
                      @if (sortField() === 'billNumber') {
                        <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th (click)="sortBy('patientName')" class="sortable">
                      Patient
                      @if (sortField() === 'patientName') {
                        <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th (click)="sortBy('doctorName')" class="sortable">
                      Doctor
                      @if (sortField() === 'doctorName') {
                        <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th (click)="sortBy('billDate')" class="sortable">
                      Date
                      @if (sortField() === 'billDate') {
                        <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th>Consultation</th>
                    <th>Medicine</th>
                    <th>Tests</th>
                    <th (click)="sortBy('totalAmount')" class="sortable">
                      Total
                      @if (sortField() === 'totalAmount') {
                        <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                      }
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (bill of filteredBills(); track bill.id) {
                    <tr>
                      <td>{{ bill.billNumber }}</td>
                      <td>{{ bill.Patient?.User?.name }}</td>
                      <td>{{ bill.Appointment?.Doctor?.User?.name }}</td>
                      <td>{{ formatDate(bill.billDate) }}</td>
                      <td class="amount">\${{ bill.consultationFee }}</td>
                      <td class="amount">\${{ bill.medicineFee }}</td>
                      <td class="amount">
                        \${{ bill.testFee }}
                        @if (bill.testFee > 0) {
                          <span class="test-indicator">🧪</span>
                        }
                      </td>
                      <td class="total-amount">\${{ bill.totalAmount }}</td>
                      <td>
                        <span class="status-badge" [class]="'badge-' + bill.status">
                          {{ bill.status }}
                        </span>
                      </td>
                      <td class="actions">
                        <button class="btn-icon" title="View" (click)="viewBill(bill.id)">👁️</button>
                        <button class="btn-icon" title="Edit" (click)="editBill(bill.id)">✏️</button>
                        <button class="btn-icon" title="Download" (click)="downloadBill(bill.id)">💾</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Summary -->
            <div class="summary-section">
              <div class="summary-card">
                <span>Total Bills:</span>
                <strong>{{ filteredBills().length }}</strong>
              </div>
              <div class="summary-card">
                <span>Total Amount:</span>
                <strong>\${{ calculateTotalRevenue() }}</strong>
              </div>
              <div class="summary-card">
                <span>Pending Bills:</span>
                <strong>{{ countByStatus('pending') }}</strong>
              </div>
              <div class="summary-card">
                <span>Paid Bills:</span>
                <strong>{{ countByStatus('paid') }}</strong>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-bills-container {
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
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .pending-indicator {
      background: #feebc8;
      color: #7c2d12;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    h1, h2 {
      color: #2d3748;
    }

    h1 {
      margin: 0;
    }

    .bill-form-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .bill-form-card h2 {
      color: #667eea;
      margin-bottom: 1.5rem;
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

    .appointment-info {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .appointment-info h3 {
      color: #667eea;
      margin-bottom: 1rem;
    }

    .appointment-info p {
      margin: 0.5rem 0;
      color: #4a5568;
    }

    .prescription-section, .tests-section {
      margin-top: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 5px;
      border-left: 4px solid #667eea;
    }

    .prescription-section h4, .tests-section h4 {
      color: #667eea;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .prescription-section ul, .tests-section ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .prescription-section li, .tests-section li {
      margin: 0.25rem 0;
      color: #4a5568;
    }

    .info-text {
      color: #48bb78;
      font-weight: 600;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    .warning-text {
      color: #ed8936;
      font-weight: 600;
      margin: 0.5rem 0;
    }

    .required-indicator {
      color: #ed8936;
      font-size: 0.9rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2d3748;
    }

    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    input[readonly] {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .error-text {
      color: #c33;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.25rem;
    }

    .total-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .calculation-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }

    .discount-row {
      color: #ffd700;
    }

    .total-row {
      border-top: 2px solid rgba(255,255,255,0.3);
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      font-size: 1.2rem;
      font-weight: bold;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin-bottom: 1rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .filter-group {
      flex: 1;
      min-width: 180px;
    }

    .search-input, .filter-select, .date-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .bills-section {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .table-container {
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
      white-space: nowrap;
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
    }

    th.sortable:hover {
      background: #edf2f7;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }

    td.amount {
      color: #667eea;
      font-weight: 500;
    }

    td.total-amount {
      color: #48bb78;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .test-indicator {
      font-size: 1.2rem;
      margin-left: 0.25rem;
    }

    tr:hover {
      background: #f7fafc;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-paid {
      background: #c6f6d5;
      color: #22543d;
    }

    .badge-pending {
      background: #feebc8;
      color: #7c2d12;
    }

    .badge-partially_paid {
      background: #bee3f8;
      color: #2c5282;
    }

    .badge-cancelled {
      background: #fed7d7;
      color: #742a2a;
    }

    .summary-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #e2e8f0;
    }

    .summary-card {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 5px;
    }

    .summary-card span {
      color: #718096;
    }

    .summary-card strong {
      color: #667eea;
      font-size: 1.2rem;
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
      transition: transform 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
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

    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn:not(:disabled):hover {
      transform: translateY(-2px);
    }

    .loading, .no-data {
      text-align: center;
      padding: 3rem;
      color: #718096;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .filters-section {
        flex-direction: column;
      }

      .filter-group {
        min-width: 100%;
      }

      .header-section {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
      }

      .pending-indicator {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class AdminBillsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private billService = inject(BillService);
  private appointmentService = inject(AppointmentService);

  bills = signal<Bill[]>([]);
  filteredBills = signal<Bill[]>([]);
  completedAppointments = signal<any[]>([]);
  selectedAppointment = signal<any>(null);
  prescribedMedicines = signal<string[]>([]);
  orderedTests = signal<string[]>([]);
  
  loading = signal(false);
  generating = signal(false);
  showForm = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  pendingBillsCount = signal(0);

  // Filter states
  searchPatient = '';
  searchDoctor = '';
  filterStatus = '';
  filterStartDate = '';
  filterEndDate = '';
  
  // Sort states
  sortField = signal('billDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  billForm = this.fb.group({
    appointmentId: ['', Validators.required],
    patientId: [0],
    consultationFee: [0, [Validators.required, Validators.min(0)]],
    medicineFee: [0, Validators.min(0)],
    testFee: [0, Validators.min(0)],
    procedureFee: [0, Validators.min(0)],
    tax: [0, Validators.min(0)],
    discount: [0, Validators.min(0)]
  });

  ngOnInit(): void {
    this.loadBills();
    this.loadCompletedAppointments();
  }

  toggleBillForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) {
      this.billForm.reset();
      this.selectedAppointment.set(null);
      this.prescribedMedicines.set([]);
      this.orderedTests.set([]);
      this.successMessage.set('');
      this.errorMessage.set('');
    }
  }

  loadBills(): void {
    this.loading.set(true);
    this.billService.getAllBills().subscribe({
      next: (response) => {
        this.bills.set(response.data);
        this.filteredBills.set(response.data);
        this.applySorting();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading bills:', error);
        this.loading.set(false);
      }
    });
  }

  loadCompletedAppointments(): void {
    this.appointmentService.getAppointments({ status: 'completed' }).subscribe({
      next: (response) => {
        const appointmentsWithoutBills = response.data.filter((appointment: any) => {
          return !this.bills().some(bill => bill.appointmentId === appointment.id);
        });
        this.completedAppointments.set(appointmentsWithoutBills);
        this.pendingBillsCount.set(appointmentsWithoutBills.length);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  onAppointmentChange(): void {
    const appointmentId = this.billForm.get('appointmentId')?.value;
    if (appointmentId) {
      const appointment = this.completedAppointments().find(a => a.id === Number(appointmentId));
      if (appointment) {
        this.selectedAppointment.set(appointment);
        this.parsePrescriptionData(appointment.prescription || '');
        
        this.billForm.patchValue({
          patientId: appointment.patientId,
          consultationFee: appointment.Doctor?.consultationFee || 0
        });
      }
    } else {
      this.selectedAppointment.set(null);
      this.prescribedMedicines.set([]);
      this.orderedTests.set([]);
    }
  }

  parsePrescriptionData(prescription: string): void {
    // Extract medicines (before LAB TESTS section)
    const medicineSection = prescription.split('LAB TESTS:')[0];
    const medicines = medicineSection
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.trim());
    this.prescribedMedicines.set(medicines);

    // Extract lab tests
    const labTestMatch = prescription.match(/LAB TESTS:(.*?)(?:FOLLOW-UP:|$)/s);
    if (labTestMatch) {
      const tests = labTestMatch[1]
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.trim());
      this.orderedTests.set(tests);
    } else {
      this.orderedTests.set([]);
    }
  }

  calculateTaxAmount(): number {
    const values = this.billForm.value;
    const subtotal = Number(values.consultationFee || 0) + 
                     Number(values.medicineFee || 0) + 
                     Number(values.testFee || 0) + 
                     Number(values.procedureFee || 0);
    const taxPercent = Number(values.tax || 0);
    return Number((subtotal * taxPercent / 100).toFixed(2));
  }

  calculateTotal(): number {
    const values = this.billForm.value;
    const subtotal = Number(values.consultationFee || 0) + 
                     Number(values.medicineFee || 0) + 
                     Number(values.testFee || 0) + 
                     Number(values.procedureFee || 0);
    const taxAmount = this.calculateTaxAmount();
    const discount = Number(values.discount || 0);
    return Number((subtotal + taxAmount - discount).toFixed(2));
  }

  generateBill(): void {
    if (this.billForm.valid) {
      this.generating.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formData = this.billForm.value;
      const billData = {
        appointmentId: Number(formData.appointmentId),
        patientId: Number(formData.patientId),
        consultationFee: Number(formData.consultationFee) || 0,
        medicineFee: Number(formData.medicineFee) || 0,
        testFee: Number(formData.testFee) || 0,
        procedureFee: Number(formData.procedureFee) || 0,
        tax: this.calculateTaxAmount(),
        discount: Number(formData.discount) || 0
      };

      this.billService.createBill(billData).subscribe({
        next: (response) => {
          this.generating.set(false);
          this.successMessage.set('✅ Bill generated successfully!');
          this.billForm.reset();
          this.selectedAppointment.set(null);
          this.prescribedMedicines.set([]);
          this.orderedTests.set([]);
          this.loadBills();
          this.loadCompletedAppointments();
          
          setTimeout(() => {
            this.showForm.set(false);
            this.successMessage.set('');
          }, 2000);
        },
        error: (error) => {
          this.generating.set(false);
          this.errorMessage.set(error.message || 'Error generating bill');
        }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.bills()];

    // Filter by patient name
    if (this.searchPatient) {
      filtered = filtered.filter(bill =>
        bill.Patient?.User?.name?.toLowerCase().includes(this.searchPatient.toLowerCase())
      );
    }

    // Filter by doctor name
    if (this.searchDoctor) {
      filtered = filtered.filter(bill =>
        bill.Appointment?.Doctor?.User?.name?.toLowerCase().includes(this.searchDoctor.toLowerCase())
      );
    }

    // Filter by status
    if (this.filterStatus) {
      filtered = filtered.filter(bill => bill.status === this.filterStatus);
    }

    // Filter by date range
    if (this.filterStartDate) {
      filtered = filtered.filter(bill => 
        new Date(bill.billDate) >= new Date(this.filterStartDate)
      );
    }

    if (this.filterEndDate) {
      filtered = filtered.filter(bill => 
        new Date(bill.billDate) <= new Date(this.filterEndDate)
      );
    }

    this.filteredBills.set(filtered);
    this.applySorting();
  }

  clearFilters(): void {
    this.searchPatient = '';
    this.searchDoctor = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filteredBills.set([...this.bills()]);
    this.applySorting();
  }

  sortBy(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.applySorting();
  }

  applySorting(): void {
    const sorted = [...this.filteredBills()].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField()) {
        case 'billNumber':
          aValue = a.billNumber;
          bValue = b.billNumber;
          break;
        case 'patientName':
          aValue = a.Patient?.User?.name || '';
          bValue = b.Patient?.User?.name || '';
          break;
        case 'doctorName':
          aValue = a.Appointment?.Doctor?.User?.name || '';
          bValue = b.Appointment?.Doctor?.User?.name || '';
          break;
        case 'billDate':
          aValue = new Date(a.billDate).getTime();
          bValue = new Date(b.billDate).getTime();
          break;
        case 'totalAmount':
          aValue = Number(a.totalAmount);
          bValue = Number(b.totalAmount);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredBills.set(sorted);
  }

  calculateTotalRevenue(): number {
    return Number(this.filteredBills().reduce((sum, bill) => sum + Number(bill.totalAmount), 0).toFixed(2));
  }

  countByStatus(status: string): number {
    return this.filteredBills().filter(bill => bill.status === status).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  viewBill(id: number): void {
    this.billService.getBillById(id).subscribe({
      next: (response) => {
        const bill = response.data;
        const details = `
Bill Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bill #: ${bill.billNumber}
Patient: ${bill.Patient?.User?.name}
Doctor: ${bill.Appointment?.Doctor?.User?.name}
Date: ${this.formatDate(bill.billDate)}

Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consultation Fee:    ${bill.consultationFee}
Medicine Fee:        ${bill.medicineFee}
Lab Test Fee:        ${bill.testFee}
Procedure Fee:       ${bill.procedureFee}
Tax:                 ${bill.tax}
Discount:           -${bill.discount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Amount:        ${bill.totalAmount}

Status: ${bill.status.toUpperCase()}
        `;
        alert(details);
      },
      error: (error) => {
        alert('Error loading bill details: ' + error.message);
      }
    });
  }

  editBill(id: number): void {
    alert(`Edit bill functionality\n\nBill ID: ${id}\n\nThis would navigate to an edit form where you can modify bill details.`);
  }

  downloadBill(id: number): void {
    alert(`Download bill PDF\n\nBill ID: ${id}\n\nThis would generate and download a PDF invoice. Integration with PDF library needed.`);
  }
}
