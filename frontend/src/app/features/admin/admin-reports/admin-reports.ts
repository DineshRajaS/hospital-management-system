import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../../../core/services/bill';
import { PaymentService } from '../../../core/services/payment';
import { AppointmentService } from '../../../core/services/appointment';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <div class="container">
        <h1>Reports & Analytics</h1>

        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-content">
              <h3>\${{ totalRevenue() }}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📋</div>
            <div class="metric-content">
              <h3>{{ totalBills() }}</h3>
              <p>Total Bills</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-content">
              <h3>{{ paidBills() }}</h3>
              <p>Paid Bills</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">⏳</div>
            <div class="metric-content">
              <h3>{{ pendingBills() }}</h3>
              <p>Pending Bills</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">📅</div>
            <div class="metric-content">
              <h3>{{ totalAppointments() }}</h3>
              <p>Total Appointments</p>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">✔️</div>
            <div class="metric-content">
              <h3>{{ completedAppointments() }}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <!-- Revenue Breakdown -->
        <div class="report-section">
          <h2>Revenue Breakdown</h2>
          <div class="breakdown-grid">
            <div class="breakdown-card">
              <h4>Consultation Revenue</h4>
              <p class="amount">\${{ consultationRevenue() }}</p>
            </div>
            <div class="breakdown-card">
              <h4>Medicine Revenue</h4>
              <p class="amount">\${{ medicineRevenue() }}</p>
            </div>
            <div class="breakdown-card">
              <h4>Test Revenue</h4>
              <p class="amount">\${{ testRevenue() }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="report-section">
          <h2>Payment Methods Distribution</h2>
          @if (paymentMethods().length > 0) {
            <div class="methods-grid">
              @for (method of paymentMethods(); track method.method) {
                <div class="method-card">
                  <h4>{{ method.method | uppercase }}</h4>
                  <p class="count">{{ method.count }} payments</p>
                  <p class="amount">\${{ method.revenue }}</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem 0;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 2rem;
    }

    h2 {
      color: #2d3748;
      margin-bottom: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .metric-icon {
      font-size: 2.5rem;
    }

    .metric-content h3 {
      color: #667eea;
      font-size: 2rem;
      margin: 0 0 0.25rem 0;
    }

    .metric-content p {
      color: #718096;
      margin: 0;
      font-size: 0.9rem;
    }

    .report-section {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .breakdown-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .breakdown-card h4 {
      color: #4a5568;
      margin-bottom: 1rem;
    }

    .breakdown-card .amount {
      color: #48bb78;
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
    }

    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .method-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .method-card h4 {
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .method-card .count {
      color: #718096;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    .method-card .amount {
      color: #48bb78;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  private billService = inject(BillService);
  private paymentService = inject(PaymentService);
  private appointmentService = inject(AppointmentService);

  totalRevenue = signal(0);
  totalBills = signal(0);
  paidBills = signal(0);
  pendingBills = signal(0);
  consultationRevenue = signal(0);
  medicineRevenue = signal(0);
  testRevenue = signal(0);
  totalAppointments = signal(0);
  completedAppointments = signal(0);
  paymentMethods = signal<any[]>([]);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    // Load billing summary
    this.billService.getBillingSummary().subscribe({
      next: (response) => {
        this.totalRevenue.set(response.data.totalRevenue || 0);
        this.totalBills.set(response.data.totalBills || 0);
        this.paidBills.set(response.data.paidBills || 0);
        this.pendingBills.set(response.data.pendingBills || 0);
        this.consultationRevenue.set(response.data.consultationRevenue || 0);
        this.medicineRevenue.set(response.data.medicineRevenue || 0);
        this.testRevenue.set(response.data.testRevenue || 0);
      }
    });

    // Load payment report
    this.paymentService.getRevenueReport().subscribe({
      next: (response) => {
        this.paymentMethods.set(response.data.byPaymentMethod || []);
      }
    });

    // Load appointments
    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.totalAppointments.set(response.data.length);
        this.completedAppointments.set(
          response.data.filter((a: any) => a.status === 'completed').length
        );
      }
    });
  }
}
