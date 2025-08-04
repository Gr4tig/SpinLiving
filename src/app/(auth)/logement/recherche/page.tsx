"use client";


import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { HeroSearch } from '@/components/home/hero-search';
import { ConceptSection } from '@/components/home/concept-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { logout } from '@/lib/appwrite';
import { Carte } from '@/components/ui/carte';
import { Check, CheckCircle, Building2, CircleDollarSign, Moon } from 'lucide-react';
import { ListingsLogements } from '@/components/ListingsLogements';

const Index = () => {

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section avec image de fond et overlay */}
      <section className="pt-28 pb-16 md:pt-52 md:pb-36 px-4 sm:px-6 lg:px-8 relative">
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
            alt="Appartement moderne" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/30 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-6">
            La colocation dont vous avez besoin
            </h1>
            <p className="text-3xl md:text-3xl text-white/80 max-w-2xl mx-auto mb-14">
             Vous pouvez enfin vous déplacer sans vous ruiner 
            </p>
            <div>
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center w-full">
        <ListingsLogements />
        </section>
      <Footer />
    </div>
  );
};

export default Index;