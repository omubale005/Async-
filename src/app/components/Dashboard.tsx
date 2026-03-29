import { useEffect, useState } from "react";
import { Calendar, DollarSign, Users, Clock, Plus, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { apiService } from "../../lib/api";
import { useRole } from "../context/RoleContext";
import { Appointment, Patient } from "../types";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    revenue: 0,
    pendingPayments: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aptRes, patientRes] = await Promise.all([
          apiService.getStats(),
          apiService.getAppointments(),
          apiService.getPatients()
        ]);
        setStats(statsRes.data);
        setAppointments(aptRes.data.filter((a: Appointment) => a.date === today));
        setRecentPatients(patientRes.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [today]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiService.updateAppointment(id, { status });
      setAppointments(appointments.map(apt => 
        (apt._id === id || apt.id === id) ? { ...apt, status: status as "scheduled" | "completed" | "cancelled" } as Appointment : apt
      ));
    } catch (err) {
      console.error("Failed to update appointment status", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          {role !== "admin" && (
            <>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate("/patients")}
              >
                <Plus className="w-4 h-4" />
                Add Patient
              </Button>
              <Button 
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/appointments")}
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Appointments
              </CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.todayAppointments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {appointments.filter((a) => a.status === "scheduled").length} scheduled
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Patients
              </CardTitle>
              <Users className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</div>
              <p className="text-xs text-gray-500 mt-1">Active patients</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenue (This Month)
              </CardTitle>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                ₹{stats.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">March 2026</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payments
              </CardTitle>
              <FileText className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">
                ₹{stats.pendingPayments.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">To be collected</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
            <p className="text-sm text-gray-500">
              {new Date(today).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled for today
                </div>
              ) : (
                appointments.map((appointment, index) => (
                  <motion.div
                    key={appointment._id || appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-400 mb-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.time}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.patientName}
                        </div>
                        <div className="text-sm text-gray-500">{appointment.treatment}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          with {appointment.dentist}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)} variant="secondary">
                        {appointment.status}
                      </Badge>
                      {(role === "admin" || role === "dentist" || role === "receptionist") && appointment.status !== "completed" && appointment.status !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
                          onClick={() => handleUpdateStatus(appointment._id || appointment.id as string, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => navigate("/patients")}
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">New Patient</div>
                <div className="text-xs text-gray-500">Register a patient</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => navigate("/appointments")}
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Book Appointment</div>
                <div className="text-xs text-gray-500">Schedule a visit</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={() => navigate("/revenue")}
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">View Revenue</div>
                <div className="text-xs text-gray-500">Monitor payments</div>
              </div>
            </Button>

            {role === "admin" && (
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Manage Staff</div>
                  <div className="text-xs text-gray-500">View team members</div>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPatients.map((patient, index) => (
              <motion.div
                key={patient._id || patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      Last visit:{" "}
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) : "N/A"}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/patients")}
                >
                  View Profile
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}