import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillService } from '../../../core/services/bill';
import { PaymentService } from '../../../core/services/payment';
import { AuthService } from '../../../core/services/auth';
import { Bill } from '../../../core/models/interfaces';

@Component({
  selector: 'app-bill-list',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bills-container">
      <div class="container">
        <h1>My Bills</h1>

        @if (loading()) {
          <div class="loading">Loading bills...</div>
        } @else if (bills().length === 0) {
          <div class="no-data">
            <p>No bills found.</p>
          </div>
        } @else {
          <div class="bills-list">
            @for (bill of bills(); track bill.id) {
              <div class="bill-card" [class]="'status-' + bill.status">
                <div class="bill-header">
                  <div>
                    <h3>Bill #{{ bill.billNumber }}</h3>
                    <p class="bill-date">{{ formatDate(bill.billDate) }}</p>
                  </div>
                  <div class="status-badge" [class]="'badge-' + bill.status">
                    {{ bill.status }}
                  </div>
                </div>

                <div class="bill-body">
                  <div class="bill-details">
                    <div class="detail-row">
                      <span class="label">Doctor:</span>
                      <span class="value">{{ bill.Appointment?.Doctor?.User?.name }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Specialization:</span>
                      <span class="value">{{ bill.Appointment?.Doctor?.specialization }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Appointment Date:</span>
                      <span class="value">{{ formatDate(bill.Appointment?.appointmentDate) }}</span>
                    </div>
                  </div>

                  <div class="bill-breakdown">
                    <h4>Bill Breakdown</h4>
                    <div class="breakdown-row">
                      <span>Consultation Fee:</span>
                      <span>\${{ bill.consultationFee }}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Medicine Fee:</span>
                      <span>\${{ bill.medicineFee }}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Test Fee:</span>
                      <span>\${{ bill.testFee }}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Procedure Fee:</span>
                      <span>\${{ bill.procedureFee }}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Tax:</span>
                      <span>\${{ bill.tax }}</span>
                    </div>
                    @if (bill.discount > 0) {
                      <div class="breakdown-row discount">
                        <span>Discount:</span>
                        <span>-\${{ bill.discount }}</span>
                      </div>
                    }
                    <div class="breakdown-row total">
                      <span>Total Amount:</span>
                      <span>\${{ bill.totalAmount }}</span>
                    </div>
                  </div>
                </div>

                <div class="bill-actions">
                  @if (bill.status === 'pending') {
                    <button 
                      class="btn btn-primary"
                      (click)="initiatePayment(bill.id)"
                      [disabled]="paying() === bill.id"
                    >
                      {{ paying() === bill.id ? 'Processing...' : 'Pay Now' }}
                    </button>
                  }
                  <button class="btn btn-secondary" (click)="downloadBill(bill.id)">
                    Download PDF
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bills-container {
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

    .loading, .no-data {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    .bills-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .bill-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }

    .bill-card.status-paid {
      border-left-color: #48bb78;
    }

    .bill-card.status-pending {
      border-left-color: #ed8936;
    }

    .bill-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .bill-header h3 {
      color: #2d3748;
      margin-bottom: 0.25rem;
    }

    .bill-date {
      color: #718096;
      font-size: 0.9rem;
      margin: 0;
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

    .bill-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .bill-body {
        grid-template-columns: 1fr;
      }
    }

    .bill-details .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .detail-row .label {
      font-weight: 600;
      color: #4a5568;
    }

    .detail-row .value {
      color: #2d3748;
    }

    .bill-breakdown {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
    }

    .bill-breakdown h4 {
      color: #2d3748;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding: 0.25rem 0;
      color: #4a5568;
    }

    .breakdown-row.discount {
      color: #48bb78;
    }

    .breakdown-row.total {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 2px solid #e2e8f0;
      font-weight: 700;
      font-size: 1.1rem;
      color: #667eea;
    }

    .bill-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn:not(:disabled):hover {
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
export class BillListComponent implements OnInit {
  private billService = inject(BillService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);

  bills = signal<Bill[]>([]);
  loading = signal(false);
  paying = signal<number | null>(null);

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading.set(true);
    this.billService.getMyBills().subscribe({
      next: (response) => {
        this.bills.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading bills:', error);
        this.loading.set(false);
      }
    });
  }

  // formatDate(dateString: string): string {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', { 
  //     year: 'numeric', 
  //     month: 'long', 
  //     day: 'numeric' 
  //   });
  // }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A'; // fallback if undefined or null
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  initiatePayment(billId: number): void {
    const paymentMethod = prompt('Enter payment method (cash/card/upi/online_banking/insurance):');
    
    if (!paymentMethod) return;

    this.paying.set(billId);

    this.paymentService.initiatePayment({
      billId,
      paymentMethod
    }).subscribe({
      next: (response) => {
        this.paying.set(null);
        alert('Payment successful! Transaction ID: ' + response.data.transactionId);
        this.loadBills();
      },
      error: (error) => {
        this.paying.set(null);
        alert('Payment failed: ' + error.message);
      }
    });
  }

  downloadBill(billId: number): void {
    alert('PDF download functionality would be implemented here');
  }
}
