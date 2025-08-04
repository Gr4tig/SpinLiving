"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { equipementMapping, getLogementByPublicId, LogementCompletData } from "@/lib/appwrite"; // Import modifié
import { Button } from "@/components/ui/button";
import { Card, CardSpin } from "@/components/ui/card";
import { MapPin, Calendar, Users, Home, Bath, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatEquipements } from "@/lib/appwrite";
import { Wifi, UtensilsCrossed, WashingMachine, Car, Sun, Snowflake } from "lucide-react";

// Fonction pour obtenir l'icône d'un équipement
function getEquipementIcon(type: string) {
  switch(type) {
    case "wifi": return <Wifi className="h-6 w-6 text-primary mr-1" />;
    case "cuisine": return <UtensilsCrossed className="h-6 w-6 text-primary mr-1" />;
    case "machine": return <WashingMachine className="h-6 w-6 text-primary mr-1" />;
    case "parking": return <Car className="h-6 w-6 text-primary mr-1" />;
    case "terrasse": return <Sun className="h-6 w-6 text-primary mr-1" />;
    case "climatisation": return <Snowflake className="h-6 w-6 text-primary mr-1" />;
    default: return null;
  }
}

// Fonction pour convertir un équipement en libellé lisible
function getEquipementLabel(type: string): string {
  switch(type) {
    case "wifi": return "Wi-Fi";
    case "cuisine": return "Cuisine équipée";
    case "machine": return "Machine à laver";
    case "parking": return "Parking";
    case "terrasse": return "Terrasse/Balcon";
    case "climatisation": return "Climatisation";
    default: return type;
  }
}

export default function LogementDetails() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string; // Renommé de id à slug

  const [logement, setLogement] = useState<LogementCompletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLogement() {
      if (!slug) return;

      setLoading(true);
      try {
        // Utiliser getLogementByPublicId au lieu de getLogementComplet
        const data = await getLogementByPublicId(slug);
        setLogement(data);

        // Extract photos
        if (data?.photos) {
          const photoArray: string[] = [];
          for (let i = 1; i <= 5; i++) {
            const key = i.toString() as "1" | "2" | "3" | "4" | "5";
            if (data.photos[key]) {
              photoArray.push(data.photos[key]!);
            }
          }
          setPhotos(photoArray);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du logement:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogement();
  }, [slug]);

  // Le reste du composant reste inchangé
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  if (!logement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <h2 className="text-xl mb-4">Logement non trouvé</h2>
          <Button onClick={() => router.push("/logement")}>
            Retour aux logements
          </Button>
        </Card>
      </div>
    );
  }

  const isDisponible = () => {
    const dateDispoStr = logement.datedispo;
    if (!dateDispoStr) return false;
    
    const dateDispo = new Date(dateDispoStr);
    const today = new Date();
    return dateDispo <= today;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container py-10 px-4 sm:px-6 lg:px-8 mt-10">
        <Button
          variant="ghost"
          className="mb-6 flex items-center"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux résultats
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partie gauche: Photos et infos */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos gallery */}
            <CardSpin className="p-0">
              <div className="aspect-video overflow-hidden mb-10 rounded-t-xl">
                {photos.length > 0 ? (
                  <img
                    src={photos[selectedPhotoIndex]}
                    alt={logement.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-400">Aucune photo</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 p-4 mb-3">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-none w-24 h-16 rounded-lg overflow-hidden ${
                        index === selectedPhotoIndex
                          ? "ring-2 ring-primary"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardSpin>

            
            {/* Titre et adresse */}
            <CardSpin>
            <div>
              <h1 className="text-3xl font-bold mb-3">{logement.titre}</h1>
              <div className="flex items-center text-gray-400 mb-2">
                <MapPin className="mr-1 h-5 w-5" />
                {logement.adresse ? (
                  <span>{`${logement.adresse.adresse}, ${logement.adresse.code_postal} ${logement.adresse.ville}`}</span>
                ) : (
                  "Adresse non disponible"
                )}
              </div>
            </div>
            

            {/* Caractéristiques */}
            <div className="flex flex-wrap gap-6 bg-[#1A1A1A] p-4 rounded-lg">
              {logement.nombreColoc && (
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  <span>
                    Capacité: {logement.nombreColoc} personne{logement.nombreColoc > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {logement.m2 && (
                <div className="flex items-center">
                  <Home className="mr-2 h-5 w-5 text-primary" />
                  <span>{logement.m2} m²</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                <span>
                  {isDisponible() 
                    ? "Disponible maintenant" 
                    : `Disponible à partir du ${format(new Date(logement.datedispo), 'dd MMMM yyyy', { locale: fr })}`}
                </span>
              </div>
              
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Description</h2>
              <div className="text-gray-300 whitespace-pre-line">
                {logement.description}
              </div>
            </div>
            

            <div className="items-center mt-4">
              <span className="font-bold text-lg mr-1">Équipement</span>
              <div className="flex flex-wrap gap-4 mt-3">
                {Array.isArray(logement.equipement) ? (
                  // Cas où equipements est un tableau
                  logement.equipement.map((eq) => (
                    <span key={eq} className="flex items-center">
                      {getEquipementIcon(eq)}
                      {getEquipementLabel(eq)}
                    </span>
                  ))
                ) : logement.equipement ? (
                  // Cas où equipement est une chaîne
                  <span className="flex items-center">
                    {getEquipementIcon(logement.equipement)}
                    {getEquipementLabel(logement.equipement)}
                  </span>
                ) : (
                  // Cas où aucun équipement n'est spécifié
                  "Aucun équipement spécifié"
                )}
              </div>
            </div>
            </CardSpin>
          </div>
              

          {/* Partie droite: Réservation et proprio */}
          <div className="space-y-6">
            <Card className="p-6 bg-[#19191B] border-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Réserver ce logement</h2>
                  <div className="text-primary font-bold">
                    {isDisponible() ? "Disponible" : "À venir"}
                  </div>
                </div>

                {/* Prix s'il existe */}
                {logement.prix && (
                  <div className="text-xl font-bold text-center">
                    {logement.prix}€/nuit
                  </div>
                )}

                {/* Dates de disponibilité */}
                <div className="py-2 border-t border-b border-gray-800">
                  <div className="flex items-center mb-1">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Disponible {isDisponible() ? "maintenant" : `à partir du ${format(new Date(logement.datedispo), 'dd/MM/yyyy', { locale: fr })}`}
                    </span>
                  </div>
                </div>

                {/* Bouton de sélection de date */}
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Sélectionner une date d'arrivée
                </Button>

                {/* Bouton de contact */}
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Je souhaite être contacté
                </Button>
              </div>
            </Card>

            {/* À propos du propriétaire */}
            <Card className="p-6 bg-[#19191B] border-0">
                <h3 className="text-lg font-semibold mb-4">À propos du propriétaire</h3>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {logement.proprio?.photo ? (
                        <img 
                        src={logement.proprio.photo} 
                        alt="Propriétaire"
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-xl font-bold text-white">
                        P
                        </span>
                    )}
                    </div>
                    <div>
                    <p className="font-medium">
                        {logement.proprio 
                        ? `${logement.proprio.prenom || ""} ${logement.proprio.nom || ""}`
                        : "Propriétaire"}
                    </p>
                    <p className="text-sm text-gray-400">
                        Utilisateur depuis {logement.proprio?.$createdAt ? format(new Date(logement.proprio.$createdAt), 'yyyy', { locale: fr }) : "Date non disponible"}
                    </p>
                    </div>
                </div>
                </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}