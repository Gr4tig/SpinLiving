"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { 
  Menu, X, User, Home, Search, 
  LogOut, Settings, PlusCircle, FileText 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-2 border-b-white/10 border-t-0 border-l-0 border-r-0 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient">Spin Living</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/proprietaire" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Je suis proprietaire
            </Link>
            {/* Boutons à droite */}
            <Link href="/login">
              <Button variant="secondary" className="ml-2">Se connecter</Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" className="ml-2">S'inscrire</Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && isMobile && (
        <div className="md:hidden glass-morphism">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-white hover:text-primary block px-3 py-2 rounded-md text-base font-medium flex items-center" onClick={toggleMenu}>
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Link>
            <Link href="/search" className="text-white hover:text-primary block px-3 py-2 rounded-md text-base font-medium flex items-center" onClick={toggleMenu}>
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Link>
            {/* Boutons mobile */}
            <Link href="/login" className="block mt-4" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full">Se connecter</Button>
            </Link>
            <Link href="/signup" className="block mt-2" onClick={toggleMenu}>
              <Button className="w-full">S'inscrire</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}