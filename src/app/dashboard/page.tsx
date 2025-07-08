"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthProvider";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Bienvenue {user.name}</h1>
      <button
        className="bg-orange-700 text-white px-4 py-2 rounded"
        onClick={() => {
          logout().then(() => router.push("/"));
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
