import { useEffect, useState } from "react";
import { Download, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import { useRole } from "../context/RoleContext";
import { Navigate } from "react-router-dom";
import { apiService } from "../../lib/api";

export function Reports() {
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenueData: [] as any[],
    patientVisitsData: [] as any[],
    treatmentData: [] as any[],
    appointmentStatusData: [] as any[],
    metrics: {
      totalRevenue: 0,
      totalPatients: 0,
      avgRevenue: 0,
      completionRate: 0,
      newPatients: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, appointmentsRes, invoicesRes] = await Promise.all([
          apiService.getPatients(),
          apiService.getAppointments(),
          apiService.getInvoices()
        ]);

        const patients = patientsRes.data;
        const appointments = appointmentsRes.data;
        const invoices = invoicesRes.data;

        // Calculate Revenue Trend (Monthly)
        const monthlyRevenue: Record<string, number> = {};
        invoices.forEach((inv: any) => {
          const date = new Date(inv.date);
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (inv.paidAmount || inv.paid_amount || 0);
        });
        const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

        // Treatment Distribution
        const treatments: Record<string, number> = {};
        appointments.forEach((apt: any) => {
          if (apt.status === "completed") {
            treatments[apt.treatment] = (treatments[apt.treatment] || 0) + 1;
          }
        });
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899"];
        const treatmentData = Object.entries(treatments).map(([name, value], idx) => ({ 
          name, 
          value, 
          color: colors[idx % colors.length] 
        }));

        // Appointment Status
        const statusCounts = {
          Completed: appointments.filter((a: any) => a.status === "completed").length,
          Scheduled: appointments.filter((a: any) => a.status === "scheduled").length,
          Cancelled: appointments.filter((a: any) => a.status === "cancelled").length
        };
        const appointmentStatusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

        // Key Metrics
        const totalRevenue = invoices.reduce((acc: number, inv: any) => acc + (inv.paidAmount || inv.paid_amount || 0), 0);
        const totalPatients = patients.length;
        const completionRate = appointments.length > 0 
          ? (statusCounts.Completed / appointments.length) * 100 
          : 0;

        setData({
          revenueData,
          patientVisitsData: [
            { week: "Week 1", visits: 12 },
            { week: "Week 2", visits: 15 },
            { week: "Week 3", visits: 18 },
            { week: "Week 4", visits: 22 },
          ], // Static for now as per simple API
          treatmentData,
          appointmentStatusData,
          metrics: {
            totalRevenue,
            totalPatients,
            avgRevenue: totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0,
            completionRate: Math.round(completionRate * 10) / 10,
            newPatients: patients.filter((p: any) => {
                const created = new Date(p.createdAt || p.created_at || Date.now());
                return created.getMonth() === new Date().getMonth();
            }).length
          }
        });
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (role !== "admin" && role !== "dentist") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            View insights and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">₹{data.metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+12.5%</span> from last period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Patients
              </CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{data.metrics.totalPatients}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-blue-600">+18</span> new this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Revenue/Patient
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">₹{data.metrics.avgRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Per patient visit</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completion Rate
              </CardTitle>
              <Calendar className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{data.metrics.completionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Appointments completed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <p className="text-sm text-gray-500">Monthly revenue over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patient Visits Chart */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Patient Visits</CardTitle>
            <p className="text-sm text-gray-500">Weekly patient visits</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.patientVisitsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="visits" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Distribution */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Treatment Distribution</CardTitle>
            <p className="text-sm text-gray-500">Most common treatments</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.treatmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.treatmentData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Status</CardTitle>
            <p className="text-sm text-gray-500">Breakdown by status</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.appointmentStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">New Patients</div>
              <div className="text-2xl font-semibold text-gray-900">{data.metrics.newPatients}</div>
              <div className="text-xs text-green-600">+12% from last month</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Return Patients</div>
              <div className="text-2xl font-semibold text-gray-900">188</div>
              <div className="text-xs text-blue-600">91% retention rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Avg Wait Time</div>
              <div className="text-2xl font-semibold text-gray-900">8 min</div>
              <div className="text-xs text-green-600">-2 min improvement</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Patient Satisfaction</div>
              <div className="text-2xl font-semibold text-gray-900">4.8/5</div>
              <div className="text-xs text-green-600">Excellent rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}