"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Models } from "appwrite";
import {
  createAccount,
  login as loginApi,
  logout as logoutApi,
  getCurrentAccount,
} from "./auth";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);

  const refreshUser = async () => {
    const account = await getCurrentAccount();
    setUser(account);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    await loginApi(email, password);
    await refreshUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await createAccount(email, password, name);
    await refreshUser();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
