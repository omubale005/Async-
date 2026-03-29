import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock Data (simplified for the script)
const mockPatients = [
  { name: "Priya Sharma", age: 32, phone: "+91 98765 43210", email: "priya.sharma@email.com", last_visit: "2026-03-15", address: "123 MG Road, Bangalore, Karnataka", blood_type: "O+", medical_history: ["No allergies", "Regular dental checkups"] },
  { name: "Rajesh Kumar", age: 45, phone: "+91 98765 43211", email: "rajesh.kumar@email.com", last_visit: "2026-03-10", address: "456 Park Street, Kolkata, West Bengal", blood_type: "A+", medical_history: ["Allergic to penicillin", "Diabetic"] },
  { name: "Ananya Reddy", age: 28, phone: "+91 98765 43212", email: "ananya.reddy@email.com", last_visit: "2026-03-08", address: "789 Jubilee Hills, Hyderabad, Telangana", blood_type: "B+", medical_history: ["No known allergies"] },
];

const mockInventory = [
  { name: "Latex Gloves", category: "Consumables", quantity: 450, min_stock: 200, unit: "boxes", last_restocked: "2026-03-01" },
  { name: "Dental Masks", category: "Consumables", quantity: 180, min_stock: 150, unit: "boxes", last_restocked: "2026-03-01" },
  { name: "Composite Filling", category: "Materials", quantity: 45, min_stock: 50, unit: "units", last_restocked: "2026-02-15" },
];

async function seed() {
  console.log("Seeding Supabase...");

  // Seed Patients
  const { data: patients, error: pError } = await supabase.from('patients').insert(mockPatients).select();
  if (pError) console.error("Error seeding patients:", pError);
  else console.log(`Seeded ${patients.length} patients`);

  // Seed Inventory
  const { data: inventory, error: iError } = await supabase.from('inventory').insert(mockInventory).select();
  if (iError) console.error("Error seeding inventory:", iError);
  else console.log(`Seeded ${inventory.length} inventory items`);

  // Seed Appointments (using first patient)
  if (patients && patients.length > 0) {
    const mockAppointments = [
      { patient_id: patients[0].id, patient_name: patients[0].name, date: "2026-03-18", time: "09:00", status: "scheduled", treatment: "Regular Checkup", dentist: "Dr. Anjali Mehta" },
      { patient_id: patients[1].id, patient_name: patients[1].name, date: "2026-03-18", time: "10:30", status: "scheduled", treatment: "Filling Replacement", dentist: "Dr. Anjali Mehta" },
    ];
    const { data: appointments, error: aError } = await supabase.from('appointments').insert(mockAppointments).select();
    if (aError) console.error("Error seeding appointments:", aError);
    else console.log(`Seeded ${appointments.length} appointments`);
  }

  console.log("Seeding complete!");
}

seed();
