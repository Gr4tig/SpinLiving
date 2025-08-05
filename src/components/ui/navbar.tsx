"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { 
  Menu, X, User, Home, Search, 
  LogOut, PlusCircle 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, profile, isOwner, logout, loading } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Déconnexion
  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  // Avatar
  const avatarInitials =
    (profile?.prenom?.charAt(0) || profile?.nom?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-2 border-b-white/10 border-t-0 border-l-0 border-r-0 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Spin Living"
              width={100}
              height={100}
              priority
            />
          </div>
          
          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <>
                <Link href="/" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
                <Link href="/logement/recherche" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Link>
                {isOwner && (
                  <Link href="/logement/creation">
                    <Button variant="default" className="ml-2 flex items-center">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Créer une annonce
                    </Button>
                  </Link>
                )}
                <Link href="/profile" className="ml-3 flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.photo || ""} />
                    <AvatarFallback className="bg-muted">{avatarInitials}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Link href="/proprietaire" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Je suis proprietaire
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="ml-2">Se connecter</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" className="ml-2">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      {isOpen && isMobile && (
        <div className="md:hidden glass-morphism">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && profile ? (
              <>
                <Link href="/" className="text-white hover:text-primary block px-3 py-2 rounded-md text-base font-medium flex items-center" onClick={toggleMenu}>
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
                <Link href="/logement/recherche" className="text-white hover:text-primary block px-3 py-2 rounded-md text-base font-medium flex items-center" onClick={toggleMenu}>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Link>
                {isOwner && (
                  <Link href="/logement/creation" className="block mt-2" onClick={toggleMenu}>
                    <Button className="w-full flex items-center">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Créer une annonce
                    </Button>
                  </Link>
                )}
                <Link href="/profile" className="flex items-center mt-2" onClick={toggleMenu}>
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={profile.photo || ""} />
                    <AvatarFallback className="bg-muted">{avatarInitials}</AvatarFallback>
                  </Avatar>
                  <span>Mon profil</span>
                </Link>
                <Button variant="ghost" className="w-full mt-2 flex items-center" onClick={() => { handleLogout(); toggleMenu(); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/proprietaire" className="text-white hover:text-primary block px-3 py-2 rounded-md text-base font-medium flex items-center" onClick={toggleMenu}>
                  <Home className="w-4 h-4 mr-2" />
                  Je suis proprietaire
                </Link>
                <Link href="/login" className="block mt-4" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full">Se connecter</Button>
                </Link>
                <Link href="/signup" className="block mt-2" onClick={toggleMenu}>
                  <Button className="w-full">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}