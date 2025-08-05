"use client";

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ReactNode, useEffect, useState } from 'react';

// Composant provider unique
export function ReCaptchaProvider({ children }: { children: ReactNode }) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
  
  if (!reCaptchaKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY not defined');
    // Retourner les enfants sans le provider si la clé n'est pas définie
    return <>{children}</>;
  }
  
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      scriptProps={{
        async: false, // Changé à false pour s'assurer que le script est chargé avant utilisation
        defer: true,
        appendTo: 'head', // Meilleur pour le chargement
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}

// Hook personnalisé avec gestion d'état de chargement
export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isReady, setIsReady] = useState(false);
  
  // Vérifier quand reCAPTCHA devient disponible
  useEffect(() => {
    if (executeRecaptcha) {
      setIsReady(true);
    }
  }, [executeRecaptcha]);

  const getCaptchaToken = async (action = 'submit') => {
    // Attendre un peu si reCAPTCHA n'est pas immédiatement disponible
    if (!executeRecaptcha) {
      console.log('Waiting for reCAPTCHA to be available...');
      // Attendre jusqu'à 3 secondes pour que reCAPTCHA soit disponible
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (executeRecaptcha) break;
      }
      
      // Si toujours pas disponible après l'attente
      if (!executeRecaptcha) {
        console.warn('Execute recaptcha still not available after waiting');
        return null;
      }
    }
    
    try {
      return await executeRecaptcha(action);
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
      return null;
    }
  };

  return { getCaptchaToken, isReady };
}