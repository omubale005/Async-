import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Patients } from "./components/Patients";
import { Appointments } from "./components/Appointments";
import { DentalChart } from "./components/DentalChart";
import { Billing } from "./components/Billing";
import { Inventory } from "./components/Inventory";
import { Settings } from "./components/Settings";
import { Reports } from "./components/Reports";
import { useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Loader2 } from "lucide-react";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="chart" element={<DentalChart />} />
            <Route path="billing" element={<Billing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="revenue" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;