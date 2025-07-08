"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthProvider";

export default function DashboardPage() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <p className="text-gray-600">Vous êtes connecté à votre tableau de bord.</p>
    </div>
  );
}
