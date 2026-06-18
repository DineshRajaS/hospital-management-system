import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contact-container">
      <div class="container">
        <h1>Contact Us</h1>
        <p class="subtitle">Get in touch with us for any inquiries or assistance</p>

        <div class="contact-content">
          <div class="contact-info">
            <h2>Contact Information</h2>
            
            <div class="info-item">
              <div class="info-icon">📍</div>
              <div>
                <h3>Address</h3>
                <p>123 Healthcare Avenue<br>Medical City, MC 12345</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>Main: +1 (555) 123-4567<br>Emergency: +1 (555) 911-0000</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">✉️</div>
              <div>
                <h3>Email</h3>
                <p>info@getwellsoon.com<br>appointments@getwellsoon.com</p>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">🕒</div>
              <div>
                <h3>Operating Hours</h3>
                <p>Mon-Fri: 9:00 AM - 5:00 PM<br>
                Sat: 10:00 AM - 3:00 PM<br>
                Sun: Closed<br>
                Emergency: 24/7</p>
              </div>
            </div>
          </div>

          <div class="contact-form-section">
            <h2>Send us a Message</h2>

            @if (successMessage()) {
              <div class="alert alert-success">{{ successMessage() }}</div>
            }

            @if (errorMessage()) {
              <div class="alert alert-error">{{ errorMessage() }}</div>
            }

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="name">Your Name *</label>
                <input 
                  id="name"
                  type="text" 
                  formControlName="name"
                  placeholder="Enter your full name"
                />
                @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                  <span class="error-text">Name is required</span>
                }
              </div>

              <div class="form-group">
                <label for="email">Your Email *</label>
                <input 
                  id="email"
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email"
                />
                @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                  <span class="error-text">Valid email is required</span>
                }
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input 
                  id="phone"
                  type="tel" 
                  formControlName="phone"
                  placeholder="Enter your phone number"
                />
              </div>

              <div class="form-group">
                <label for="subject">Subject *</label>
                <input 
                  id="subject"
                  type="text" 
                  formControlName="subject"
                  placeholder="Message subject"
                />
                @if (contactForm.get('subject')?.invalid && contactForm.get('subject')?.touched) {
                  <span class="error-text">Subject is required</span>
                }
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea 
                  id="message"
                  formControlName="message"
                  rows="5"
                  placeholder="Type your message here..."
                ></textarea>
                @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                  <span class="error-text">Message is required</span>
                }
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-block"
                [disabled]="contactForm.invalid || loading()"
              >
                {{ loading() ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-container {
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
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
    }

    .subtitle {
      text-align: center;
      color: #718096;
      margin-bottom: 3rem;
      font-size: 1.2rem;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }

    @media (max-width: 768px) {
      .contact-content {
        grid-template-columns: 1fr;
      }
    }

    .contact-info {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .contact-info h2 {
      color: #667eea;
      margin-bottom: 2rem;
    }

    .info-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .info-icon {
      font-size: 2rem;
      min-width: 50px;
    }

    .info-item h3 {
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .info-item p {
      color: #718096;
      line-height: 1.6;
      margin: 0;
    }

    .contact-form-section {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .contact-form-section h2 {
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

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2d3748;
    }

    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      font-family: inherit;
    }

    .error-text {
      color: #c33;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.25rem;
    }

    .btn-block {
      width: 100%;
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
  `]
})
export class ContactComponent {
  private fb = inject(FormBuilder);

  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      // Simulate form submission
      setTimeout(() => {
        this.loading.set(false);
        this.successMessage.set('Thank you for contacting us! We will get back to you soon.');
        this.contactForm.reset();
      }, 1500);
    }
  }
}
