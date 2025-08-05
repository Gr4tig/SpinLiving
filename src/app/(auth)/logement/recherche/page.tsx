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
      <section className="pb-10 px-4 sm:px-6 lg:px-8 relative bg-white/5 pt-20">
        {/* Image de fond avec overlay */}

        <div className="mx-auto relative z-10">
          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-white text-gradient mb-6">
            Rechercher un logement
            </h1>
            <p className="text-lg text-white/80 mx-auto mb-14">
            Trouvez la colocation idéale pour votre séjour de courte durée
            </p>
            <div className="max-w-4xl mx-auto flex justify-center">
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