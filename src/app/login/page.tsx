"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useReCaptcha } from "@/components/captcha/useReCaptcha"; // Mise à jour du chemin

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const { user, login } = useAuth();
  const router = useRouter();
  const { getCaptchaToken } = useReCaptcha(); // Utilisez le hook

  useEffect(() => {
    if (user) {
      router.push("/logement/recherche");
    }
  }, [user, router]);

  // Fonction pour vérifier le token reCAPTCHA
  const verifyRecaptcha = async (token) => {
    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erreur lors de la vérification du captcha:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // Obtenir un token reCAPTCHA
      const token = await getCaptchaToken('login');
      
      if (!token) {
        toast.error("La vérification anti-robot a échoué. Veuillez réessayer.");
        setFormLoading(false);
        return;
      }
      
      // Vérifier le token côté serveur
      const isHuman = await verifyRecaptcha(token);
      
      if (!isHuman) {
        toast.error("La vérification anti-robot a échoué. Êtes-vous un robot?");
        setFormLoading(false);
        return;
      }
      
      // Si la vérification réussit, procéder à la connexion
      await login(email, password);
      toast.success("Connexion réussie ✅");
    } catch (err: any) {
      toast.error(err?.message || "Email ou mot de passe incorrect.");
    } finally {
      setFormLoading(false);
    }
  };

  // Le reste du composant reste inchangé
  if (user) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container py-16 flex items-center">
        <div className="w-full max-w-md mx-auto px-4">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Connexion</CardTitle>
              <CardDescription className="text-center">
                Connectez-vous à votre compte Spin Living
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10 bg-white/10 border-white/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-white/10 border-white/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Ce site est protégé par reCAPTCHA pour garantir que vous n'êtes pas un robot.
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={formLoading}
                >
                  {formLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center w-full">
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}