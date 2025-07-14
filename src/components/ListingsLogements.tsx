"use client";

import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { LogementCard } from "@/components/LogementCard";
import { Card } from "@/components/ui/card";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_LOGEMENT_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGEMENT_ID!;

export function ListingsLogements() {
  const [logements, setLogements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogements() {
      setLoading(true);
      try {
        const res = await databases.listDocuments(DB_ID, COLLECTION_LOGEMENT_ID, []);
        setLogements(res.documents);
      } catch (e) {
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
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6 items-center justify-center">
        {logements.map((logement) => (
          <LogementCard key={logement.$id} logement={logement} />
        ))}
      </div>
    </section>
  );
}