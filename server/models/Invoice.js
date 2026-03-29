import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Format: INV-XXX
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  items: [{
    treatment: { type: String },
    quantity: { type: Number },
    price: { type: Number }
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

export const Invoice = mongoose.model("Invoice", invoiceSchema);
