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
import { Check, CheckCircle, Building2, CircleDollarSign, Moon, Pencil, Calendar, Users } from 'lucide-react';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

const Proprietaire = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section avec image de fond et overlay */}
      <section className="pt-28 pb-16 md:pt-52 md:pb-36 px-4 sm:px-6 lg:px-8 relative">
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
            src="/arriere-plan-appart.jpg"
            alt="Cherchez"
            width={2000}
            height={2000}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/30 rounded-full filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-6">
            Rentabilisez votre investissement immobilier grâce à la colocation rotative
            </h1>
            <p className="text-3xl md:text-3xl text-white/80 max-w-5xl mx-auto mb-14">
            Faites passer votre colocation à la vitesse supérieure
            </p>
            <div>
            <Button className='px-10 py-7 text-lg text-base rounded-xl'>
                <Link href="/logement/recherche">Mettre mon appartement en ligne</Link>
            </Button>
            </div>

          </div>
        </div>
      </section>

      <section>
        <div className="text-center mb-20 pt-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-6">
            Spin Living c’est :
            </h1>

          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 mx-auto px-4 sm:px-6 lg:px-8">
        <Carte 
          icon={<CircleDollarSign className="w-8 h-8 text-primary" />}
          title="Rentabilitée supérieure "
          text="Vous facturez à la nuit ou à la semaine, ce qui peut augmenter votre rentabilité par rapport à un loyer mensuel unique."
        />
        <Carte 
          icon={<Building2 className="w-8 h-8 text-primary" />}
          title="Optimisation du taux d’occupation"
          text="Réduisez les périodes creuses ou vides entre deux baux. Il vous manque un colocataire, trouvez son remplaçant pour ne pas perdre d’argent."
        />

        <Carte 
          icon={<Moon className="w-8 h-8 text-primary" />}
          title="Flexible"
          text="Vous voulez tester Spin Living un mois puis arrêter, ou l’utiliser de temps en temps si il vous manque un colocataire, c’est comme vous le voulez."
        />    

        <Carte 
          icon={<Moon className="w-8 h-8 text-primary" />}
          title="Compatible"
          text="Vous pouvez alterner entre colocation rotative, ou colocation classique. Vous pouvez même mélanger les deux !"
        />   
        </div>
        <div className="text-center mt-12">
        <Button className='px-10 py-7 text-lg text-base rounded-xl'>
          <Link href="/signup">S'inscrire</Link>
        </Button>
        </div>
      </section>

      <section>
        <div className="text-center mb-20 pt-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-gradient mb-6">
            Comment ça marche ?
            </h1>

          </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-8 mt-16 mx-auto px-4 sm:px-6 lg:px-8">
        <Carte
          className='items-center text-center' 
          icon={
            <span className="inline-flex items-center justify-center bg-[#DEDDDB] rounded-full p-3">
            <Pencil className="w-8 h-8 text-primary" />
          </span>
          }
          title="Créez une annonce"
          text="Décrivez votre bien et publiez votre annonce en quelques minutes seulement."
        />
        <Carte
          className='items-center text-center' 
          icon={
            <span className="inline-flex items-center justify-center bg-[#DEDDDB] rounded-full p-3">
            <Calendar className="w-8 h-8 text-primary" />
          </span>
          }
          title="Choisissez vos dates"
          text="Définissez les périodes pendant lesquelles votre bien est disponible."
        />

        <Carte 
          className='items-center text-center'  
          icon={ 
            <span className="inline-flex items-center justify-center bg-[#DEDDDB] rounded-full p-3">
            <Users className="w-8 h-8 text-primary" />
          </span>
          }
          title="Recevez des locataires vérifiés"
          text="Choisissez vous même vos colocataires en fonction de vos besoins"
        />    
        </div>
        </section>

        <section>
            <TestimonialsSection />
        </section>

      

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="glass-morphism rounded-2xl p-8 md:p-12 mx-auto bg-white/5 border border-white/10 max-w-7xl flex flex-col items-center justify-center gap-2">
                <h2 className="text-3xl font-bold text-gradient text-center mb-4">Téléchargez notre guide complet, gratuit. </h2>
                <p className="text-muted-foreground mb-6 text-white/60 text-center text-sm">
                Apprenez tout ce qu’il faut savoir sur la colocation rotative
                </p>
                <Button className='px-10 py-7 text-lg text-base rounded-xl self-center'>
                    <Link href="/signup">Guide complet colocation rotative (pdf)</Link>
                </Button>
            </div>
      </section>
      

      <Footer />
    </div>
  );
};

export default Proprietaire;