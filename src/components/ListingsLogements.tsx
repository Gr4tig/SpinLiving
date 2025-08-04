"use client";

import { useEffect, useState } from "react";
import { databases, getLogementComplet, migrateLogementToPublicIds, LogementCompletData } from "@/lib/appwrite";
import { LogementCard } from "@/components/LogementCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_LOGEMENT_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGEMENT_ID!;

export function ListingsLogements() {
  const [logements, setLogements] = useState<LogementCompletData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogements() {
      setLoading(true);
      try {
        // 1. Récupérer les documents de logement de base
        const res = await databases.listDocuments(DB_ID, COLLECTION_LOGEMENT_ID, []);
        
        // 2. Pour chaque logement, récupérer ses données complètes (adresse + photos)
        const logementsComplets = await Promise.all(
          res.documents.map(async (logement) => {
            return await getLogementComplet(logement.$id) || null;
          })
        );
        
        // 3. Filtrer les résultats null
        setLogements(logementsComplets.filter(Boolean) as LogementCompletData[]);

        // 4. Vérifier si des logements n'ont pas de publicId
        const needsMigration = logementsComplets.some(
          (logement) => logement && (!logement.publicId || logement.publicId === 'no-slug')
        );

        if (needsMigration) {
          console.warn("Certains logements n'ont pas de publicId. Une migration est recommandée.");
        }
      } catch (e) {
        console.error("Erreur lors du chargement des logements:", e);
        setLogements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogements();
  }, []);

  return (
    <section className="container py-10 text-center w-4/5">
      <h2 className="text-2xl font-bold mb-6">Les dernières offres</h2>
      {loading && <p>Chargement…</p>}
      {!loading && logements.length === 0 && (
        <Card className="p-6 text-center text-gray-500">Aucun logement trouvé.</Card>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center justify-center">
        {logements.map((logement) => (
          <LogementCard key={logement.$id} logement={logement} />
        ))}
      </div>
    </section>
  );
}