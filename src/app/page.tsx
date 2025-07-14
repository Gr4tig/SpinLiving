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

      <section>
        <div className="text-center mb-20 pt-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-6">
            Vous vivez entre deux villes,
            </h1>
            <p className="text-2xl md:text-3xl text-white/80 max-w-2xl mx-auto mb-8">
            Désormais vous vivez dans deux villes. 
            </p>

          </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mx-auto px-4 sm:px-6 lg:px-8">
        <Carte 
          icon={<Building2 className="w-8 h-8 text-primary" />}
          title="Deux villes, deux activités"
          text="Avec Spin Living, trouvez facilement une colocation dans chaque ville, en fonction de votre planning."
        />
        <Carte 
          icon={<CircleDollarSign className="w-8 h-8 text-primary" />}
          title="Ça vous côute super cher ?"
          text="Spin Living vous permet de partager le loyer en ne payant que pour les nuits réellement utilisées."
        />

        <Carte 
          icon={<Moon className="w-8 h-8 text-primary" />}
          title="Besoin de simplicité"
          text="Trouvez votre appart en quelques clics auprès de notre réseau de colocations. Moins de galère, plus de liberté."
        />    
        </div>
        <div className="text-center mt-12">
        <Button className='px-10 py-7 text-lg text-base rounded-xl'>
          <Link href="/logement/recherche">Découvrir</Link>
        </Button>
        </div>
      </section>

      <section>
        <div className='bg-white/5 rounded-lg border-2 border-white/10 grid grid-cols-3 p-8 ml-10 mr-10 mt-32'>
        <div className="flex flex-col items-center p-6">
          <Image
            src="/icone1.png"
            alt="Cherchez"
            width={100}
            height={100}
            className="mb-2"
          />
          <h3 className='text-4xl text-bold mt-6'>Cherchez</h3>
        </div>
        <div className="flex flex-col items-center p-6">
          <Image
            src="/icone2.png"
            alt="Cherchez"
            width={100}
            height={100}
            className="mb-2"
          />
          <h3 className='text-4xl text-bold mt-6'>Entrez en relation</h3>
        </div>
        <div className="flex flex-col items-center p-6">
          <Image
            src="/icone3.png"
            alt="Cherchez"
            width={100}
            height={100}
            className="mb-2"
          />
          <h3 className='text-4xl text-bold mt-6'>Réservez</h3>
        </div>
        </div>

      </section>

      <section className="max-w-[80vw] mx-auto mt-32 rounded-lg p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-10">
            La colocation de courte durée 
          </h2>
          <p className="text-lg md:text-xl text-white/80 mx-auto mb-16">
          Louer un logement à plein temps quand on se déplace souvent n’est ni économique, ni pratique.
          <br />
          La colocation rotative offre une alternative :
          </p>
        </div>
        <div className="grid grid-cols-[2fr_1fr] items-center">
            {/* Colonne texte */}
            <div>
            <ul className="space-y-3">
              <li className="flex text-lg items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle className="text-primary" />
                <span>Partager un logement avec d’autres personnes aux besoins similaires,</span>
              </li>
              <li className="flex text-lg items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle className="text-primary" />
                <span>L’occuper seulement quand nécessaire,</span>
              </li>
              <li className="flex text-lg items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle className="text-primary" />
                <span>Payer que pour le temps réellement utilisé</span>
              </li>
              <li className="flex text-lg items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle className="text-primary" />
                <span>Le tout dans un cadre convivial et flexible.</span>
              </li>
            </ul>
          </div>
          {/* Colonne image */}
          <div className="flex justify-start self-end -ml-24">
            <Image
              src="/groupe-travail1.png"
              alt="Description"
              width={400}
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
        <div className="text-center mt-12">
        <Button className='px-10 py-7 text-lg text-base rounded-xl'>
          <Link href="/logement/recherche">Recherchez votre Spin</Link>
        </Button>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-morphism rounded-2xl p-8 md:p-12 bg-white/5 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gradient mb-4">Vous êtes propriétaire d’une colocation </h2>
                <p className="text-muted-foreground mb-6 text-white/60 text-sm">
                  Nous vous accompagnons de A à Z pour mettre a disposition votre appartement, et vous avez beaucoup a y gagner !
                </p>
                  <Link href="/register">
                    <Button size="lg">Découvrir SpinLiving</Button>
                  </Link>
              </div>
              <div className="flex justify-end self-end -ml-24">
                  <Image
                  src="/logement.png"
                  alt="Description"
                  width={450}
                  height={450}
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      

      <Footer />
    </div>
  );
};

export default Index;