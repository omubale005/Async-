import mongoose from "mongoose";
import dotenv from "dotenv";
import { Patient } from "./models/Patient.js";
import { Appointment } from "./models/Appointment.js";
import { Invoice } from "./models/Invoice.js";
import { Inventory } from "./models/Inventory.js";

dotenv.config();

const mockPatients = [
  {
    name: "Priya Sharma",
    age: 32,
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    lastVisit: "2026-03-15",
    address: "123 MG Road, Bangalore, Karnataka",
    bloodType: "O+",
    medicalHistory: ["No allergies", "Regular dental checkups", "Previous orthodontic treatment"],
  },
  {
    name: "Rajesh Kumar",
    age: 45,
    phone: "+91 98765 43211",
    email: "rajesh.kumar@email.com",
    lastVisit: "2026-03-10",
    address: "456 Park Street, Kolkata, West Bengal",
    bloodType: "A+",
    medicalHistory: ["Allergic to penicillin", "History of gum disease", "Diabetic"],
  },
  {
    name: "Ananya Reddy",
    age: 28,
    phone: "+91 98765 43212",
    email: "ananya.reddy@email.com",
    lastVisit: "2026-03-08",
    address: "789 Jubilee Hills, Hyderabad, Telangana",
    bloodType: "B+",
    medicalHistory: ["No known allergies", "Wisdom teeth removed 2024"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Invoice.deleteMany({});
    await Inventory.deleteMany({});

    // Seed Patients
    const createdPatients = await Patient.insertMany(mockPatients);
    console.log("Patients seeded!");

    // Seed Appointments linked to Patients
    await Appointment.insertMany([
      {
        patientId: createdPatients[0]._id,
        patientName: createdPatients[0].name,
        date: "2026-03-18",
        time: "09:00",
        status: "scheduled",
        treatment: "Regular Checkup",
        dentist: "Dr. Anjali Mehta",
      },
      {
        patientId: createdPatients[1]._id,
        patientName: createdPatients[1].name,
        date: "2026-03-18",
        time: "10:30",
        status: "scheduled",
        treatment: "Filling Replacement",
        dentist: "Dr. Anjali Mehta",
      }
    ]);
    console.log("Appointments seeded!");

    // Seed Inventory
    await Inventory.insertMany([
      {
        name: "Latex Gloves",
        category: "Consumables",
        quantity: 450,
        minStock: 200,
        unit: "boxes",
        lastRestocked: "2026-03-01",
      },
      {
        name: "Dental Masks",
        category: "Consumables",
        quantity: 180,
        minStock: 150,
        unit: "boxes",
        lastRestocked: "2026-03-01",
      }
    ]);
    console.log("Inventory seeded!");

    console.log("Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
