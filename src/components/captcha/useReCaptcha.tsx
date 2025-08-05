"use client";

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getCaptchaToken = async (action = 'submit') => {
    if (!executeRecaptcha) {
      console.warn('Execute recaptcha not yet available');
      return null;
    }
    
    return await executeRecaptcha(action);
  };

  return { getCaptchaToken };
}