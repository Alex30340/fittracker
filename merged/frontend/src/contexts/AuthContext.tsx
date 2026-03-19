"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGetMe, apiLogin, apiRegister, setToken, getToken } from "@/lib/api";

interface User { id: number; email: string; display_name: string; plan: string; }

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<void>;
  register: (email: string, pw: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true, login: async () => {}, register: async () => {}, logout: () => {}, error: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiGetMe().then(d => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pw: string) => {
    setError(null);
    try {
      const d = await apiLogin(email, pw);
      setToken(d.token);
      setUser(d.user);
    } catch (e: any) { setError(e.message); throw e; }
  };

  const register = async (email: string, pw: string, name: string) => {
    setError(null);
    try {
      const d = await apiRegister(email, pw, name);
      setToken(d.token);
      setUser(d.user);
    } catch (e: any) { setError(e.message); throw e; }
  };

  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}
