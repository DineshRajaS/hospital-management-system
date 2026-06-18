import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  template: `
    <div class="about-container">
      <div class="container">
        <h1>About Get Well Soon Hospital</h1>

        <section class="about-section">
          <h2>Our History</h2>
          <p>
            Get Well Soon Hospital was established in 2010 with a vision to provide world-class healthcare 
            services to our community. Over the past 15 years, we have grown from a small clinic to a 
            comprehensive healthcare facility serving thousands of patients annually.
          </p>
        </section>

        <section class="about-section">
          <h2>Our Vision</h2>
          <p>
            To be the leading healthcare provider in the region, known for exceptional patient care, 
            medical excellence, and innovative treatment approaches.
          </p>
        </section>

        <section class="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to deliver compassionate, accessible, and high-quality healthcare services 
            to all members of our community. We are committed to:
          </p>
          <ul>
            <li>Providing patient-centered care with dignity and respect</li>
            <li>Maintaining the highest standards of medical excellence</li>
            <li>Fostering a culture of continuous improvement and innovation</li>
            <li>Supporting our community through health education and outreach programs</li>
          </ul>
        </section>

        <section class="about-section">
          <h2>Core Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <h3>🤝 Compassion</h3>
              <p>We treat every patient with empathy, kindness, and understanding.</p>
            </div>
            <div class="value-card">
              <h3>🎯 Excellence</h3>
              <p>We strive for the highest standards in medical care and service delivery.</p>
            </div>
            <div class="value-card">
              <h3>🔬 Innovation</h3>
              <p>We embrace new technologies and treatment methods to improve patient outcomes.</p>
            </div>
            <div class="value-card">
              <h3>🤲 Integrity</h3>
              <p>We operate with honesty, transparency, and ethical principles.</p>
            </div>
          </div>
        </section>

        <section class="about-section">
          <h2>Accreditations & Certifications</h2>
          <ul>
            <li>Joint Commission International (JCI) Accreditation</li>
            <li>ISO 9001:2015 Quality Management Certification</li>
            <li>National Board of Healthcare Accreditation</li>
            <li>Green Hospital Certification</li>
          </ul>
        </section>

        <section class="about-section">
          <h2>Awards & Achievements</h2>
          <ul>
            <li>Best Healthcare Provider Award 2024</li>
            <li>Excellence in Patient Care Award 2023</li>
            <li>Top 50 Hospitals in the Region 2022</li>
            <li>Community Service Recognition Award 2021</li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      padding: 2rem 0;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }

    h1 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 3rem;
      font-size: 2.5rem;
    }

    .about-section {
      margin-bottom: 3rem;
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
      color: #667eea;
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    p {
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    ul {
      color: #4a5568;
      line-height: 1.8;
      padding-left: 2rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .value-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .value-card h3 {
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }

    .value-card p {
      color: #718096;
      margin: 0;
      font-size: 0.95rem;
    }
  `]
})
export class AboutComponent {}
