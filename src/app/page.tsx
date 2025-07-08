"use client";


import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { HeroSearch } from '@/components/home/hero-search';
import { ConceptSection } from '@/components/home/concept-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/appwrite';

const Index = () => {

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section avec image de fond et overlay */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 relative">
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
              Votre colocation flexible
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
              Trouvez rapidement une colocation de courte durée, de 2 nuits à 1 mois, idéale pour les alternances et déplacements professionnels.
            </p>
            <div>
              <HeroSearch />
            </div>

          </div>
        </div>
      </section>

      {/* Concept Section */}
      <ConceptSection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-morphism rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gradient mb-4">Prêt à rejoindre la communauté Spin Living ?</h2>
                <p className="text-muted-foreground mb-6">
                  Que vous soyez propriétaire ou locataire, créez votre compte et commencez dès aujourd'hui à profiter d'une nouvelle façon de vivre la colocation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg">S'inscrire maintenant</Button>
                  </Link>
                  <Link href="/search">
                    <Button size="lg" variant="outline">Explorer les logements</Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                  alt="Communauté Spin Living" 
                  className="rounded-xl object-cover w-full h-80 opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      

      <Footer />
      <Button onClick={handleLogout} className="bg-primary text-white">
              Se déconnecter
            </Button>
    </div>
  );
};

export default Index;