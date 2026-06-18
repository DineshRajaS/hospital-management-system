import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment';
import { Payment } from '../../../core/models/interfaces';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-payments-container">
      <div class="container">
        <div class="header-section">
          <h1>Manage Payments</h1>
          <button class="btn btn-primary" (click)="showRevenueReport()">📊 Revenue Report</button>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p class="amount">\${{ totalRevenue() }}</p>
          </div>
          <div class="summary-card">
            <h3>Total Payments</h3>
            <p class="count">{{ filteredPayments().length }}</p>
          </div>
          <div class="summary-card">
            <h3>Completed</h3>
            <p class="count completed">{{ countByStatus('completed') }}</p>
          </div>
          <div class="summary-card">
            <h3>Pending</h3>
            <p class="count pending">{{ countByStatus('pending') }}</p>
          </div>
        </div>

        <!-- Filters Section -->
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
            <select [(ngModel)]="filterPaymentMethod" (change)="applyFilters()" class="filter-select">
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="online_banking">Online Banking</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>

          <div class="filter-group">
            <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
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

        @if (loading()) {
          <div class="loading">Loading payments...</div>
        } @else if (filteredPayments().length === 0) {
          <div class="no-data">
            @if (payments().length === 0) {
              No payments found
            } @else {
              No payments match your filter criteria
            }
          </div>
        } @else {
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th (click)="sortBy('transactionId')" class="sortable">
                    Transaction ID
                    @if (sortField() === 'transactionId') {
                      <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </th>
                  <th (click)="sortBy('patientName')" class="sortable">
                    Patient
                    @if (sortField() === 'patientName') {
                      <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </th>
                  <th>Bill #</th>
                  <th (click)="sortBy('amount')" class="sortable">
                    Amount
                    @if (sortField() === 'amount') {
                      <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </th>
                  <th>Method</th>
                  <th>Status</th>
                  <th (click)="sortBy('paymentDate')" class="sortable">
                    Date
                    @if (sortField() === 'paymentDate') {
                      <span>{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
                    }
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of filteredPayments(); track payment.id) {
                  <tr>
                    <td>{{ payment.transactionId }}</td>
                    <td>{{ payment.Patient?.User?.name }}</td>
                    <td>{{ payment.Bill?.billNumber }}</td>
                    <td class="amount">\${{ payment.amount }}</td>
                    <td>
                      <span class="method-badge" [class]="'method-' + payment.paymentMethod">
                        {{ payment.paymentMethod }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class]="'badge-' + payment.paymentStatus">
                        {{ payment.paymentStatus }}
                      </span>
                    </td>
                    <td>{{ formatDate(payment.paymentDate) }}</td>
                    <td class="actions">
                      <button class="btn-icon" title="View Receipt" (click)="viewReceipt(payment.id)">📄</button>
                      <button class="btn-icon" title="Download" (click)="downloadReceipt(payment.id)">💾</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Summary Footer -->
          <div class="summary-footer">
            <div class="summary-item">
              <span>Filtered Payments:</span>
              <strong>{{ filteredPayments().length }}</strong>
            </div>
            <div class="summary-item">
              <span>Filtered Revenue:</span>
              <strong>\${{ calculateFilteredRevenue() }}</strong>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-payments-container {
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

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .summary-card h3 {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .summary-card .amount {
      color: #48bb78;
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
    }

    .summary-card .count {
      color: #667eea;
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
    }

    .summary-card .count.completed {
      color: #48bb78;
    }

    .summary-card .count.pending {
      color: #ed8936;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
      color: #48bb78;
      font-weight: 600;
      font-size: 1.1rem;
    }

    tr:hover {
      background: #f7fafc;
    }

    .method-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .method-cash {
      background: #c6f6d5;
      color: #22543d;
    }

    .method-card {
      background: #bee3f8;
      color: #2c5282;
    }

    .method-upi {
      background: #feebc8;
      color: #7c2d12;
    }

    .method-online_banking {
      background: #e9d8fd;
      color: #553c9a;
    }

    .method-insurance {
      background: #fed7d7;
      color: #742a2a;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-completed {
      background: #c6f6d5;
      color: #22543d;
    }

    .badge-pending {
      background: #feebc8;
      color: #7c2d12;
    }

    .badge-failed {
      background: #fed7d7;
      color: #742a2a;
    }

    .badge-refunded {
      background: #bee3f8;
      color: #2c5282;
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

    .summary-footer {
      display: flex;
      justify-content: space-around;
      margin-top: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-item span {
      color: #718096;
    }

    .summary-item strong {
      color: #667eea;
      font-size: 1.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
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

    .btn:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
      }

      .filter-group {
        min-width: 100%;
      }

      .summary-footer {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments = signal<Payment[]>([]);
  filteredPayments = signal<Payment[]>([]);
  loading = signal(false);
  totalRevenue = signal(0);

  // Filter states
  searchPatient = '';
  filterPaymentMethod = '';
  filterStatus = '';
  filterStartDate = '';
  filterEndDate = '';

  // Sort states
  sortField = signal('paymentDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.paymentService.getAllPayments().subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.filteredPayments.set(response.data);
        this.calculateTotalRevenue();
        this.applySorting();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.payments()];

    // Filter by patient name
    if (this.searchPatient) {
      filtered = filtered.filter(payment =>
        payment.Patient?.User?.name?.toLowerCase().includes(this.searchPatient.toLowerCase())
      );
    }

    // Filter by payment method
    if (this.filterPaymentMethod) {
      filtered = filtered.filter(payment => payment.paymentMethod === this.filterPaymentMethod);
    }

    // Filter by status
    if (this.filterStatus) {
      filtered = filtered.filter(payment => payment.paymentStatus === this.filterStatus);
    }

    // Filter by date range
    if (this.filterStartDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) >= new Date(this.filterStartDate)
      );
    }

    if (this.filterEndDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.paymentDate) <= new Date(this.filterEndDate)
      );
    }

    this.filteredPayments.set(filtered);
    this.applySorting();
  }

  clearFilters(): void {
    this.searchPatient = '';
    this.filterPaymentMethod = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filteredPayments.set([...this.payments()]);
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
    const sorted = [...this.filteredPayments()].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortField()) {
        case 'transactionId':
          aValue = a.transactionId;
          bValue = b.transactionId;
          break;
        case 'patientName':
          aValue = a.Patient?.User?.name || '';
          bValue = b.Patient?.User?.name || '';
          break;
        case 'amount':
          aValue = Number(a.amount);
          bValue = Number(b.amount);
          break;
        case 'paymentDate':
          aValue = new Date(a.paymentDate).getTime();
          bValue = new Date(b.paymentDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredPayments.set(sorted);
  }

  calculateTotalRevenue(): void {
    const total = this.payments().reduce((sum, payment) => {
      if (payment.paymentStatus === 'completed') {
        return sum + Number(payment.amount);
      }
      return sum;
    }, 0);
    this.totalRevenue.set(total);
  }

  calculateFilteredRevenue(): number {
    return Number(this.filteredPayments().reduce((sum, payment) => {
      if (payment.paymentStatus === 'completed') {
        return sum + Number(payment.amount);
      }
      return sum;
    }, 0).toFixed(2));
  }

  countByStatus(status: string): number {
    return this.filteredPayments().filter(p => p.paymentStatus === status).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  viewReceipt(id: number): void {
    this.paymentService.getPaymentById(id).subscribe({
      next: (response) => {
        const payment = response.data;
        const receipt = `
Payment Receipt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction ID: ${payment.transactionId}
Patient: ${payment.Patient?.User?.name}
Bill #: ${payment.Bill?.billNumber}

Amount Paid: $${payment.amount}
Payment Method: ${payment.paymentMethod.toUpperCase()}
Status: ${payment.paymentStatus.toUpperCase()}
Date: ${this.formatDate(payment.paymentDate)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your payment!
        `;
        alert(receipt);
      },
      error: (error) => {
        alert('Error loading receipt: ' + error.message);
      }
    });
  }

  downloadReceipt(id: number): void {
    alert(`Download receipt for payment ID: ${id}\n\nPDF generation would be implemented here.`);
  }

  showRevenueReport(): void {
    this.paymentService.getRevenueReport().subscribe({
      next: (response) => {
        const summary = response.data.summary;
        const report = `
Revenue Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Payments: ${summary.totalPayments}
Total Revenue: $${summary.totalRevenue}

Payment Methods:
${response.data.byPaymentMethod.map((m: any) => 
  `- ${m.paymentMethod.toUpperCase()}: ${m.count} payments ($${m.revenue})`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        alert(report);
      },
      error: (error) => {
        alert('Error loading revenue report: ' + error.message);
      }
    });
  }
}
