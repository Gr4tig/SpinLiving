"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { toast } from "sonner";

type RequireVerifiedEmailProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Composant optionnel à afficher pendant la vérification
};

export function RequireVerifiedEmail({ children, fallback }: RequireVerifiedEmailProps) {
  const { user, isVerified, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Vérification complète
      if (!user) {
        // Non connecté
        toast.error("Vous devez être connecté pour accéder à cette page");
        router.push("/login");
        return;
      }

      if (!isVerified) {
        // Connecté mais non vérifié
        toast.info("Veuillez vérifier votre email pour accéder à cette page");
        router.push("/verify-email");
        return;
      }

      // Tout est bon
      setIsChecking(false);
    }
  }, [user, isVerified, loading, router]);

  // Pendant la vérification ou si les conditions ne sont pas remplies
  if (loading || isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Vérification de votre compte...</p>
        </div>
      </div>
    );
  }

  // Si on arrive ici, c'est que l'utilisateur est connecté et vérifié
  return <>{children}</>;
}