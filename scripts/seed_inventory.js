import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const items = [
    { name: 'Latex Gloves', category: 'Supplies', quantity: 500, min_stock: 100, unit: 'pcs', last_restocked: new Date().toISOString() },
    { name: 'Surgical Masks', category: 'Supplies', quantity: 200, min_stock: 50, unit: 'boxes', last_restocked: new Date().toISOString() },
    { name: 'Dental Mirrors', category: 'Equipment', quantity: 30, min_stock: 10, unit: 'pcs', last_restocked: new Date().toISOString() },
    { name: 'Lidocaine', category: 'Medication', quantity: 50, min_stock: 15, unit: 'vials', last_restocked: new Date().toISOString() },
    { name: 'Cotton Rolls', category: 'Supplies', quantity: 1000, min_stock: 200, unit: 'pcs', last_restocked: new Date().toISOString() },
  ];

  const { error } = await supabase.from('inventory').insert(items);
  if (error) console.error('Error seeding inventory:', error);
  else console.log('Successfully seeded inventory stocks');
}

seed();
