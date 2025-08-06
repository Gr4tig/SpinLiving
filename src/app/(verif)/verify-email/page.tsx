"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { confirmVerificationEmail } from "@/lib/appwrite";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Contenu qui utilise useSearchParams
function VerifyEmailContent() {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const { user, isVerified, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Récupérer les paramètres de vérification
  const userId = searchParams?.get("userId");
  const secret = searchParams?.get("secret");
  
  // Fonction pour vérifier le token
  const handleVerifyToken = async (userId: string, secret: string) => {
    console.log("Tentative de vérification avec:", { userId, secret });
    setVerifying(true);
    
    try {
      await confirmVerificationEmail(userId, secret);
      toast.success("Email vérifié avec succès!");
      await refreshUser();
      
      // Rediriger vers la page de recherche de logement
      setTimeout(() => {
        router.push('/logement/recherche');
      }, 1500);
    } catch (error) {
      console.error("Erreur de vérification:", error);
      toast.error("La vérification a échoué. Le lien a peut-être expiré.");
    } finally {
      setVerifying(false);
    }
  };

  // Vérifier les paramètres URL au chargement de la page
  useEffect(() => {
    if (userId && secret) {
      console.log("Paramètres de vérification trouvés");
      handleVerifyToken(userId, secret);
    }
  }, [userId, secret]);
  
  // Effet pour gérer la redirection si déjà vérifié
  useEffect(() => {
    if (!loading && user && isVerified) {
      toast.success("Votre email est déjà vérifié!");
      setTimeout(() => {
        router.push('/logement/recherche');
      }, 1500);
    }
  }, [user, isVerified, loading, router]);

  // Fonction pour renvoyer l'email de vérification
  const handleResendEmail = async () => {
    setResending(true);
    try {
      await sendVerificationEmail();
      toast.success("Email de vérification envoyé!");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email. Veuillez réessayer.");
    } finally {
      setResending(false);
    }
  };

  // Fonction pour vérifier manuellement l'état de vérification
  const checkVerificationStatus = async () => {
    toast.info("Vérification de votre statut...");
    
    try {
      await refreshUser();
      
      if (isVerified) {
        toast.success("Votre email est vérifié!");
        setTimeout(() => {
          router.push('/logement/recherche');
        }, 1000);
      } else {
        toast.error("Votre email n'est pas encore vérifié.");
      }
    } catch (error) {
      toast.error("Impossible de vérifier votre statut.");
    }
  };

  // Affichage durant la vérification
  if (verifying) {
    return (
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Vérification de votre email...</p>
      </div>
    );
  }

  // Affichage normal
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Vérification de votre adresse email</CardTitle>
        <CardDescription>
          Pour accéder à toutes les fonctionnalités, vous devez vérifier votre email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <p className="mb-4">
            Nous avons envoyé un email à <strong>{user.email}</strong> avec un lien de vérification.
            Veuillez cliquer sur ce lien pour vérifier votre adresse.
          </p>
        ) : (
          <p className="mb-4">
            Si vous venez de vous inscrire, nous avons envoyé un email à votre adresse.
            Veuillez cliquer sur le lien de vérification dans cet email.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Si vous ne trouvez pas l'email, vérifiez votre dossier spam ou demandez un nouvel email ci-dessous.
        </p>
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        {user && (
          <Button 
            onClick={handleResendEmail} 
            className="w-full"
            disabled={resending}
          >
            {resending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
          </Button>
        )}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={checkVerificationStatus}
        >
          J'ai déjà vérifié mon email
        </Button>
      </CardFooter>
    </Card>
  );
}

// N'oubliez pas d'importer useState ici en haut du fichier
import { useState, useEffect } from "react";
import { sendVerificationEmail } from "@/lib/appwrite";

// Composant principal qui enveloppe avec Suspense
export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Vérification d'email</CardTitle>
            <CardDescription>Chargement en cours...</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}