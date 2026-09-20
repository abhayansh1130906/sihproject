"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DemoLoginRequest, DemoLoginResponse } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  official: DemoLoginResponse | null;
  officialId: string | null;
  isLoading: boolean;
  login: (credentials: DemoLoginRequest) => Promise<DemoLoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "skillintel_official_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [official, setOfficial] = useState<DemoLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoLoginResponse;
        setOfficial(parsed);
      }
    } catch (e) {
      console.error("Failed to restore official auth from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: DemoLoginRequest) => {
    const response = await api.loginDemo(credentials);
    setOfficial(response);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    } catch (e) {
      console.error("Failed to save auth to localStorage", e);
    }
    return response;
  };

  const logout = () => {
    setOfficial(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove auth from localStorage", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        official,
        officialId: official?.official_id || null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
