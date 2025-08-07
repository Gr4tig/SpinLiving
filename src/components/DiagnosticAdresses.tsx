"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ADRESSES_ID } from '@/lib/appwrite';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function DiagnosticAdresses() {
  const [loading, setLoading] = useState(false);
  const [adresses, setAdresses] = useState<any[]>([]);
  const [reference, setReference] = useState({
    lat: 48.8566, // Paris
    lon: 2.3522
  });

  async function analyserAdresses() {
    try {
      setLoading(true);
      
      // Récupérer toutes les adresses
      const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ADRESSES_ID,
        []
      );
      
      // Ajouter la distance à partir du point de référence
      const adressesAvecDistance = result.documents.map(adresse => {
        let distance = null;
        
        if (adresse.latitude && adresse.longitude) {
          distance = calculateDistance(
            reference.lat,
            reference.lon,
            adresse.latitude,
            adresse.longitude
          );
        }
        
        return {
          ...adresse,
          distance: distance ? Math.round(distance * 10) / 10 : null
        };
      });
      
      // Trier par distance (adresses sans coordonnées à la fin)
      const triees = adressesAvecDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      setAdresses(triees);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-[#19191b] rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-4">Diagnostic des adresses</h2>
      
      <Button 
        onClick={analyserAdresses} 
        disabled={loading}
        className="mb-6 bg-[#ff5734] hover:bg-[#e94c2d]"
      >
        {loading ? "Analyse en cours..." : "Analyser toutes les adresses"}
      </Button>
      
      {adresses.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-left">Ville</th>
                <th className="py-2 px-4 text-left">Code</th>
                <th className="py-2 px-4 text-left">Coordonnées</th>
                <th className="py-2 px-4 text-left">Distance de Paris</th>
                <th className="py-2 px-4 text-left">ID Logement</th>
              </tr>
            </thead>
            <tbody>
              {adresses.map(adresse => (
                <tr key={adresse.$id} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="py-2 px-4">{adresse.ville || "-"}</td>
                  <td className="py-2 px-4">{adresse.ville_code || "-"}</td>
                  <td className="py-2 px-4">
                    {adresse.latitude && adresse.longitude ? 
                      `${adresse.latitude}, ${adresse.longitude}` : 
                      <span className="text-red-400">Manquantes</span>}
                  </td>
                  <td className="py-2 px-4">
                    {adresse.distance !== null ? 
                      `${adresse.distance} km` : 
                      <span className="text-red-400">Non calculable</span>}
                  </td>
                  <td className="py-2 px-4 font-mono text-sm">
                    {typeof adresse.logement === 'object' ? 
                      adresse.logement.$id?.substring(0, 8) + '...' : 
                      adresse.logement?.substring(0, 8) + '...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}