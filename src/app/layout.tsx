import type { ReactNode } from "react";
import { AuthProvider } from "../lib/AuthProvider";
import "../app/globals.css";

export const metadata = {
  title: "Spin Living",
  description: "La colocation rotative, simple & flexible",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAFB] font-[Inter] text-sm text-[#56565C] min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
