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

import { isEmailVerified, sendVerificationEmail } from "./appwrite"; 

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
  isVerified: boolean; // Nouvel état pour la vérification d'email
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>; // Nouvelle fonction
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
  const [isVerified, setIsVerified] = useState<boolean>(false); // État de vérification

  // Rafraîchit user + profil enrichi
  const refreshUser = async () => {
    setLoading(true);
    try {
      const accountUser = await getCurrentAccount();
      setUser(accountUser);
  
      if (accountUser) {
        // Vérifier si l'email est vérifié
        const emailVerified = accountUser.emailVerification === true;
        setIsVerified(emailVerified);
        
        // Mettre à jour le cookie pour le middleware/protection de route
        if (typeof document !== 'undefined') {
          document.cookie = `email-verified=${emailVerified}; path=/;`;
        }

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
      // Réinitialiser l'état
      setProfile(null);
      setIsOwner(false);
      setIsVerified(false);
    }
  } catch (err) {
    console.error("Erreur de rafraîchissement utilisateur:", err);
  } finally {
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
    setIsVerified(false);
    setLoading(false);
    window.location.reload();
  };

  // Fonction pour renvoyer l'email de vérification
  const resendVerificationEmail = async () => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }
    
    await sendVerificationEmail();
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        profile, 
        isOwner, 
        loading, 
        isVerified, 
        login, 
        signup, 
        logout, 
        refreshUser,
        resendVerificationEmail 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}