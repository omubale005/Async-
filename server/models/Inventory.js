import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  minStock: { type: Number, required: true },
  unit: { type: String, required: true },
  lastRestocked: { type: String }
}, { timestamps: true });

export const Inventory = mongoose.model("Inventory", inventorySchema);
