"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ADRESSES_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export function DiagnosticRecherche() {
  const [ville, setVille] = useState("Paris");
  const [code, setCode] = useState("75056");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  async function runDiagnostic() {
    try {
      setLoading(true);
      setResults(null);

      console.log(`🔍 Diagnostic de recherche pour la ville: ${ville}, code: ${code}`);
      
      // 1. Récupérer toutes les adresses
      const adresses = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ADRESSES_ID,
        []
      );
      
      // 2. Filtrer les adresses pour cette ville (de manière souple)
      const adressesCorrespondantes = adresses.documents.filter(adresse => {
        const villeAdresse = (adresse.ville || '').toLowerCase();
        const villeRecherche = ville.toLowerCase();
        return villeAdresse.includes(villeRecherche) || villeRecherche.includes(villeAdresse);
      });
      
      // 3. Vérifier quelles adresses ont des coordonnées
      const avecCoordonnees = adressesCorrespondantes.filter(
        adresse => adresse.latitude !== undefined && adresse.longitude !== undefined
      );
      
      // 4. Si code ville fourni, vérifier les adresses avec ce code
      let adressesAvecCode = [];
      if (code) {
        adressesAvecCode = adresses.documents.filter(
          adresse => adresse.ville_code === code
        );
      }

      const diagnostic = {
        total: adresses.documents.length,
        ville: {
          correspondances: adressesCorrespondantes.map(a => ({
            id: a.$id, 
            ville: a.ville, 
            hasCoords: !!(a.latitude && a.longitude),
            logementId: a.logement
          })),
          avecCoordonnees: avecCoordonnees.map(a => ({
            id: a.$id,
            ville: a.ville,
            coords: [a.longitude, a.latitude],
            logementId: a.logement
          }))
        },
        code: code ? {
          correspondances: adressesAvecCode.map(a => ({
            id: a.$id,
            ville: a.ville,
            code: a.ville_code,
            logementId: a.logement
          }))
        } : null
      };

      setResults(diagnostic);
    } catch (error) {
      console.error("Erreur lors du diagnostic:", error);
      setResults({ error: String(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-[#19191b] rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-4">Diagnostic de recherche</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm text-gray-400 mb-1 block">Ville</label>
          <Input 
            value={ville} 
            onChange={e => setVille(e.target.value)}
            placeholder="Ex: Paris"
            className="bg-[#242426]"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-400 mb-1 block">Code INSEE (optionnel)</label>
          <Input 
            value={code} 
            onChange={e => setCode(e.target.value)}
            placeholder="Ex: 75056"
            className="bg-[#242426]"
          />
        </div>
        <div className="flex items-end">
          <Button 
            onClick={runDiagnostic} 
            disabled={loading}
            className="bg-[#ff5734] hover:bg-[#e94c2d]"
          >
            Analyser
          </Button>
        </div>
      </div>

      {loading && <div className="text-center p-4">Analyse en cours...</div>}

      {results && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Résultats:</h3>
          
          {results.error ? (
            <div className="text-red-500">{results.error}</div>
          ) : (
            <div className="bg-[#242426] p-4 rounded overflow-auto max-h-96">
              <div className="mb-2">
                <span className="font-bold">Total d'adresses:</span> {results.total}
              </div>
              
              <div className="mb-2">
                <span className="font-bold">Adresses correspondant à "{ville}":</span> {results.ville.correspondances.length}
              </div>
              
              <div className="mb-2">
                <span className="font-bold">Adresses avec coordonnées:</span> {results.ville.avecCoordonnees.length}
              </div>
              
              {code && (
                <div className="mb-2">
                  <span className="font-bold">Adresses avec le code "{code}":</span> {results.code?.correspondances.length || 0}
                </div>
              )}
              
              {results.ville.correspondances.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Adresses trouvées:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.ville.correspondances.map(addr => (
                      <li key={addr.id}>
                        {addr.ville} - ID: {addr.id.slice(0, 8)}... 
                        {addr.hasCoords ? ' (avec coordonnées)' : ' (sans coordonnées)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}