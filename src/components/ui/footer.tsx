'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';


export function Footer() {
  return (
    <footer className="bg-secondary/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gradient mb-4">Spin Living</h3>
            <p className="text-muted-foreground mb-4">
              La solution de colocation courte durée pour jeunes actifs et étudiants en alternance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/logement/recherche" className="text-muted-foreground hover:text-primary">
                  Rechercher un logement
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-primary">
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-muted-foreground">
                <MapPin size={18} className="mr-2 text-primary" />
                <span>Paris, France</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Mail size={18} className="mr-2 text-primary" />
                <span>contact@spinliving.com</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Phone size={18} className="mr-2 text-primary" />
                <span>+33 1 23 45 67 89</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Spin Living. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
