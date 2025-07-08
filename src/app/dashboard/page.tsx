"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/appwrite";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <p className="text-gray-600">Vous êtes connecté à votre tableau de bord.</p>
      <Button onClick={handleLogout} className="bg-primary text-white">
        Se déconnecter
      </Button>
    </div>
  );
}