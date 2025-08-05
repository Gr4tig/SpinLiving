import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token reCAPTCHA manquant' }, 
        { status: 400 }
      );
    }
    
    // Vérifiez le token avec l'API Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });
    
    const data = await response.json();
    
    // Vérifiez si le score est suffisant (0.5 est un seuil courant)
    if (data.success && data.score > 0.5) {
      return NextResponse.json({ success: true, score: data.score });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Vérification reCAPTCHA échouée',
        details: data 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification reCAPTCHA:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' }, 
      { status: 500 }
    );
  }
}