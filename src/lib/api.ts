import { supabase } from "./supabase";
import { Patient, Appointment, InventoryItem, Invoice } from "../app/types";

export const apiService = {
  // Patients
  getPatients: async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("name");
    if (error) throw error;
    return { data };
  },

  getPatientById: async (id: string) => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return { data };
  },

  addPatientDocument: async (id: string, document: { name: string; url: string }) => {
    const { data: patient, error: fetchError } = await supabase
      .from("patients")
      .select("documents")
      .eq("id", id)
      .single();
    
    if (fetchError) throw fetchError;

    const updatedDocuments = [...(patient.documents || []), document];
    
    const { data, error } = await supabase
      .from("patients")
      .update({ documents: updatedDocuments })
      .eq("id", id);
    
    if (error) throw error;
    return { data };
  },

  createPatient: async (patientData: any) => {
    const { data, error } = await supabase
      .from("patients")
      .insert([patientData])
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  // Appointments
  getAppointments: async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, patients(*)")
      .order("date", { ascending: true });
    if (error) throw error;

    const formattedData = (data || []).map((apt: any) => ({
      ...apt,
      patientName: apt.patient_name,
      patientId: apt.patient_id
    }));
    return { data: formattedData };
  },

  createAppointment: async (appointmentData: any) => {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  updateAppointment: async (id: string, appointmentData: any) => {
    const { data, error } = await supabase
      .from("appointments")
      .update(appointmentData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  // Dashboard Stats
  getStats: async () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Total Patients
    const { count: totalPatients, error: pError } = await supabase
      .from("patients")
      .select("*", { count: 'exact', head: true });
    
    // Today's Appointments
    const { count: todayAppointments, error: aError } = await supabase
      .from("appointments")
      .select("*", { count: 'exact', head: true })
      .eq("date", today);
    
    // Revenue & Pending
    const { data: invoices, error: iError } = await supabase
      .from("invoices")
      .select("total, paid_amount");
      
    if (pError || aError || iError) throw (pError || aError || iError);

    const revenue = invoices?.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0) || 0;
    const pendingPayments = invoices?.reduce((acc, inv) => acc + (Number(inv.total) - (Number(inv.paid_amount) || 0)), 0) || 0;

    return {
      data: {
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        revenue,
        pendingPayments
      }
    };
  },

  // Inventory
  getInventory: async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name");
    if (error) throw error;
    return { data: data as InventoryItem[] };
  },

  createInventoryItem: async (itemData: any) => {
    const { data, error } = await supabase
      .from("inventory")
      .insert([itemData])
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  updateInventoryItem: async (id: string, itemData: any) => {
    const { data, error } = await supabase
      .from("inventory")
      .update(itemData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  // Invoices
  getInvoices: async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const formattedData = (data || []).map((inv: any) => ({
      ...inv,
      patientName: inv.patient_name,
      patientId: inv.patient_id,
      paidAmount: inv.paid_amount
    }));
    return { data: formattedData };
  },

  createInvoice: async (invoiceData: any) => {
    const { data, error } = await supabase
      .from("invoices")
      .insert([invoiceData])
      .select()
      .single();
    if (error) throw error;
    return { data };
  },
};

export default apiService;
