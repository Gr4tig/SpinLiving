'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/appwrite';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, name);
      toast.success('Inscription réussie ✅');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Échec de l'inscription ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold text-center text-[#8008AF]">Inscription</h1>

          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8008AF]"
          />

          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8008AF]"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8008AF]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8008AF] text-white py-2 rounded-xl hover:bg-[#6d0793] transition"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>

          <p className="text-center text-sm">
            Déjà inscrit ?{' '}
            <a href="/login" className="text-[#8008AF] font-semibold hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </main>
    </>
  );
}
