"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Composant qui utilise useSearchParams, à l'intérieur du Suspense
function VerificationFailedContent() {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams?.get("reason");
  
  let message = "Une erreur s'est produite lors de la vérification de votre email.";
  
  if (reason === "missing-params") {
    message = "Le lien de vérification est incomplet ou mal formaté.";
  } else if (reason === "invalid") {
    message = "Le lien de vérification est invalide ou a expiré.";
  }
  
  return (

    <Card className="w-full max-w-md shadow-xl bg-secondary">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <CardTitle className="text-2xl">Échec de vérification</CardTitle>
        <CardDescription>
          Nous n'avons pas pu vérifier votre adresse email.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-2">
        <p>{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous pouvez demander un nouveau lien de vérification.
        </p>
      </CardContent>
      <CardFooter className="flex-col space-y-2 pt-2">
        <Button 
          className="w-full" 
          onClick={() => router.push('/verify-email')}
        >
          Demander un nouveau lien
        </Button>
        <Button 
          variant="outline"
          className="w-full" 
          onClick={() => router.push('/login')}
        >
          Retour à la connexion
        </Button>
      </CardFooter>
    </Card>

  );
}

// Composant principal qui utilise Suspense
export default function VerificationFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-xl p-8 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Chargement...</p>
        </Card>
      }>
        <VerificationFailedContent />
      </Suspense>
    </div>
  );
}