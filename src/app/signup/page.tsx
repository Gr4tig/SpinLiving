"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Image as ImageIcon, MapPin } from 'lucide-react';
import { register } from '@/lib/appwrite';
import { toast } from 'sonner';

const objectifs = [
  "Télétravail",
  "Alternance",
  "Etudiant",
  "Deplacement",
  "Autre"
];

export default function Register() {
  const [accountType, setAccountType] = useState<'locataire' | 'proprietaire'>('locataire');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [phone, setPhone] = useState('');
  const [ville, setVille] = useState('');
  const [objectif, setObjectif] = useState('');
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form submitted");
    try {
      await register(
        email,
        password,
        name,
        prenom,
        phone,
        ville,
        objectif,
        photo,
        accountType
      );
      toast.success('Inscription réussie ✅');
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Erreur register:", err);
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="glass-morphism rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gradient">Créer un compte</h2>
              <p className="text-muted-foreground mt-2">Rejoignez la communauté Spin Living</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Type de compte</Label>
                <RadioGroup
                  value={accountType}
                  onValueChange={v => setAccountType(v as 'locataire' | 'proprietaire')}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className={`flex-1 glass-morphism rounded-lg p-4 cursor-pointer transition-all ${accountType === 'locataire' ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'}`}>
                    <RadioGroupItem value="locataire" id="locataire" className="sr-only" />
                    <Label htmlFor="locataire" className="flex flex-col items-center cursor-pointer">
                      <User className="h-6 w-6 mb-2 text-primary" />
                      <span className="font-medium">Locataire</span>
                      <span className="text-sm text-muted-foreground">Je cherche un logement</span>
                    </Label>
                  </div>
                  <div className={`flex-1 glass-morphism rounded-lg p-4 cursor-pointer transition-all ${accountType === 'proprietaire' ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'}`}>
                    <RadioGroupItem value="proprietaire" id="proprietaire" className="sr-only" />
                    <Label htmlFor="proprietaire" className="flex flex-col items-center cursor-pointer">
                      <User className="h-6 w-6 mb-2 text-primary" />
                      <span className="font-medium">Propriétaire</span>
                      <span className="text-sm text-muted-foreground">Je propose un logement</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prenom"
                      placeholder="Prénom"
                      required
                      className="pl-10 bg-white/10 border-white/20"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nom"
                      required
                      className="pl-10 bg-white/10 border-white/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    className="pl-10 bg-white/10 border-white/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    className="pl-10 bg-white/10 border-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10 bg-white/10 border-white/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères, incluant majuscule, minuscule et chiffre.
                </p>
              </div>

              {accountType === 'locataire' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ville"
                        placeholder="Paris"
                        className="pl-10 bg-white/10 border-white/20"
                        value={ville}
                        onChange={(e) => setVille(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objectif">Objectif</Label>
                    <select
                      id="objectif"
                      className="w-full bg-white/10 border-white/20 rounded-md p-2"
                      value={objectif}
                      onChange={(e) => setObjectif(e.target.value)}
                    >
                      <option value="">Sélectionner</option>
                      {objectifs.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="photo">Photo (URL)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="photo"
                    placeholder="Lien vers votre photo"
                    className="pl-10 bg-white/10 border-white/20"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="w-full" disabled={loading}>
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                En vous inscrivant, vous acceptez nos{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Conditions d'utilisation
                </Link>{" "}
                et notre{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
                .
              </p>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Déjà inscrit ?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Home = (props: React.SVGAttributes<SVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
