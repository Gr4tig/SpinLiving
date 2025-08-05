import type { ReactNode } from "react";
import { AuthProvider } from "../lib/AuthProvider";
import "../app/globals.css";
import { Navbar } from "@/components/ui/navbar";
import { ReCaptchaProvider } from "@/components/captcha/ReCaptchaProvider";

export const metadata = {
  title: "SpinLiving",
  description: "La colocation rotative, simple & flexible",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#010101] font-[Inter] text-sm text-[#FFF] min-h-screen">
        <ReCaptchaProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}