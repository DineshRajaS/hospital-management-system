import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>🏥 Get Well Soon Hospital</h3>
            <p>Providing quality healthcare services with compassion and excellence.</p>
          </div>

          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/services">Services</a></li>
              <li><a routerLink="/doctors">Doctors</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Contact Information</h4>
            <p>📍 123 Healthcare Avenue, Medical City, MC 12345</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ info@getwellsoon.com</p>
            <p>🚨 Emergency: +1 (555) 911-0000</p>
          </div>

          <div class="footer-section">
            <h4>Operating Hours</h4>
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p>Saturday: 10:00 AM - 3:00 PM</p>
            <p>Sunday: Closed</p>
            <p>Emergency: 24/7</p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2025 Get Well Soon Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2d3748;
      color: white;
      padding: 3rem 0 1rem;
      margin-top: 4rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3 {
      margin-bottom: 1rem;
      color: #667eea;
    }

    .footer-section h4 {
      margin-bottom: 1rem;
      color: #a0aec0;
    }

    .footer-section p {
      margin: 0.5rem 0;
      color: #cbd5e0;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin: 0.5rem 0;
    }

    .footer-section a {
      color: #cbd5e0;
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-section a:hover {
      color: #667eea;
    }

    .footer-bottom {
      border-top: 1px solid #4a5568;
      padding-top: 1rem;
      text-align: center;
      color: #a0aec0;
    }
  `]
})
export class FooterComponent {}
