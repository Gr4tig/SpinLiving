'use client';

import { useState } from 'react';
import { Send, X, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/lib/appwrite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  buttonStyle?: 'icon' | 'full';
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function NewsletterSignup({
  title = "Rejoindre la newsletter",
  subtitle = "Recevez nos actualités et offres spéciales",
  buttonStyle = 'icon',
  className = '',
  inputClassName = '',
  buttonClassName = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      setSubscriptionStatus('error');
      setDialogOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await subscribeToNewsletter(email);
      setSubscriptionStatus('success');
      setEmail(''); // Réinitialiser l'input
    } catch (error: any) {
      setSubscriptionStatus('error');
      if (error.code === 409) {
        setErrorMessage('Cette adresse email est déjà inscrite à notre newsletter');
      } else {
        setErrorMessage("Une erreur s'est produite. Veuillez réessayer ultérieurement.");
      }
    } finally {
      setIsLoading(false);
      setDialogOpen(true);
    }
  };

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      
      <form onSubmit={handleSubscribe} className="space-y-3">
        <div className="relative">
          <Input
            type="email"
            placeholder="votre@email.com"
            className={`bg-[#19191b] border border-white/10 pl-3 pr-10 py-2 rounded-md w-full text-white ${inputClassName}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          {buttonStyle === 'icon' ? (
            <Button
              type="submit"
              size="icon"
              className={`absolute right-0 top-0 h-full bg-transparent hover:bg-transparent ${buttonClassName}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Send className="h-5 w-5 text-primary" />
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              className={`mt-2 w-full bg-[#ff5734] hover:bg-[#e94c2d] ${buttonClassName}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'abonner"
              )}
            </Button>
          )}
        </div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </form>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {subscriptionStatus === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Inscription réussie
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-500" />
                  Erreur
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* Contenu du dialogue sans utiliser DialogDescription */}
          {subscriptionStatus === 'success' ? (
            <div className="text-center py-2">
              <p>Merci pour votre inscription à notre newsletter !</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous recevrez bientôt nos actualités et offres spéciales.
              </p>
            </div>
          ) : (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setDialogOpen(false)} 
              className={subscriptionStatus === 'success' ? 'bg-[#ff5734] hover:bg-[#e94c2d]' : ''}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}