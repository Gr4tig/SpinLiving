import { MapPin, Bed, ShowerHead, Users, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Logement = {
  $id: string;
  titre: string;
  adresse?: string;
  description?: string;
  photo1?: string;
  prix?: number; // en €/nuit
  ville?: string;
  chambres?: number;
  sallesDeBain?: number;
  nombreColoc?: number;
  disponible?: boolean;
};

export function LogementCard({
  logement,
  onVoirDetails,
}: {
  logement: Logement;
  onVoirDetails?: () => void; // optionnel, callback sur clic bouton
}) {
  return (
    <Card className="bg-[#19191b] border-0 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative">
        <img
          src={logement.photo1 || "/placeholder.jpg"}
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
          {logement.ville || logement.adresse || "Ville inconnue"}
        </div>
        <div className="text-gray-300 text-sm mb-3 truncate">
          {logement.description}
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
          <span className="flex items-center"><Bed className="h-4 w-4 mr-1" /> {logement.chambres ?? "?"}</span>
          <span className="flex items-center"><ShowerHead className="h-4 w-4 mr-1" /> {logement.sallesDeBain ?? "?"}</span>
          <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {logement.nombreColoc ?? "?"}</span>
        </div>
        <div className="flex items-center text-sm mb-4">
          <CalendarDays className="h-4 w-4 mr-1 text-[#ff5734]" />
          <span className={logement.disponible ? "text-green-400" : "text-[#ff5734]"}>
            {logement.disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>
        <button
          className="mt-auto w-full bg-[#ff5734] hover:bg-[#e94c2d] text-white font-semibold py-2 rounded-lg transition"
          onClick={onVoirDetails}
        >
          Voir détails
        </button>
      </CardContent>
    </Card>
  );
}