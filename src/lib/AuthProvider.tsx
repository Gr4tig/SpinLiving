"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Models, Query } from "appwrite";
import { account, databases } from "./appwrite";
import {
  createAccount as createAccountApi,
  login as loginApi,
  logout as logoutApi,
  getCurrentAccount,
} from "./auth";

// Types pour les profils enrichis
type ProfileProprio = {
  $id: string;
  userid: string;
  nom: string;
  prenom: string;
  photo?: string;
  tel: string;
};
type ProfileLocataire = {
  $id: string;
  userid: string;
  nom: string;
  prenom: string;
  tel: string;
  ville: string;
  objectif: string;
  photo?: string;
};

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  profile: ProfileProprio | ProfileLocataire | null;
  isOwner: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisation des variables d'environnement (.env)
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROPRIO_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPRIO_ID!;
const LOCATAIRE_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOCATAIRE_ID!;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<ProfileProprio | ProfileLocataire | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Rafraîchit user + profil enrichi
  const refreshUser = async () => {
    setLoading(true);
    const accountUser = await getCurrentAccount();
    setUser(accountUser);

    if (accountUser) {
      try {
        // On cherche d'abord dans la collection proprio
        const result = await databases.listDocuments(DB_ID, PROPRIO_COLLECTION, [
          Query.equal("userid", accountUser.$id),
        ]);
        if (result.total > 0) {
          setProfile(result.documents[0] as unknown as ProfileProprio);
          setIsOwner(true);
          setLoading(false);
          return;
        }
        // Sinon, on cherche dans la collection locataire
        const result2 = await databases.listDocuments(DB_ID, LOCATAIRE_COLLECTION, [
          Query.equal("userid", accountUser.$id),
        ]);
        if (result2.total > 0) {
          setProfile(result2.documents[0] as unknown as ProfileLocataire);
          setIsOwner(false);
          setLoading(false);
          return;
        }
        setProfile(null);
        setIsOwner(false);
        setLoading(false);
      } catch (err) {
        setProfile(null);
        setIsOwner(false);
        setLoading(false);
      }
    } else {
      setProfile(null);
      setIsOwner(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  const login = async (email: string, password: string) => {
    await loginApi(email, password);
    await refreshUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await createAccountApi(email, password, name);
    await refreshUser();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    setProfile(null);
    setIsOwner(false);
    setLoading(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isOwner, loading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}