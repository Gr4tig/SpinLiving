"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ADRESSES_ID, getLogementComplet } from '@/lib/appwrite';
import { Query } from 'appwrite';

export function VerifierLogement() {
  const [adresseId, setAdresseId] = useState("68936f59...");  // ID de l'adresse Paris trouvée
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function verifier() {
    try {
      setLoading(true);
      setResult(null);
      
      // 1. Récupérer l'adresse
      const adresse = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ADRESSES_ID,
        adresseId
      );
      
      if (!adresse.logement) {
        setResult({
          success: false,
          message: "Cette adresse n'est associée à aucun logement!"
        });
        return;
      }
      
      // 2. Récupérer le logement associé
      const logement = await getLogementComplet(adresse.logement);
      
      setResult({
        success: true,
        adresse,
        logement
      });
    } catch (error) {
      console.error("Erreur:", error);
      setResult({
        success: false,
        message: String(error)
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-[#19191b] rounded-lg border border-gray-800 mt-8">
      <h2 className="text-xl font-bold mb-4">Vérifier l'association adresse-logement</h2>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm text-gray-400 mb-1 block">ID de l'adresse</label>
          <Input 
            value={adresseId} 
            onChange={e => setAdresseId(e.target.value)}
            placeholder="ID de l'adresse à vérifier"
            className="bg-[#242426]"
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={verifier} 
            disabled={loading || !adresseId}
            className="bg-[#ff5734] hover:bg-[#e94c2d]"
          >
            Vérifier
          </Button>
        </div>
      </div>

      {loading && <div className="text-center p-4">Vérification en cours...</div>}

      {result && (
        <div className="mt-4">
          {!result.success ? (
            <div className="text-red-500">{result.message}</div>
          ) : (
            <div className="bg-[#242426] p-4 rounded">
              <h3 className="font-bold mb-2">Résultat:</h3>
              
              <div className="mb-4">
                <div className="font-bold">Adresse</div>
                <div>ID: {result.adresse.$id}</div>
                <div>Ville: {result.adresse.ville}</div>
                <div>Adresse: {result.adresse.adresse}</div>
                <div>Logement ID: {result.adresse.logement}</div>
              </div>
              
              <div>
                <div className="font-bold">Logement associé</div>
                {result.logement ? (
                  <>
                    <div>ID: {result.logement.$id}</div>
                    <div>Titre: {result.logement.titre}</div>
                    <div>Description: {result.logement.description?.substring(0, 100)}...</div>
                  </>
                ) : (
                  <div className="text-red-500">Logement introuvable</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}