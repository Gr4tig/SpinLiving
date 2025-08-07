import React, { useEffect, useState } from 'react';
import { LogementCompletData, rechercherLogementsComplets } from '@/lib/appwrite';
import { LogementCard } from '@/components/LogementCard';
import { Loader2 } from 'lucide-react';

interface ListingsLogementsProps {
  searchParams?: any; // Paramètres de recherche
}

export function ListingsLogements({ searchParams = {} }: ListingsLogementsProps) {
  const [logements, setLogements] = useState<LogementCompletData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogements() {
      try {
        setLoading(true);
        console.log("⏳ Chargement des logements avec paramètres:", searchParams);
        
        // Utiliser la nouvelle fonction basée sur getLogementComplet
        const results = await rechercherLogementsComplets(searchParams);
        
        console.log(`✅ ${results.length} logements trouvés au total`);
        
        // Vérification des résultats pour débogage
        if (results.length > 0) {
          console.log("Premier logement:", {
            id: results[0].$id,
            titre: results[0].titre,
            hasAdresse: !!results[0].adresse,
            hasPhotos: !!results[0].photos,
            adresseVille: results[0].adresse?.ville || "Non définie",
            photo1: results[0].photos?.["1"] ? "Oui" : "Non"
          });
        }
        
        setLogements(results);
        setError(null);
      } catch (err) {
        console.error('❌ Erreur lors du chargement des logements:', err);
        setError('Une erreur est survenue lors du chargement des logements.');
      } finally {
        setLoading(false);
      }
    }

    fetchLogements();
  }, [searchParams]); // Réexécuter lorsque les paramètres de recherche changent

  useEffect(() => {
  console.log("Logements avec distances:", logements.map(l => ({
    id: l.$id,
    titre: l.titre,
    distanceAdresse: l.adresse?.distance,
  })));
}, [logements]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff5734]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-[#ff5734]">{error}</div>;
  }

  if (logements.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium mb-2">Aucun logement trouvé</h3>
        <p className="text-gray-400">
          Essayez de modifier vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {logements.map((logement) => (
          <LogementCard 
            key={logement.$id} 
            logement={logement} 
            distance={logement.adresse?.distance}
          />
        ))}
      </div>
    </div>
  );
}