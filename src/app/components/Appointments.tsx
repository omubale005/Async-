import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { apiService } from "../../lib/api";
import { Appointment } from "../types";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarUI } from "./ui/calendar";
import { cn } from "./ui/utils";
import { useRole } from "../context/RoleContext";

const treatmentsList = [
  { name: "General Consultation", price: 500, duration: 15 },
  { name: "Teeth Cleaning", price: 1500, duration: 20 },
  { name: "Root Canal", price: 4500, duration: 30 },
  { name: "Tooth Extraction", price: 1000, duration: 25 },
  { name: "Crown Placement", price: 3500, duration: 40 },
  { name: "Orthodontics", price: 8000, duration: 45 },
];

const GAP_TIME = 10; // 10 minutes gap after each treatment

export function Appointments() {
  const { role } = useRole();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"day" | "week">("week");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    patientName: "", 
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    treatment: "",
    price: 0,
    paymentStatus: "unpaid",
    dentist: "Dr. Om",
    age: "",
    gender: "male",
    phone: "",
    email: "",
    address: "",
    medicalHistory: ""
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [aptRes, patientRes] = await Promise.all([
        apiService.getAppointments(),
        apiService.getPatients()
      ]);
      setAppointments(aptRes.data);
      setPatients(patientRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiService.updateAppointment(id, { status });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment status", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAddAppointment = async () => {
    try {
      setLoading(true);
      
      const selectedTreatment = treatmentsList.find(t => t.name === newAppointment.treatment);
      const duration = selectedTreatment ? selectedTreatment.duration : 20;
      
      // Slot Validation Logic
      const newStart = new Date(`${newAppointment.date}T${newAppointment.time}`);
      const newEnd = new Date(newStart.getTime() + (duration + GAP_TIME) * 60000);
      
      const isSlotBusy = appointments.some(apt => {
        if (apt.date !== newAppointment.date || apt.status === "cancelled") return false;
        
        const aptTreatment = treatmentsList.find(t => t.name === apt.treatment);
        const aptDuration = aptTreatment ? aptTreatment.duration : 20;
        const aptStart = new Date(`${apt.date}T${apt.time}`);
        const aptEnd = new Date(aptStart.getTime() + (aptDuration + GAP_TIME) * 60000);
        
        return (newStart < aptEnd && newEnd > aptStart);
      });

      if (isSlotBusy) {
        alert("This time slot is unavailable (including the 10-minute gap). Please choose another time.");
        setLoading(false);
        return;
      }

      let patientIdToUse = newAppointment.patientId;
      let actualPatientName = newAppointment.patientName;

      // If no patientId, it means it's a new patient. Register them first.
      if (!patientIdToUse) {
        const patientData = {
          name: newAppointment.patientName,
          age: parseInt(newAppointment.age) || 0,
          phone: newAppointment.phone,
          email: newAppointment.email,
          address: newAppointment.address,
          medical_history: newAppointment.medicalHistory ? newAppointment.medicalHistory.split(",").map(s => s.trim()).filter(Boolean) : []
        };
        const newPatientRes = await apiService.createPatient(patientData);
        // Depending on API response, get the ID. Usually inside data[0] or data
        const createdPatient = Array.isArray(newPatientRes.data) ? newPatientRes.data[0] : newPatientRes.data;
        patientIdToUse = createdPatient._id || createdPatient.id;
        actualPatientName = createdPatient.name;
      }

      // Create appointment
      const payload = {
        patient_id: patientIdToUse,
        patient_name: actualPatientName,
        date: newAppointment.date,
        time: newAppointment.time,
        treatment: newAppointment.treatment,
        dentist: newAppointment.dentist,
        status: "scheduled"
      };
      await apiService.createAppointment(payload);

      // Also create an associated invoice
      const invoicePayload = {
        patient_id: patientIdToUse,
        patient_name: actualPatientName,
        date: newAppointment.date,
        total: newAppointment.price || 500,
        paid_amount: newAppointment.paymentStatus === "paid" ? (newAppointment.price || 500) : 0,
        status: newAppointment.paymentStatus,
        items: [{
          id: Date.now().toString(),
          treatment: newAppointment.treatment || "General Consultation",
          quantity: 1,
          price: newAppointment.price || 500
        }]
      };
      await apiService.createInvoice(invoicePayload);

      setShowAddDialog(false);
      // Reset form
      setNewAppointment({
        patientId: "", patientName: "", date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00", treatment: "", price: 0, paymentStatus: "unpaid", dentist: "Dr. Om", age: "", gender: "male",
        phone: "", email: "", address: "", medicalHistory: ""
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    const matchedPatient = patients.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (matchedPatient) {
      setNewAppointment({
        ...newAppointment,
        patientName: name,
        patientId: matchedPatient._id || matchedPatient.id,
        age: matchedPatient.age?.toString() || "",
        gender: matchedPatient.gender || "male",
        phone: matchedPatient.phone || "",
        email: matchedPatient.email || "",
        address: matchedPatient.address || "",
        medicalHistory: matchedPatient.medicalHistory ? matchedPatient.medicalHistory.join(", ") : ""
      });
    } else {
      setNewAppointment({
        ...newAppointment,
        patientName: name,
        patientId: "" // Important: clear ID so it gets created
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getActiveDayAppointments = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => apt.date === dateStr && apt.status !== "completed");
  };

  const getAllDayAppointments = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i; // 8 AM to 5 PM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const dayAppointments = getActiveDayAppointments(currentDate);
  const allDayAppointments = getAllDayAppointments(currentDate);
  const weekDates = getWeekDates();

  // Generate 14 days for the date strip
  const dateStripDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and schedule patient appointments
          </p>
        </div>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Total
            </CardTitle>
            <Calendar className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {allDayAppointments.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">appointments scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Scheduled
            </CardTitle>
            <Clock className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {allDayAppointments.filter((a) => a.status === "scheduled").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">pending appointments</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {allDayAppointments.filter((a) => a.status === "completed").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">finished today</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Date Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Weekly Schedule</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                const prevWeek = new Date(currentDate);
                prevWeek.setDate(currentDate.getDate() - 7);
                setCurrentDate(prevWeek);
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                const nextWeek = new Date(currentDate);
                nextWeek.setDate(currentDate.getDate() + 7);
                setCurrentDate(nextWeek);
              }}
            >
              Next Week
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, idx) => {
            const isSelected = format(date, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const dayAppointmentsCount = getAllDayAppointments(date).length;
            
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentDate(date);
                }}
                className={cn(
                  "flex-1 p-4 rounded-2xl border flex flex-col items-center justify-between min-h-[140px] transition-all duration-300",
                  isSelected 
                    ? "bg-blue-50 border-blue-400 shadow-blue-100 shadow-lg scale-105 z-10" 
                    : "bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:bg-white"
                )}
              >
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isSelected ? "text-blue-600" : "text-gray-400"
                )}>
                  {format(date, "EEE")} • {format(date, "MMM")}
                </span>
                <span className={cn(
                  "text-3xl font-black my-2",
                  isSelected ? "text-blue-700 font-bold" : "text-gray-800"
                )}>
                  {format(date, "d")}
                </span>
                <span className={cn(
                  "text-[10px] font-bold",
                  dayAppointmentsCount > 0 
                    ? (isSelected ? "text-blue-500" : "text-blue-600")
                    : "text-gray-400"
                )}>
                  {dayAppointmentsCount > 0 
                    ? `${dayAppointmentsCount} ${dayAppointmentsCount === 1 ? 'Appointment' : 'Appointments'}`
                    : "No appointments"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Daily Schedule (Detail View) */}
      <Card className="border-gray-100 shadow-sm overflow-hidden rounded-3xl mt-8">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Schedule for {format(currentDate, "MMMM d, yyyy")}
            </CardTitle>
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-100 font-bold px-3 py-1">
              {dayAppointments.length} Available Slots
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-gray-500 font-medium">Fetching secure records...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {timeSlots.map((time) => {
                const appointmentsAtTime = dayAppointments.filter(
                  (apt) => apt.time === time
                );

                // Check if this slot is blocked by an appointment overlapping from another time
                const isBlockedByOverlap = appointments.some(apt => {
                  if (apt.date !== format(currentDate, "yyyy-MM-dd") || apt.status === "cancelled") return false;
                  
                  const aptTreatment = treatmentsList.find(t => t.name === apt.treatment);
                  const aptDuration = aptTreatment ? aptTreatment.duration : 20;
                  const aptStart = new Date(`${apt.date}T${apt.time}`);
                  const aptEnd = new Date(aptStart.getTime() + (aptDuration + GAP_TIME) * 60000);
                  
                  const slotStart = new Date(`${apt.date}T${time}`);
                  const slotEnd = new Date(slotStart.getTime() + 15 * 60000); // 15 mins check

                  // Check if slotStart is between aptStart and aptEnd
                  return (slotStart >= aptStart && slotStart < aptEnd) && (apt.time !== time);
                });

                return (
                  <div
                    key={time}
                    className="group flex gap-6 min-h-[90px] hover:bg-blue-50/30 transition-colors px-6 py-4"
                  >
                    <div className="w-24 flex flex-col justify-center">
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {time}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {parseInt(time) >= 12 ? 'PM' : 'AM'} Slot
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      {appointmentsAtTime.length === 0 ? (
                        <div className="h-full flex items-center">
                          {isBlockedByOverlap ? (
                            <div className="flex items-center gap-2 text-red-500 font-medium text-sm bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                              <Clock className="w-4 h-4" />
                              Time slot unavailable (Recovery gap)
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl border border-transparent hover:border-blue-100 group/btn h-10 px-4"
                              onClick={() => {
                                setNewAppointment({
                                  ...newAppointment,
                                  date: format(currentDate, "yyyy-MM-dd"),
                                  time: time
                                });
                                setShowAddDialog(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              <span className="text-sm font-medium">Available for booking</span>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {appointmentsAtTime.map((apt, index) => (
                            <motion.div
                              key={apt._id || apt.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * index }}
                              className={cn(
                                "p-4 rounded-2xl border-l-[6px] shadow-sm flex items-center justify-between group/card hover:shadow-md transition-all cursor-pointer",
                                apt.status === "scheduled" ? "bg-white border-l-blue-500 border-gray-100" :
                                apt.status === "completed" ? "bg-green-50/50 border-l-green-500 border-green-100" :
                                "bg-red-50/50 border-l-red-500 border-red-100"
                              )}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{apt.patientName}</span>
                                  <Badge className={cn("text-[10px] font-bold capitalize px-2 py-0 border-none", getStatusColor(apt.status))}>
                                    {apt.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Badge variant="ghost" className="p-0 h-auto text-blue-600 font-bold">{apt.treatment}</Badge>
                                  </span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="text-gray-400 text-xs">{(apt as any).patients?.phone || "No phone"}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                {(role === "admin" || role === "dentist") && apt.status !== "completed" && (
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(apt._id || apt.id, "completed");
                                    }}
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100">
                                  <Plus className="w-4 h-4 text-gray-400 rotate-45" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>



      {/* New Appointment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient Full Name</label>
              <Input 
                list="patient-names"
                placeholder="Enter patient's full name"
                value={newAppointment.patientName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <datalist id="patient-names">
                {patients.map(p => (
                  <option key={p._id || p.id} value={p.name} />
                ))}
              </datalist>
              {newAppointment.patientId && (
                <p className="text-xs text-green-600">Existing patient found. Details auto-filled.</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input 
                  type="number"
                  placeholder="30"
                  value={newAppointment.age}
                  onChange={(e) => setNewAppointment({...newAppointment, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={newAppointment.gender}
                  onChange={(e) => setNewAppointment({...newAppointment, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  placeholder="+91..."
                  value={newAppointment.phone}
                  onChange={(e) => setNewAppointment({...newAppointment, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email"
                  placeholder="john@example.com"
                  value={newAppointment.email}
                  onChange={(e) => setNewAppointment({...newAppointment, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input 
                placeholder="City, Area..."
                value={newAppointment.address}
                onChange={(e) => setNewAppointment({...newAppointment, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-200",
                        !newAppointment.date && "text-gray-400"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newAppointment.date ? format(new Date(newAppointment.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start" sideOffset={4}>
                    <CalendarUI
                      mode="single"
                      selected={new Date(newAppointment.date)}
                      onSelect={(date) => date && setNewAppointment({...newAppointment, date: format(date, "yyyy-MM-dd")})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium">Time</label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Treatment</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                  value={newAppointment.treatment}
                  onChange={(e) => {
                    const selected = treatmentsList.find(t => t.name === e.target.value);
                    setNewAppointment({
                      ...newAppointment,
                      treatment: e.target.value,
                      price: selected ? selected.price : 0
                    });
                  }}
                >
                  <option value="" disabled>Select treatment</option>
                  {treatmentsList.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input type="number" readOnly value={newAppointment.price} onChange={e => setNewAppointment({...newAppointment, price: Number(e.target.value)})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dentist</label>
                <Input 
                  placeholder="Dr. Smith"
                  value={newAppointment.dentist}
                  onChange={(e) => setNewAppointment({...newAppointment, dentist: e.target.value})}
                />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer relative top-[-10px]">
                  <input type="checkbox" checked={newAppointment.paymentStatus === "paid"} onChange={e => setNewAppointment({...newAppointment, paymentStatus: e.target.checked ? "paid" : "unpaid"})} className="w-4 h-4 rounded border-gray-300" />
                  Mark as Paid (Auto-generates Invoice)
                </label>
              </div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
              onClick={handleAddAppointment}
              disabled={loading || !newAppointment.patientName}
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
