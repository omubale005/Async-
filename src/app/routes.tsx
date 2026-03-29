import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Patients } from "./components/Patients";
import { Appointments } from "./components/Appointments";
import { DentalChart } from "./components/DentalChart";
import { Billing } from "./components/Billing";
import { Inventory } from "./components/Inventory";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "patients", element: <Patients /> },
      { path: "appointments", element: <Appointments /> },
      { path: "revenue", element: <Billing /> },
      { path: "inventory", element: <Inventory /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);