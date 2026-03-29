import express from "express";
import { Patient } from "../models/Patient.js";
import { Appointment } from "../models/Appointment.js";
import { Invoice } from "../models/Invoice.js";
import { Inventory } from "../models/Inventory.js";

const router = express.Router();

// --- PATIENTS ---
router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/patients", async (req, res) => {
  const patient = new Patient(req.body);
  try {
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/patients/:id/documents", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    
    patient.documents.push(req.body);
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- APPOINTMENTS ---
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("patientId");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/appointments", async (req, res) => {
  const appointment = new Appointment(req.body);
  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/appointments/:id", async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DASHBOARD STATS ---
router.get("/stats", async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const appointments = await Appointment.find({
      date: new Date().toISOString().split("T")[0]
    });
    
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const pendingPayments = invoices.reduce((acc, inv) => acc + (inv.total - (inv.paidAmount || 0)), 0);

    res.json({
      totalPatients,
      todayAppointments: appointments.length,
      revenue: totalRevenue,
      pendingPayments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INVENTORY ---
router.get("/inventory", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INVOICES ---
router.get("/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/invoices", async (req, res) => {
  const invoice = new Invoice(req.body);
  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
