export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'doctor' | 'patient';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  consultationFee?: number;
  department?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  department?: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  profilePicture?: string;
  rating: number;
  User?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Patient {
  id: number;
  userId: number;
  patientId: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  medicalHistory?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  insuranceInfo?: string;
  User?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  consultationNotes?: string;
  prescription?: string;
  Doctor?: Doctor;
  Patient?: Patient;
}

export interface Bill {
  id: number;
  billNumber: string;
  appointmentId: number;
  patientId: number;
  consultationFee: number;
  medicineFee: number;
  testFee: number;
  procedureFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'partially_paid' | 'cancelled';
  billDate: string;
  Appointment?: Appointment;
  Patient?: Patient;
}

export interface Payment {
  id: number;
  billId: number;
  patientId: number;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'online_banking' | 'insurance';
  transactionId: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  Bill?: Bill;
  Patient?: Patient;
}
