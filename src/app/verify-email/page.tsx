"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { confirmVerificationEmail, isEmailVerified, sendVerificationEmail } from "@/lib/appwrite";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmail() {
  const { user, isVerified, loading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Récupérer les paramètres de vérification
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  
  // Effet pour rafraîchir l'état de l'utilisateur au chargement
  useEffect(() => {
    // Tentative de rafraîchissement des données utilisateur
    refreshUser();
    
    // Log debug pour comprendre l'état
    console.log("État initial:", { 
      userExists: !!user,
      isVerified,
      hasToken: !!(userId && secret)
    });
  }, []);

  // Traiter le token de vérification s'il est présent
  useEffect(() => {
    if (userId && secret) {
      handleVerifyToken(userId, secret);
    }
  }, [userId, secret]);

  // Redirection vers dashboard uniquement si vérifié
  useEffect(() => {
    if (user && isVerified) {
      toast.success("Votre email est vérifié!");
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [user, isVerified, router]);

  // Fonction pour vérifier le token
  const handleVerifyToken = async (userId: string, secret: string) => {
    setVerifying(true);
    try {
      await confirmVerificationEmail(userId, secret);
      toast.success("Email vérifié avec succès!");
      await refreshUser();
    } catch (error) {
      toast.error("La vérification a échoué. Veuillez réessayer.");
    } finally {
      setVerifying(false);
    }
  };

  // Fonction pour renvoyer l'email
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

  // État de chargement
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Vérification de votre email...</p>
        </div>
      </div>
    );
  }

  const [checking, setChecking] = useState(false);

  const handleCheckVerification = async () => {
    setChecking(true); // Indiquer visuellement que la vérification est en cours
    toast.info("Vérification de votre statut en cours...");
    
    try {
      // Appeler directement l'API pour obtenir le statut le plus récent
      const isVerified = await isEmailVerified(); // Fonction de lib/appwrite
      
      console.log("Statut de vérification:", isVerified);
      
      if (isVerified) {
        toast.success("Votre email est vérifié! Redirection...");
        
        // Force le rafraîchissement du contexte
        await refreshUser();
        
        // Rediriger vers la recherche de logements
        setTimeout(() => {
          router.push('/logement/recherche');
        }, 1500);
      } else {
        toast.error("Votre email n'est pas encore vérifié");
        console.log("L'email n'est pas vérifié selon Appwrite");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      toast.error("Erreur lors de la vérification de votre statut");
    } finally {
      setChecking(false);
    }
  };

  // Afficher le contenu normal de la page, quelle que soit la situation
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
              Si vous venez de vous inscrire, nous avons envoyé un email à l'adresse que vous avez fournie.
              Veuillez cliquer sur le lien de vérification dans cet email.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Si vous ne trouvez pas l'email, vérifiez votre dossier spam ou demandez un nouvel email ci-dessous.
          </p>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button 
            onClick={handleResendEmail} 
            className="w-full"
            disabled={resending || verifying || !user}
          >
            {resending ? "Envoi en cours..." : "Renvoyer l'email de vérification"}
          </Button>
          {user && (
            <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleCheckVerification}
            disabled={checking}
          >
            {checking ? (
              <>
                <span className="mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                Vérification...
              </>
            ) : "J'ai déjà vérifié mon email"}
          </Button>
          )}
          {!user && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Retour à la connexion
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}