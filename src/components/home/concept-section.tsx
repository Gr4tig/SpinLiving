'use client';

import { CheckCircle } from 'lucide-react';

export function ConceptSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            Une nouvelle approche de la colocation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une niche immobilière profitable qui maximise l'occupation grâce à un modèle de colocation courte durée, bien plus agile qu'une location classique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Flexibilité maximale"
            description="Locations de 2 nuits à 1 mois, parfait pour les étudiants en alternance et les jeunes professionnels mobiles."
            delay={0.1}
          />
          <FeatureCard
            title="Rentabilité optimisée"
            description="Pour les propriétaires, une occupation continue qui assure un rendement supérieur aux locations classiques."
            delay={0.3}
          />
          <FeatureCard
            title="Simplicité d'utilisation"
            description="Une mise en relation directe entre propriétaires et locataires, sans intermédiaire et sans frais cachés."
            delay={0.5}
          />
        </div>

        <div className="mt-16 glass-morphism rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gradient-primary">Comment ça fonctionne ?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Step 
              number="01"
              title="Créez votre profil"
              description="Inscrivez-vous en tant que propriétaire ou locataire en quelques clics."
            />
            <Step 
              number="02"
              title="Trouvez votre match"
              description="Propriétaires : publiez vos annonces. Locataires : recherchez selon vos critères."
            />
            <Step 
              number="03"
              title="Entrez en contact"
              description="Échangez directement et convenez ensemble des modalités de la location."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ title, description, delay }: FeatureCardProps) {
  return (
    <div
      className="glass-morphism rounded-xl p-6 h-full"
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
      </div> 
  );
}

interface StepProps {
  number: string;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <span className="text-primary font-bold">{number}</span>
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
