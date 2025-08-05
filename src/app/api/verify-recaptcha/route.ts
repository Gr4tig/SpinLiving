import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { token } = data;

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 });
  }

  try {
    // Vérifier le token avec l'API Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY || '',
        response: token,
      }).toString(),
    });

    const result = await response.json();

    // Si le score est trop bas, considérer comme un robot
    if (result.success && result.score >= 0.5) {
      return NextResponse.json({ success: true, score: result.score });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'reCAPTCHA verification failed',
        details: result 
      });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}