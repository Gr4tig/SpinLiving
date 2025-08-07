"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { account } from "@/lib/appwrite";
import { AppwriteException } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schéma de validation pour le formulaire de réinitialisation
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Composant qui utilise useSearchParams à l'intérieur de Suspense
function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [invalidLink, setInvalidLink] = useState<boolean>(false);
  
  const router = useRouter();
  
  // Importer useSearchParams uniquement côté client pour éviter l'erreur
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  // Configuration du formulaire avec React Hook Form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Vérifier si les paramètres nécessaires sont présents
  useEffect(() => {
    if (!userId || !secret) {
      setInvalidLink(true);
      setError("Lien de réinitialisation invalide ou expiré.");
    }
  }, [userId, secret]);

  // Fonction de gestion de soumission du formulaire
  async function onSubmit(data: ResetPasswordFormValues) {
    if (!userId || !secret) {
      setError("Lien de réinitialisation invalide ou expiré.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Appel à l'API Appwrite pour réinitialiser le mot de passe
      await account.updateRecovery(userId, secret, data.password);
      
      // Marquer comme succès
      setSuccess(true);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      
      // Gestion des erreurs Appwrite
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 401:
            setError("Lien de réinitialisation expiré ou déjà utilisé.");
            break;
          case 400:
            setError("Données invalides. Vérifiez que les mots de passe correspondent.");
            break;
          default:
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Si le lien est invalide, afficher un message d'erreur
  if (invalidLink) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Lien invalide
          </CardTitle>
          <CardDescription className="text-center">
            Ce lien de réinitialisation est invalide ou a expiré
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Veuillez demander un nouveau lien de réinitialisation de mot de passe.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="bg-[#ff5734] hover:bg-[#e94c2d]" 
            onClick={() => router.push("/forgot-password")}
          >
            Demander un nouveau lien
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Si le mot de passe a été réinitialisé avec succès, afficher un message de confirmation
  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Mot de passe réinitialisé !
          </CardTitle>
          <CardDescription className="text-center">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center pb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <p>
            Votre mot de passe a été réinitialisé avec succès.
          </p>
          <p className="text-sm text-muted-foreground">
            Vous allez être redirigé vers la page de connexion...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Réinitialiser votre mot de passe
        </CardTitle>
        <CardDescription className="text-center">
          Créez un nouveau mot de passe pour votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              <p>Votre mot de passe doit contenir :</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Au moins 8 caractères</li>
                <li>Au moins une lettre minuscule</li>
                <li>Au moins une lettre majuscule</li>
                <li>Au moins un chiffre</li>
              </ul>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#ff5734] hover:bg-[#e94c2d]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation en cours...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Composant de chargement simple
function LoadingState() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-[#ff5734]" />
    </div>
  );
}

// Page principale avec Suspense
export default function ResetPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Suspense fallback={<LoadingState />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}