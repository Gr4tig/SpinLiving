import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifie si le chemin commence par /auth
  if (request.nextUrl.pathname.startsWith('/auth')) {
    // Vérifie le cookie de session d'Appwrite
    const hasAppwriteSession = request.cookies.has('a_session_');
    
    if (!hasAppwriteSession) {
      // Redirige vers la page de connexion
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};