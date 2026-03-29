import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const invoicePayload = {
    patient_id: null,
    patient_name: "Test Patient",
    date: "2026-03-22",
    total: 500,
    paid_amount: 0,
    status: "unpaid",
    items: [{
      id: "123",
      treatment: "General Consultation",
      quantity: 1,
      price: 500
    }]
  };
  
  // authenticate first
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@dentalcare.com', // or omubale116@gmail.com
    password: 'password123' // default pass
  });
  if (authErr) console.error("Auth Error:", authErr);

  const { data, error } = await supabase.from('invoices').insert([invoicePayload]).select().single();
  console.log("Invoice Insert Error:", error);
}

test();
