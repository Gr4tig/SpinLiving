'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';
import { FaTiktok } from "react-icons/fa";
import { NewsletterSignup } from '@/components/ui/newsletter-signup';

export function Footer() {
  return (
    <footer className="bg-secondary/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center ">
          <div>
            <div className="flex flex-col mb-6">
              <Link href="/">
                <Image
                  src="/logo2.png"
                  alt="Spin Living"
                  width={130}
                  height={130}
                  priority
                />
              </Link>
            </div>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/spinliving/" className="text-white hover:text-primary">
                <Instagram size={25} />
              </a>
              <a href="https://www.linkedin.com/company/spin-living/" className="text-white hover:text-primary">
                <Linkedin size={25} />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <FaTiktok size={25} />
              </a>
              <a href="#" className="text-white hover:text-primary">
                <Facebook size={25} />
              </a>
            </div>
            <div className='flex mt-6'>
              <Mail size={18} className="mr-2 text-white" />
              <p className='font-extralight'>contact@spinliving.fr</p>
            </div>
          </div>

          <div>
          {/* Utilisation du composant NewsletterSignup */}
          <NewsletterSignup />
          </div>
          
          <div className='justify-self-center'>
            <h3 className="text-lg font-semibold text-white mb-4">Informations légales</h3>
            <ul className="space-y-2">
              <li className="flex items-center font-extralight hover:text-primary">
                <a href="">Mentions légales</a>
              </li>
              <li className="flex items-center text-muted-foreground font-extralight hover:text-primary">
                <a href="">Conditions générales d'utilisation</a>
              </li>
              <li className="flex items-center text-muted-foreground font-extralight hover:text-primary">
                <a href="">Données personnelles</a>
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