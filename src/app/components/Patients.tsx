import { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Loader2,
  Upload,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { supabase } from "../../lib/supabase"; // Added this import based on the provided snippet
import { apiService } from "../../lib/api";
import { uploadPatientDocument } from "../../lib/supabase";
import { Patient } from "../types";
import { motion } from "motion/react";
import { useRole } from "../context/RoleContext";

export function Patients() {
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    medicalHistory: ""
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = async () => {
    try {
      if (!newPatient.name.trim() || !newPatient.age || !newPatient.phone.trim()) {
        alert("Please fill in required fields (Name, Age, Phone)");
        return;
      }
      setLoading(true);
      const patientData = {
        name: newPatient.name,
        age: parseInt(newPatient.age) || 0,
        phone: newPatient.phone,
        email: newPatient.email,
        address: newPatient.address,
        medical_history: newPatient.medicalHistory.split(",").map(s => s.trim()).filter(s => s !== "")
      };
      await apiService.createPatient(patientData);
      setShowAddDialog(false);
      setNewPatient({ name: "", age: "", gender: "male", phone: "", email: "", address: "", medicalHistory: "" });
      fetchPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatient) return;

    setUploading(true);
    try {
      const { publicUrl, fileName } = await uploadPatientDocument(file, selectedPatient._id || selectedPatient.id);
      await apiService.addPatientDocument(selectedPatient._id || selectedPatient.id, {
        name: fileName,
        url: publicUrl,
      });
      // Refresh patient data
      const updatedPatient = await apiService.getPatientById(selectedPatient._id || selectedPatient.id);
      setSelectedPatient(updatedPatient.data);
      fetchPatients();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all patient records
          </p>
        </div>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
              placeholder="Search patients..."
              className="pl-9 bg-gray-50 border-gray-200 focus:ring-blue-600 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">
            All Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => (
                    <motion.tr
                      key={patient._id || patient.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {patient.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {patient.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{patient.age}</TableCell>
                      <TableCell className="text-gray-600">{patient.phone}</TableCell>
                      <TableCell className="text-gray-600">{patient.email}</TableCell>
                      <TableCell className="text-gray-600">
                        {patient.lastVisit || (patient as any).last_visit ? new Date(patient.lastVisit || (patient as any).last_visit).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(patient);
                          }}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input 
                  type="number" 
                  placeholder="30"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input 
                placeholder="+91 9876543210"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="john@example.com"
                value={newPatient.email}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input 
                placeholder="Clinic Street, City"
                value={newPatient.address}
                onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Medical History (comma separated)</label>
              <Input 
                placeholder="Diabetes, Hypertension"
                value={newPatient.medicalHistory}
                onChange={(e) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
              />
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
              onClick={handleAddPatient}
              disabled={loading}
            >
              {loading ? "Adding..." : "Register Patient"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Patient Profile Overlay */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col p-6 overflow-y-auto ml-16">
          <div className="max-w-5xl mx-auto w-full space-y-6 pb-12">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedPatient(null);
                }}
                className="gap-2"
              >
                &larr; Back to Patients
              </Button>
              <div className="flex gap-2">
                {role === "dentist" && (
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Medical Records
                  </Button>
                )}
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Book Appointment
                </Button>
              </div>
            </div>

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl shadow-blue-50/50 p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                  <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300"
                    >
                      <span className="text-white text-5xl font-bold italic">
                        {selectedPatient.name.charAt(0)}
                      </span>
                    </motion.div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                          {selectedPatient.name}
                        </h2>
                        <div className="flex gap-2">
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Active Patient
                          </Badge>
                          <Badge variant="outline" className="border-blue-200 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {(selectedPatient as any).age} Yrs
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                            <Phone className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Phone</div>
                            <div className="text-sm font-semibold text-gray-700">{selectedPatient.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                            <Mail className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Email</div>
                            <div className="text-sm font-semibold text-gray-700">{selectedPatient.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                            <Calendar className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Last Visit</div>
                            <div className="text-sm font-semibold text-gray-700">
                              {selectedPatient.lastVisit || (selectedPatient as any).last_visit ? new Date(selectedPatient.lastVisit || (selectedPatient as any).last_visit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Personal & Medical History */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden">
                      <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                          Medical Profile & Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Blood Type</div>
                          <div className="text-xl font-bold text-gray-900">{selectedPatient.bloodType || (selectedPatient as any).blood_type || "O+"}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Gender</div>
                          <div className="text-xl font-bold text-gray-900 capitalize">{selectedPatient.gender || "Not specified"}</div>
                        </div>
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Residential Address</div>
                          <div className="text-base font-medium text-gray-800">{selectedPatient.address}</div>
                        </div>
                        
                        <div className="sm:col-span-2 pt-2">
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Allergies & Medical History</div>
                          <div className="flex flex-wrap gap-2">
                            {((selectedPatient.medicalHistory || (selectedPatient as any).medical_history) || []).map((item: any, index: number) => (
                              <Badge key={index} className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors">
                                {item}
                              </Badge>
                            ))}
                            {(!selectedPatient.medicalHistory || selectedPatient.medicalHistory.length === 0) && (
                              <span className="text-sm text-gray-400 italic">No history recorded</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden">
                      <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                          Appointment Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 px-8">
                        <div className="relative space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-600 before:via-blue-200 before:to-transparent">
                          <div className="relative pl-10">
                            <div className="absolute left-0 top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg ring-4 ring-blue-50"></div>
                            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-bold text-gray-900">General Checkup</h4>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">latest</span>
                              </div>
                              <div className="text-sm text-gray-500 font-medium italic">
                                {selectedPatient.lastVisit || (selectedPatient as any).last_visit ? new Date(selectedPatient.lastVisit || (selectedPatient as any).last_visit).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently"}
                              </div>
                              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                                Routine dental examination completed. No major issues found. Teeth and gums are in stable condition.
                              </p>
                            </div>
                          </div>

                          <div className="relative pl-10">
                            <div className="absolute left-0 top-1 w-6 h-6 bg-gray-200 rounded-full border-4 border-white shadow-sm ring-4 ring-gray-50"></div>
                            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                              <h4 className="text-lg font-bold text-gray-800">Scaling & Polishing</h4>
                              <div className="text-sm text-gray-400 font-medium italic">February 12, 2026</div>
                              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                                Professional cleaning procedure performed. Patient reported sensitivity in upper right molar.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Documents */}
                  <div className="space-y-6">
                    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden sticky top-8">
                      <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                          Documents
                        </CardTitle>
                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full" 
                          onClick={() => fileInputRef.current?.click()} 
                          disabled={uploading}
                        >
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {selectedPatient.documents && selectedPatient.documents.length > 0 ? (
                            selectedPatient.documents.map((doc, idx) => (
                              <motion.div 
                                key={idx} 
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                              >
                                <div className="flex items-center gap-4 overflow-hidden">
                                  <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                                    <FileText className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-gray-900 truncate">{doc.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">PDF Document</div>
                                  </div>
                                </div>
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                              <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Upload className="w-8 h-8 text-gray-200" />
                              </div>
                              <h5 className="text-sm font-bold text-gray-500 mb-1">Upload Records</h5>
                              <p className="text-xs text-gray-400">X-rays, prescriptions, and reports</p>
                            </div>
                          )}
                        </div>
                        
                        <Button className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl h-14 font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Book New Appointment
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
