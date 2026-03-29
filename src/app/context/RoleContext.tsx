import React, { createContext, useContext, useState } from "react";
import { UserRole } from "../types";
import { useAuth } from "./AuthContext";

interface RoleContextType {
  role: UserRole;
  userName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, role: authRole } = useAuth();

  const role = authRole || "dentist";

  const getUserName = (role: UserRole) => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    switch (role) {
      case "dentist":
        return "Dr. Anjali Mehta";
      case "receptionist":
        return "Sneha Kapoor";
      case "admin":
        return "Admin User";
    }
  };

  return (
    <RoleContext.Provider 
      value={{ 
        role: role as UserRole, 
        userName: getUserName(role as UserRole) 
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}