"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AdminAuthSession } from "@/lib/types";

// Hand-coded Admin Credentials directly in source code for easy demo & access
export const ADMIN_HARDCODED_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  role: "Chief Cadre Administrator",
  department: "Ministry of Statistics & Programme Implementation (MoSPI)",
};

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminSession: AdminAuthSession | null;
  isLoading: boolean;
  loginAdmin: (password: string, username?: string) => boolean;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

const STORAGE_KEY = "skillintel_admin_auth";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminAuthSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminAuthSession;
        setAdminSession(parsed);
      }
    } catch (e) {
      console.error("Failed to restore admin auth from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = (password: string, username = "admin"): boolean => {
    const trimmedPass = password.trim();
    const trimmedUser = username.trim().toLowerCase();

    // Verify against hand-coded password
    if (
      trimmedPass === ADMIN_HARDCODED_CREDENTIALS.password &&
      (trimmedUser === "" ||
        trimmedUser === ADMIN_HARDCODED_CREDENTIALS.username.toLowerCase())
    ) {
      const session: AdminAuthSession = {
        username: ADMIN_HARDCODED_CREDENTIALS.username,
        role: ADMIN_HARDCODED_CREDENTIALS.role,
        authenticatedAt: new Date().toISOString(),
      };
      setAdminSession(session);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error("Failed to save admin auth to localStorage", e);
      }
      return true;
    }

    return false;
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove admin auth from localStorage", e);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated: !!adminSession,
        adminSession,
        isLoading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
