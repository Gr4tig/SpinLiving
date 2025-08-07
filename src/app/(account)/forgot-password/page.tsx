"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { account } from "@/lib/appwrite";
import { AppwriteException } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schéma de validation pour le formulaire
const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  // Configuration du formulaire avec React Hook Form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Fonction de gestion de soumission du formulaire
  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true);
    setError(null);
    
    try {
      // URL de redirection après réinitialisation du mot de passe
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      // Appel à l'API Appwrite pour créer une demande de récupération
      await account.createRecovery(data.email, redirectUrl);
      
      // Marquer comme succès
      setSuccess(true);
    } catch (error) {
      console.error("Erreur lors de la demande de récupération:", error);
      
      // Gestion des erreurs Appwrite
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 400:
            setError("Email invalide ou non reconnu.");
            break;
          case 429:
            setError("Trop de tentatives. Veuillez réessayer plus tard.");
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

  // Si l'email a été envoyé avec succès, afficher un message de confirmation
  if (success) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] mt-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Email envoyé
            </CardTitle>
            <CardDescription className="text-center">
              Vérifiez votre boîte de réception
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex justify-center pb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <p>
              Un email contenant les instructions pour réinitialiser votre mot de passe
              a été envoyé à l'adresse indiquée.
            </p>
            <p className="text-sm text-muted-foreground">
              Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre
              dossier de spam ou de courrier indésirable.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Retour à la connexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-center">
            Entrez votre email pour recevoir un lien de réinitialisation
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre@email.com" 
                        type="email" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-[#ff5734] hover:bg-[#e94c2d]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer les instructions"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link 
            href="/login" 
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}