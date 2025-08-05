"use client";

import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Composant wrapper pour utiliser reCAPTCHA dans toute l'application
export const ReCaptchaProvider = ({ children }) => {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'body',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

// Hook personnalisé pour exécuter reCAPTCHA et obtenir un token
export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getCaptchaToken = async (action = 'submit') => {
    if (!executeRecaptcha) {
      console.warn('Execute recaptcha not yet available');
      return null;
    }
    
    return await executeRecaptcha(action);
  };

  return { getCaptchaToken };
};