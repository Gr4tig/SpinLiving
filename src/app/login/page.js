"use client";

import { useState } from "react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow rounded max-w-sm w-full space-y-4"
      >
        <h1 className="text-xl font-bold">Se connecter</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="border rounded w-full p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="border rounded w-full p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-orange-700 text-white px-4 py-2 rounded w-full"
        >
          Connexion
        </button>
      </form>
    </div>
  );
}
