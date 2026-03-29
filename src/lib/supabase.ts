import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadPatientDocument = async (file: File, patientId: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${patientId}/${Date.now()}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from("patient-documents")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("patient-documents")
    .getPublicUrl(filePath);

  return { publicUrl, fileName: file.name };
};
