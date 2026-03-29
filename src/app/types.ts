export type UserRole = "dentist" | "receptionist" | "admin";

export interface Patient {
  _id?: string;
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  medicalHistory: string[];
  address: string;
  bloodType?: string;
  documents?: { name: string; url: string; uploadedAt: string }[];
  gender?: string;
}

export interface Appointment {
  _id?: string;
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  treatment: string;
  dentist: string;
}

export interface ToothCondition {
  toothNumber: number;
  conditions: ("healthy" | "cavity" | "filling" | "crown" | "missing" | "root-canal")[];
  notes?: string;
}

export interface Invoice {
  _id?: string;
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  status: "paid" | "unpaid" | "partial";
  paidAmount?: number;
}

export interface InvoiceItem {
  _id?: string;
  id: string;
  treatment: string;
  quantity: number;
  price: number;
}

export interface InventoryItem {
  _id?: string;
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  lastRestocked: string;
}
