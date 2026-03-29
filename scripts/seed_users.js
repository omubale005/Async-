import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedUsers() {
    const users = [
        {
            email: 'admin@async.com',
            password: 'Admin@123',
            role: 'admin',
            full_name: 'Admin User'
        },
        {
            email: 'receptionist@async.com',
            password: 'Recep@123',
            role: 'receptionist',
            full_name: 'Sneha Kapoor'
        },
        {
            email: 'dentist@async.com',
            password: 'Dentist@123',
            role: 'dentist',
            full_name: 'Dr. Om'
        }
    ];

    console.log('Seeding users...');

    for (const u of users) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { 
                role: u.role, 
                full_name: u.full_name 
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log(`User ${u.email} already exists.`);
            } else {
                console.error(`Error creating user ${u.email}:`, error.message);
            }
        } else {
            console.log(`User ${u.email} created successfully with role ${u.role}.`);
        }
    }

    console.log('Done.');
}

seedUsers();
