import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  imports: [CommonModule],
  template: `
    <div class="services-container">
      <div class="container">
        <h1>Our Medical Services</h1>
        <p class="subtitle">Comprehensive healthcare solutions for all your medical needs</p>

        <div class="services-grid">
          @for (service of services; track service.title) {
            <div class="service-card">
              <div class="service-icon">{{ service.icon }}</div>
              <h3>{{ service.title }}</h3>
              <p>{{ service.description }}</p>
              <ul>
                @for (item of service.features; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-container {
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

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .service-card:hover {
      transform: translateY(-5px);
    }

    .service-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .service-card h3 {
      color: #667eea;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .service-card p {
      color: #4a5568;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .service-card ul {
      list-style: none;
      padding: 0;
    }

    .service-card li {
      color: #718096;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .service-card li:last-child {
      border-bottom: none;
    }

    .service-card li:before {
      content: "✓ ";
      color: #48bb78;
      font-weight: bold;
      margin-right: 0.5rem;
    }
  `]
})
export class ServicesComponent {
  services = [
    {
      icon: '❤️',
      title: 'Cardiology',
      description: 'Comprehensive heart care services with advanced diagnostic and treatment options.',
      features: [
        'ECG & Echocardiography',
        'Cardiac Catheterization',
        'Heart Disease Management',
        'Preventive Cardiology'
      ]
    },
    {
      icon: '👶',
      title: 'Pediatrics',
      description: 'Specialized healthcare for infants, children, and adolescents.',
      features: [
        'Well-child Checkups',
        'Immunizations',
        'Growth & Development Monitoring',
        'Pediatric Emergency Care'
      ]
    },
    {
      icon: '🦴',
      title: 'Orthopedics',
      description: 'Expert treatment for bone, joint, and muscle conditions.',
      features: [
        'Joint Replacement Surgery',
        'Sports Medicine',
        'Fracture Care',
        'Physical Therapy'
      ]
    },
    {
      icon: '🧠',
      title: 'Neurology',
      description: 'Advanced care for neurological disorders and conditions.',
      features: [
        'Stroke Treatment',
        'Epilepsy Management',
        'Headache & Migraine Care',
        'Neurological Testing'
      ]
    },
    {
      icon: '🔬',
      title: 'Diagnostic Services',
      description: 'State-of-the-art diagnostic and laboratory facilities.',
      features: [
        'Blood Tests & Pathology',
        'X-Ray & Ultrasound',
        'MRI & CT Scans',
        'Specialized Testing'
      ]
    },
    {
      icon: '🚑',
      title: 'Emergency Care',
      description: '24/7 emergency services for urgent medical situations.',
      features: [
        '24-Hour Emergency Room',
        'Trauma Care',
        'Critical Care Unit',
        'Ambulance Services'
      ]
    }
  ];
}  
//   this.maxFee = null;
//     this.doctors.set(this.allDoctors());
//   }
// }


