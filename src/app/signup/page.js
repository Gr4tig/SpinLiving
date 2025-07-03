"use client";

import { useState } from "react";
import { register } from "@/lib/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
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
        <h1 className="text-xl font-bold">S'inscrire</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Nom"
          className="border rounded w-full p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Créer un compte
        </button>
      </form>
    </div>
  );
}
