"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerificationSuccess() {
  const router = useRouter();
  
  // Effet pour mettre à jour le contexte d'authentification
  useEffect(() => {
    // Attendre 1 seconde puis essayer de rafraîchir la session
    const timer = setTimeout(() => {
      // Tentative de rafraîchir l'état de l'utilisateur
      try {
        // Si vous avez une fonction globale de rafraîchissement, vous pourriez l'appeler ici
        // Cependant, sans accès au contexte, nous allons simplement recharger la page
        window.location.reload();
      } catch (error) {
        console.error("Erreur lors du rafraîchissement:", error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email vérifié avec succès!</CardTitle>
          <CardDescription>
            Votre compte a été activé.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de Spin Living.</p>
        </CardContent>
        <CardFooter className="flex-col space-y-2 pt-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/logement/recherche')}
          >
            Rechercher un logement
          </Button>
          <Button 
            variant="outline"
            className="w-full" 
            onClick={() => router.push('/dashboard')}
          >
            Aller à mon tableau de bord
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}