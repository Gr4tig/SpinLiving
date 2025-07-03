"use client";

import { useEffect } from "react";
import { logout } from "@/lib/auth";

export default function LogoutPage() {
  useEffect(() => {
    logout().finally(() => {
      window.location.href = "/";
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Déconnexion...</p>
    </div>
  );
}
