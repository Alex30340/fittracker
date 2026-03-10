"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "@/lib/api";

interface User {
  id: number;
  email: string;
  display_name: string;
  plan: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem("fittracker_token");
    if (stored) {
      setToken(stored);
      getMe(stored)
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("fittracker_token");
          localStorage.removeItem("fittracker_refresh");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("fittracker_token", data.access_token);
    localStorage.setItem("fittracker_refresh", data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await apiRegister(email, password, name);
    localStorage.setItem("fittracker_token", data.access_token);
    localStorage.setItem("fittracker_refresh", data.refresh_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("fittracker_token");
    localStorage.removeItem("fittracker_refresh");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
