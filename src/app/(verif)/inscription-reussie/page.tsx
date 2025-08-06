"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InscriptionReussie() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Récupérer l'email stocké lors de l'inscription
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
    
    // Démarrer le compte à rebours
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Passer à la page de vérification d'email
          router.push('/verify-email');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
          <CardDescription>
            Votre compte a été créé avec succès.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="mb-4">
            Nous avons envoyé un email de vérification à<br />
            <strong className="text-primary">{email || 'votre adresse email'}</strong>
          </p>
          
          <div className="flex items-center justify-center space-x-2 my-6">
            <Mail className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Vérifiez votre boîte de réception pour activer votre compte
            </p>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Vous serez automatiquement redirigé dans <span className="font-bold">{countdown}</span> secondes...
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => router.push('/verify-email')}
          >
            Continuer maintenant
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}