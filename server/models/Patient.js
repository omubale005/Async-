import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  lastVisit: { type: String },
  address: { type: String },
  bloodType: { type: String },
  medicalHistory: [{ type: String }],
  documents: [{
    name: { type: String },
    url: { type: String },
    date: { type: Date, default: Date.now }
  }],
  dentalChart: [{
    toothNumber: { type: Number },
    conditions: [{ type: String }],
    notes: { type: String }
  }]
}, { timestamps: true });

export const Patient = mongoose.model("Patient", patientSchema);
