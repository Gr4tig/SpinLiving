import { NextRequest, NextResponse } from "next/server";
import { confirmVerificationEmail } from "@/lib/appwrite";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");
    
    console.log("API /verify: Tentative de vérification avec userId:", userId);
    
    if (!userId || !secret) {
      console.log("API /verify: Paramètres manquants");
      return NextResponse.redirect(new URL('/verification-failed?reason=missing-params', request.url));
    }
    
    // Appeler la fonction de vérification
    await confirmVerificationEmail(userId, secret);
    console.log("API /verify: Vérification réussie!");
    
    // Rediriger vers une page de succès
    return NextResponse.redirect(new URL('/verification-success', request.url));
  } catch (error) {
    console.error("API /verify: Erreur lors de la vérification:", error);
    return NextResponse.redirect(new URL('/verification-failed?reason=invalid', request.url));
  }
}