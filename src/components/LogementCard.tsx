"use client";

import { MapPin, Bed, ShowerHead, Users, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogementCompletData } from "@/lib/appwrite";
import { useRouter } from "next/navigation"; // Utilisez navigation, pas router

export function LogementCard({ logement }: { logement: LogementCompletData }) {
  const router = useRouter();
  
  // Récupérer la première photo disponible
  const getPhotoUrl = () => {
    if (logement.photos && (logement.photos["1"] || logement.photos["2"] || logement.photos["3"] || logement.photos["4"] || logement.photos["5"])) {
      return logement.photos["1"] || logement.photos["2"] || logement.photos["3"] || logement.photos["4"] || logement.photos["5"];
    }
    return "/placeholder.jpg";
  };
  
  // Déterminer si le logement est disponible
  const isDisponible = () => {
    const dateDispoStr = logement.datedispo;
    if (!dateDispoStr) return false;
    
    const dateDispo = new Date(dateDispoStr);
    const today = new Date();
    return dateDispo <= today;
  };

  return (
    <Card className="bg-[#19191b] border-0 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img
          src={getPhotoUrl()}
          alt={logement.titre}
          className="w-full h-44 object-cover"
        />
        {logement.prix && (
          <div className="absolute top-3 right-3 bg-[#ff5734] text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
            {logement.prix}€/nuit
          </div>
        )}
      </div>
      <CardContent className="flex flex-col flex-1 px-4 py-4">
        <div className="font-semibold text-lg text-white truncate mb-1">
          {logement.titre}
        </div>
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {logement.adresse ? 
            `${logement.adresse.ville || ''}, ${logement.adresse.adresse || ''}` : 
            "Adresse inconnue"}
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
          className="mt-auto w-full bg-[#ff5734] hover:bg-[#e94c2d] text-white font-semibold py-2 rounded-lg transition"
          onClick={() => router.push(`/logement/${logement.publicId || logement.$id}`)}
        >
          Voir détails
        </button>
      </CardContent>
    </Card>
  );
}