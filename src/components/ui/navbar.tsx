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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient">Spin Living</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Link>
              <Link href="/search" className="text-white hover:text-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Link>
              
            </div>
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
            
            
          </div>
        </div>
      )}
    </nav>
  );
}
