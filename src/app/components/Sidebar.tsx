import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Receipt,
  Package,
  BarChart3,
  Settings,
  Smile,
} from "lucide-react";
import { useRole } from "../context/RoleContext";
import { cn } from "./ui/utils";

const navigationItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Patients", path: "/patients", icon: Users },
  { name: "Appointments", path: "/appointments", icon: Calendar },
  { name: "Revenue", path: "/revenue", icon: Receipt },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const { role } = useRole();

  const filteredNavigation = navigationItems.filter(item => {
    if (role === "dentist") return true; // Dentist sees everything
    
    if (role === "receptionist") {
      const allowed = ["Dashboard", "Patients", "Appointments", "Revenue"];
      return allowed.includes(item.name);
    }
    
    if (role === "admin") {
      const allowed = ["Dashboard", "Patients", "Appointments", "Revenue", "Inventory", "Settings"];
      return allowed.includes(item.name);
    }
    
    return false;
  });

  return (
    <aside className="group fixed left-0 top-0 h-full w-16 hover:w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Async</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">© 2026 Async</span>
        </div>
      </div>
    </aside>
  );
}