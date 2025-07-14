"use client";

import { useEffect, useState } from "react";
import { getCurrentUserId, getProprioDocIdByUserId } from "@/lib/appwrite";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_LOGEMENT_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGEMENT_ID!;

export default function MesAnnonces() {
  const [logements, setLogements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnonces() {
      setLoading(true);
      try {
        // 1. ID utilisateur connecté
        const userId = await getCurrentUserId();
        if (!userId) return setLoading(false);

        // 2. ID du document propriétaire
        const proprioDocId = await getProprioDocIdByUserId(userId);
        if (!proprioDocId) return setLoading(false);

        // 3. Requête : tous les logements où le champ relationnel proprio = ce proprioDocId
        const res = await databases.listDocuments(DB_ID, COLLECTION_LOGEMENT_ID, [
          Query.equal("proprio", [proprioDocId]),
          Query.orderDesc("$createdAt"),
        ]);
        setLogements(res.documents);
      } catch (e) {
        setLogements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnonces();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Mes annonces</h2>
      {loading && <p>Chargement…</p>}
      {!loading && logements.length === 0 && <p>Vous n'avez pas encore publié d'annonce.</p>}
      {!loading && logements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {logements.map((logement) => (
            <Card key={logement.$id}>
              <CardHeader>
                <CardTitle>{logement.titre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">{logement.adresse}</div>
                {logement.photo1 && (
                  <img src={logement.photo1} alt={logement.titre} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <div className="text-sm">{logement.description?.slice(0, 120)}…</div>
                <div className="mt-2 text-xs text-gray-400">
                  {logement.nombreColoc} coloc | {logement.m2} m² | {logement.equipement}
                </div>
                <div className="text-xs text-gray-400">
                  Disponible le {logement.datedispo ? new Date(logement.datedispo).toLocaleDateString("fr-FR") : "-"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}