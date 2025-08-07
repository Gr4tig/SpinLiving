// Interface pour les données d'une ville
export interface CityData {
    nom: string;
    code: string;
    codeDepartement: string;
    codeRegion: string;
    codesPostaux: string[];
    population: number;
    centre?: {
      coordinates: [number, number]; // [longitude, latitude]
    };
    _score?: number;
  }
  
  /**
   * Recherche des villes par nom
   */
  export async function searchCities(search: string, limit: number = 10): Promise<CityData[]> {
    try {
      if (!search || search.length < 2) return [];
      
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(search)}&boost=population&limit=${limit}&fields=nom,code,codeDepartement,codeRegion,codesPostaux,population,centre`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
      return [];
    }
  }
  
  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   * @param lat1 Latitude du premier point
   * @param lon1 Longitude du premier point
   * @param lat2 Latitude du deuxième point
   * @param lon2 Longitude du deuxième point
   * @returns Distance en kilomètres
   */
  export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    
    return distance;
  }
  
  /**
   * Récupère les informations d'une ville à partir de son code
   */
  export async function getCityByCode(code: string): Promise<CityData | null> {
    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes/${code}?fields=nom,code,codeDepartement,codeRegion,codesPostaux,population,centre`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la ville:', error);
      return null;
    }
  }