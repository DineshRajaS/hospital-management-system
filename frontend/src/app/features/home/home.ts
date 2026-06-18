import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <h1>Welcome to Get Well Soon Hospital</h1>
          <p class="hero-subtitle">Your Health, Our Priority - Providing Excellence in Healthcare</p>
          
          @if (!authService.isAuthenticated()) {
            <div class="hero-actions">
              <a routerLink="/register" class="btn btn-primary btn-large">Get Started</a>
              <a routerLink="/doctors" class="btn btn-secondary btn-large">Find a Doctor</a>
            </div>
          } @else {
            <div class="hero-actions">
              <a routerLink="/doctors" class="btn btn-primary btn-large">Book Appointment</a>
              <a routerLink="/appointments" class="btn btn-secondary btn-large">My Appointments</a>
            </div>
          }
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👨‍⚕️</div>
              <h3>150+</h3>
              <p>Expert Doctors</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏥</div>
              <h3>25+</h3>
              <p>Departments</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon">😊</div>
              <h3>50K+</h3>
              <p>Happy Patients</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <h3>15+</h3>
              <p>Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <h2>Why Choose Us</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⚕️</div>
              <h3>Expert Medical Team</h3>
              <p>Highly qualified doctors with years of experience in their specializations.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏥</div>
              <h3>Modern Facilities</h3>
              <p>State-of-the-art medical equipment and comfortable patient rooms.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🕒</div>
              <h3>24/7 Emergency</h3>
              <p>Round-the-clock emergency services ready to help you anytime.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💊</div>
              <h3>Comprehensive Care</h3>
              <p>Complete healthcare solutions from diagnosis to treatment and recovery.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta">
        <div class="container">
          <h2>Ready to Get Started?</h2>
          <p>Book your appointment today and experience quality healthcare.</p>
          <a routerLink="/doctors" class="btn btn-primary btn-large">Book Appointment Now</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      margin-top: -1rem;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .stats {
      padding: 4rem 2rem;
      background: #f7fafc;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-card {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .stat-card h3 {
      font-size: 2.5rem;
      color: #667eea;
      margin: 0.5rem 0;
    }

    .features {
      padding: 4rem 2rem;
    }

    .features h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #2d3748;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: #667eea;
      margin-bottom: 1rem;
    }

    .cta {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }

    .cta h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
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
      background: white;
      color: #667eea;
    }

    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid white;
    }
  `]
})
export class HomeComponent {
  authService = inject(AuthService);
}
