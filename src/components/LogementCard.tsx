"use client";

import { useState } from "react";
import { MapPin, Bed, ShowerHead, Users, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogementCompletData } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface LogementCardProps {
  logement: LogementCompletData;
  distance?: number; // Distance en km (optionnel)
}

export function LogementCard({ logement, distance }: LogementCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  // Récupérer la première photo disponible avec gestion d'erreur améliorée
  const getPhotoUrl = () => {
    if (!logement.photos) return "/placeholder.jpg";
    
    // Essayer chaque photo dans l'ordre jusqu'à en trouver une valide
    const firstAvailablePhoto = 
      logement.photos["1"] || 
      logement.photos["2"] || 
      logement.photos["3"] || 
      logement.photos["4"] || 
      logement.photos["5"];
    
    return firstAvailablePhoto || "/placeholder.jpg";
  };
  
  // Déterminer si le logement est disponible
  const isDisponible = () => {
    const dateDispoStr = logement.datedispo;
    if (!dateDispoStr) return false;
    
    const dateDispo = new Date(dateDispoStr);
    const today = new Date();
    return dateDispo <= today;
  };

  // Construire l'adresse affichée avec gestion d'erreur
  const getAdresseDisplay = () => {
    if (!logement.adresse) return "Adresse inconnue";
    
    const ville = logement.adresse.ville || "";
    const adresseDetail = logement.adresse.adresse || "";
    
    if (ville && adresseDetail) {
      return `${ville}, ${adresseDetail}`;
    } else if (ville) {
      return ville;
    } else if (adresseDetail) {
      return adresseDetail;
    } else {
      return "Adresse inconnue";
    }
  };

  return (
      <Card className="bg-[#19191b] border-0 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
        <div className="relative">
          <img
            src={imageError ? "/placeholder.jpg" : getPhotoUrl()}
            alt={logement.titre}
            className="w-full h-44 object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Badge de prix en haut à droite */}
          {logement.prix && (
            <div className="absolute top-3 right-3 bg-[#ff5734] text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
              {logement.prix}€/nuit
            </div>
          )}
          
          {/* Badge de distance REPOSITIONNÉ sous le prix */}
          {((logement as any).distance !== undefined) && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/70 border-0 text-white px-2 py-1">
                <MapPin className="h-3 w-3 mr-1" />
                {(logement as any).distance} km
              </Badge>
            </div>
          )}
        </div>
  
      <CardContent className="flex flex-col flex-1 px-4 py-4">
        <div className="font-semibold text-lg text-white truncate mb-1">
          {logement.titre}
        </div>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {getAdresseDisplay()}
        </div>
        <div className="text-gray-300 text-sm mb-3 line-clamp-2">
          {logement.description}
        </div>
        
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" /> {logement.nombreColoc ?? "?"}
          </span>
          <span className="flex items-center">
            <Bed className="h-4 w-4 mr-1" /> {logement.m2 ? `${logement.m2} m²` : "?"}
          </span>
        </div>
        <div className="flex items-center text-sm mb-4">
          <CalendarDays className="h-4 w-4 mr-1 text-[#ff5734]" />
          <span className={isDisponible() ? "text-green-400" : "text-[#ff5734]"}>
            {isDisponible() ? "Disponible" : "Bientôt disponible"}
          </span>
        </div>
        <button
          className="mt-auto w-full cursor-pointer bg-[#ff5734] hover:bg-[#e94c2d] text-white font-semibold py-2 rounded-lg transition"
          onClick={() => router.push(`/logement/${logement.publicId || logement.$id}`)}
        >
          Voir détails
        </button>
      </CardContent>
    </Card>
  );
}