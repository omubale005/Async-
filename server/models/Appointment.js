import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:mm
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  treatment: { type: String, required: true },
  dentist: { type: String, required: true }
}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
