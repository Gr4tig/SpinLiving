"use client";

import { useState, useEffect, useRef } from "react";
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SingleCalendar } from "@/components/ui/single-calendar";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { LogementCompletData, rechercherLogementsComplets } from '@/lib/appwrite';
import { equipementMapping, EquipementType } from "@/lib/appwrite";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchParams, useRouter } from "next/navigation";
import { LogementCard } from "@/components/LogementCard";

interface CityData {
  nom: string;
  code: string;
  codeDepartement: string;
  codesPostaux: string[];
  population: number;
  centre?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// Fonction d'aide pour récupérer les données de ville à partir de l'API Geo
async function fetchCityDataByName(cityName: string): Promise<CityData | null> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=nom,code,codeDepartement,codesPostaux,population,centre&limit=1`
    );
    if (response.ok) {
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données de ville:", error);
  }
  return null;
}

// Fonction d'aide pour récupérer les données de ville par code INSEE
async function fetchCityDataByCode(cityCode: string): Promise<CityData | null> {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes/${encodeURIComponent(cityCode)}?fields=nom,code,codeDepartement,codesPostaux,population,centre`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données de ville par code:", error);
  }
  return null;
}

const RechercheLogement = () => {
  // États de recherche
  const [ville, setVille] = useState<string>("");
  const [villeData, setVilleData] = useState<CityData | null>(null);
  const [distance, setDistance] = useState<number>(10);
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [nombreColoc, setNombreColoc] = useState<number | null>(null);
  const [dateDisponibilite, setDateDisponibilite] = useState<Date | undefined>(undefined);
  const [equipements, setEquipements] = useState<EquipementType[]>([]);
  
  // États UI
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(true);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState<boolean>(false);
  
  // Référence pour détecter quand la ville passe de remplie à vide
  const previousVilleRef = useRef<string>("");
  
  // Résultats de recherche
  const [filterParams, setFilterParams] = useState<any>({});
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [logements, setLogements] = useState<LogementCompletData[]>([]);
  
  // Récupérer les paramètres d'URL et accès au routeur
  const searchParams = useSearchParams();
  const router = useRouter();

  // Traitement des paramètres d'URL et chargement initial
  useEffect(() => {
    const processUrlParams = async () => {
      if (urlParamsProcessed) return;
      
      const villeParam = searchParams.get('ville');
      const villeCode = searchParams.get('villeCode');
      const latitude = searchParams.get('latitude');
      const longitude = searchParams.get('longitude');
      const distanceMax = searchParams.get('distanceMax');
      const rechercheParRayon = searchParams.get('rechercheParRayon');
      
      // Vérifier si on a un paramètre ville
      if (villeParam) {
        console.log(`🏙️ Paramètre ville détecté: ${villeParam}`);
        
        try {
          // Marquer comme traité pour éviter les répétitions
          setUrlParamsProcessed(true);
          
          // Configurer le champ ville
          setVille(villeParam);
          
          // IMPORTANT: Récupérer explicitement les données complètes de la ville
          let cityData: CityData | null = null;
          
          // Si on a un code ville, utiliser l'API directe
          if (villeCode) {
            console.log(`🔍 Recherche de la ville par code: ${villeCode}`);
            cityData = await fetchCityDataByCode(villeCode);
          } 
          // Sinon rechercher par nom
          else {
            console.log(`🔍 Recherche de la ville par nom: ${villeParam}`);
            cityData = await fetchCityDataByName(villeParam);
          }
          
          if (!cityData) {
            console.error(`❌ Impossible de trouver des données pour la ville: ${villeParam}`);
            setSearchLoading(false);
            return;
          }
          
          console.log("✅ Données de ville récupérées:", cityData);
          
          // Mettre à jour l'état avec les données de ville complètes
          setVilleData(cityData);
          
          // Préparer les filtres pour la recherche
          const filters: any = {
            ville: villeParam,
            villeCode: cityData.code
          };
          
          // Si la ville a des coordonnées, configurer la recherche par rayon
          if (cityData.centre) {
            const parsedDistance = distanceMax ? parseInt(distanceMax) : 10;
            setDistance(parsedDistance);
            
            filters.latitude = cityData.centre.coordinates[1];
            filters.longitude = cityData.centre.coordinates[0];
            filters.distanceMax = parsedDistance;
            filters.rechercheParRayon = true;
            
            console.log(`🌍 Recherche dans un rayon de ${parsedDistance}km autour de ${villeParam}`);
          }
          
          // Vérifier s'il y a d'autres paramètres
          const dateDispoMin = searchParams.get('dateDispoMin');
          if (dateDispoMin) {
            const date = new Date(dateDispoMin);
            if (!isNaN(date.getTime())) {
              setDateDisponibilite(date);
              filters.dateDispoMin = dateDispoMin;
            }
          }
          
          const prixMaxParam = searchParams.get('prixMax');
          if (prixMaxParam) {
            const parsedPrice = parseInt(prixMaxParam);
            if (!isNaN(parsedPrice)) {
              setPrixMax(parsedPrice);
              filters.prixMax = parsedPrice;
            }
          }
          
          const nombreColocParam = searchParams.get('nombreColoc');
          if (nombreColocParam) {
            const parsedNombre = parseInt(nombreColocParam);
            if (!isNaN(parsedNombre)) {
              setNombreColoc(parsedNombre);
              filters.nombreColoc = parsedNombre;
            }
          }
          
          // Calculer le nombre de filtres actifs
          const filterCount = Object.keys(filters).filter(key => 
            !['latitude', 'longitude', 'rechercheParRayon', 'distanceMax'].includes(key)
          ).length;
          
          setActiveFilters(filterCount);
          setFilterParams(filters);
          
          // Exécuter la recherche avec les filtres
          console.log("⏳ Recherche avec filtres:", filters);
          const results = await rechercherLogementsComplets(filters);
          console.log(`✅ ${results.length} logements trouvés`);
          setLogements(results);
          
          // Nettoyer l'URL après la recherche
          setTimeout(() => {
            console.log("🧹 Nettoyage de l'URL");
            router.replace('/logement/recherche', { scroll: false });
          }, 500);
        } catch (error) {
          console.error("❌ Erreur lors de la recherche initiale:", error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        // Pas de paramètre ville, charger tous les logements
        setUrlParamsProcessed(true);
        try {
          console.log("📋 Chargement initial de tous les logements");
          const results = await rechercherLogementsComplets({});
          console.log(`✅ ${results.length} logements chargés`);
          setLogements(results);
        } catch (error) {
          console.error("❌ Erreur lors du chargement initial:", error);
        } finally {
          setSearchLoading(false);
        }
      }
    };
    
    processUrlParams();
  }, [searchParams, urlParamsProcessed, router]);

  // Effet qui surveille les changements dans le champ ville
  useEffect(() => {
    // Si le champ ville vient d'être vidé alors qu'il était rempli avant
    if (previousVilleRef.current && !ville) {
      console.log("🔄 Le champ ville est passé de rempli à vide - Réinitialisation des filtres de localisation");
      resetLocationFilters();
    }
    
    // Mettre à jour la référence pour la prochaine comparaison
    previousVilleRef.current = ville;
  }, [ville]);

  // Fonction pour réinitialiser les filtres de localisation et effectuer une nouvelle recherche
  const resetLocationFilters = async () => {
    try {
      setSearchLoading(true);
      
      // Créer une copie des filtres actuels
      const newFilters = { ...filterParams };
      
      // Supprimer tous les filtres liés à la localisation
      delete newFilters.ville;
      delete newFilters.villeCode;
      delete newFilters.latitude;
      delete newFilters.longitude;
      delete newFilters.distanceMax;
      delete newFilters.rechercheParRayon;
      
      // Recalculer le nombre de filtres actifs
      let newFilterCount = 0;
      if (newFilters.prixMax) newFilterCount++;
      if (newFilters.nombreColoc) newFilterCount++;
      if (newFilters.dateDispoMin) newFilterCount++;
      if (newFilters.equipements && newFilters.equipements.length > 0) newFilterCount++;
      
      // Mettre à jour les états des filtres
      setFilterParams(newFilters);
      setActiveFilters(newFilterCount);
      setVilleData(null); // Réinitialiser les données de ville
      
      // Lancer une nouvelle recherche sans les filtres de localisation
      console.log("🔍 Recherche sans filtres de localisation:", newFilters);
      const results = await rechercherLogementsComplets(newFilters);
      console.log(`✅ ${results.length} logements trouvés sans filtres de localisation`);
      setLogements(results);
    } catch (error) {
      console.error("❌ Erreur lors de la réinitialisation des filtres de localisation:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fonction pour gérer le changement de ville
  const handleVilleChange = (value: string, cityData?: CityData) => {
    console.log(`🏙️ Changement de ville: "${value}"`);
    setVille(value);
    setVilleData(cityData || null);
  };

  // Fonction pour effacer explicitement le champ ville
  const clearVilleField = () => {
    setVille("");
    // La réinitialisation des filtres et la recherche seront gérées par l'effet
  };

  // Appliquer les filtres actuels
  const applyFilters = async () => {
    try {
      setSearchLoading(true);
      
      // Construire les filtres pour la recherche
      const filtres: any = {};
      let filterCount = 0;
      
      // Filtres de localisation
      if (ville) {
        filtres.ville = ville;
        filterCount++;
        
        // Si on a des données de ville complètes
        if (villeData) {
          if (villeData.code) {
            filtres.villeCode = villeData.code;
          }
          
          // Si on a des coordonnées, activer la recherche par rayon
          if (villeData.centre) {
            filtres.latitude = villeData.centre.coordinates[1]; // Latitude
            filtres.longitude = villeData.centre.coordinates[0]; // Longitude
            filtres.distanceMax = distance; // Distance en km
            
            // CRUCIAL: Activer explicitement la recherche par rayon
            filtres.rechercheParRayon = true;
            
            console.log(`🌍 Recherche dans un rayon de ${distance} km autour de ${ville}`);
          }
        } 
        // Si on a seulement le nom de la ville, essayer de récupérer les données
        else {
          console.log(`🔍 Tentative de récupération des données pour: ${ville}`);
          
          // Récupérer les données de ville pour permettre la recherche par rayon
          const cityData = await fetchCityDataByName(ville);
          if (cityData) {
            console.log("✅ Données de ville trouvées");
            
            // Mettre à jour l'état avec les données récupérées
            setVilleData(cityData);
            
            if (cityData.code) {
              filtres.villeCode = cityData.code;
            }
            
            if (cityData.centre) {
              filtres.latitude = cityData.centre.coordinates[1];
              filtres.longitude = cityData.centre.coordinates[0];
              filtres.distanceMax = distance;
              filtres.rechercheParRayon = true;
            }
          } else {
            console.warn("⚠️ Impossible de trouver des données pour:", ville);
          }
        }
      }
      
      // Autres filtres
      if (nombreColoc !== null) {
        filtres.nombreColoc = nombreColoc;
        filterCount++;
      }
      
      if (prixMax !== null) {
        filtres.prixMax = prixMax;
        filterCount++;
      }
      
      if (dateDisponibilite) {
        filtres.dateDispoMin = dateDisponibilite.toISOString().split('T')[0];
        filterCount++;
      }
      
      if (equipements.length > 0) {
        filtres.equipements = equipements;
        filterCount++;
      }
      
      // Mettre à jour les états
      setActiveFilters(filterCount);
      setFilterParams(filtres);
      
      // Exécuter la recherche
      console.log("🔍 Recherche avec filtres:", filtres);
      const resultats = await rechercherLogementsComplets(filtres);
      console.log(`✅ ${resultats.length} logements trouvés`);
      
      // Mise à jour de l'état avec les résultats
      setLogements(resultats);
      
      // Fermer le panneau de filtres
      setIsFilterOpen(false);
    } catch (error) {
      console.error("❌ Erreur lors de l'application des filtres:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = async () => {
    try {
      setSearchLoading(true);
      
      // Réinitialiser tous les états
      setVille('');
      setVilleData(null);
      setDistance(10);
      setPrixMax(null);
      setNombreColoc(null);
      setDateDisponibilite(undefined);
      setEquipements([]);
      
      // Réinitialiser les filtres
      setFilterParams({});
      setActiveFilters(0);
      
      // Charger tous les logements sans filtre
      console.log("🔄 Chargement de tous les logements après réinitialisation");
      const results = await rechercherLogementsComplets({});
      console.log(`✅ ${results.length} logements trouvés`);
      setLogements(results);
    } catch (error) {
      console.error("❌ Erreur lors de la réinitialisation:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Toggle d'un équipement
  const toggleEquipement = (equipement: EquipementType) => {
    setEquipements(current => 
      current.includes(equipement)
        ? current.filter(e => e !== equipement)
        : [...current, equipement]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* En-tête de recherche */}
        <section className="pb-10 px-4 sm:px-6 lg:px-8 relative bg-white/5 pt-20">
          <div className="mx-auto">
            <h1 className="text-3xl font-semibold text-white text-gradient mb-6 text-left">
              Rechercher un logement
            </h1>
            <p className="text-lg text-white/80 mb-6 text-left">
              Trouvez la colocation idéale pour votre séjour de courte durée
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start max-w-4xl mx-auto">
              {/* Barre de recherche principale */}
              <div className="w-full sm:w-2/3 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <CityAutocomplete
                    value={ville}
                    onChange={handleVilleChange}
                    placeholder="Rechercher par ville..."
                    label=""
                    inputClassName="pl-16"
                    iconClassName="left-7"
                  />
                  {/* Bouton X pour effacer la ville */}
                  {ville && (
                    <button
                      type="button"
                      onClick={clearVilleField}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Effacer la ville"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <Button 
                  onClick={applyFilters}
                  disabled={searchLoading}
                  className="whitespace-nowrap bg-[#ff5734] hover:bg-[#e94c2d]"
                >
                  {searchLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Rechercher
                </Button>
              </div>
              
              {/* Bouton de filtres */}
              <div className="w-full sm:w-1/3 flex justify-start sm:justify-end">
                <Button 
                  variant={activeFilters > 0 ? "default" : "outline"}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full sm:w-auto ${activeFilters > 0 ? 'bg-[#ff5734] hover:bg-[#e94c2d]' : ''}`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                  {activeFilters > 0 && (
                    <Badge className="ml-2 bg-white text-[#ff5734]">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Panneau de filtres */}
            {isFilterOpen && (
              <Card className="mt-4 max-w-4xl mx-auto bg-[#19191b] border border-gray-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Filtres avancés</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                  >
                    Réinitialiser
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filtre de distance - UNIQUEMENT si ville est définie avec des coordonnées */}
                    {Boolean(ville) && villeData && villeData.centre && (
                      <div className="space-y-2">
                        <Label>Distance de recherche : {distance} km</Label>
                        <Slider
                          value={[distance]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(values) => setDistance(values[0])}
                          className="mt-2"
                        />
                      </div>
                    )}
                    
                    {/* Prix maximum */}
                    <div className="space-y-2">
                      <Label htmlFor="prixMax">Prix maximum (€/nuit)</Label>
                      <Input
                        id="prixMax"
                        type="number"
                        placeholder="Ex: 80"
                        value={prixMax !== null ? prixMax : ''}
                        onChange={(e) => setPrixMax(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-[#242426]"
                      />
                    </div>
                    
                    {/* Nombre de colocataires */}
                    <div className="space-y-2">
                      <Label htmlFor="nombreColoc">Nombre de colocataires</Label>
                      <Input
                        id="nombreColoc"
                        type="number"
                        placeholder="Ex: 2"
                        value={nombreColoc !== null ? nombreColoc : ''}
                        onChange={(e) => setNombreColoc(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-[#242426]"
                      />
                    </div>
                    
                    {/* Date de disponibilité */}
                    <div className="space-y-2">
                      <Label>Date de disponibilité</Label>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start bg-[#242426] border-gray-700"
                          >
                            {dateDisponibilite 
                              ? format(dateDisponibilite, 'dd MMMM yyyy', { locale: fr })
                              : "Choisir une date"}
                            {dateDisponibilite && (
                              <X 
                                className="ml-auto h-4 w-4" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDateDisponibilite(undefined);
                                }}
                              />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <SingleCalendar
                            date={dateDisponibilite}
                            onSelect={(date) => {
                              setDateDisponibilite(date);
                              setIsCalendarOpen(false);
                            }}
                            fromMonth={new Date()}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {/* Équipements */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <Label>Équipements</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(equipementMapping).map(([key, { label }]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`equipement-${key}`}
                              checked={equipements.includes(key as EquipementType)}
                              onCheckedChange={() => toggleEquipement(key as EquipementType)}
                            />
                            <Label htmlFor={`equipement-${key}`} className="text-sm">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 pb-6 pt-2">
                  <Button 
                    onClick={applyFilters}
                    disabled={searchLoading}
                    className="w-full bg-[#ff5734] hover:bg-[#e94c2d]"
                  >
                    {searchLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Appliquer les filtres
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>
        
        {/* Résultats de recherche */}
        <section className="flex flex-col items-center justify-center w-full">
          {searchLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#ff5734]" />
            </div>
          ) : (
            <div className="container py-10">
              {logements.length > 0 ? (
                <>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {logements.map((logement) => (
                      <LogementCard 
                        key={logement.$id} 
                        logement={logement} 
                        distance={(logement as any).distance}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">Aucun logement trouvé</h3>
                  <p className="text-gray-400 mb-4">
                    Essayez de modifier vos critères de recherche.
                  </p>
                  <Button 
                    onClick={resetFilters}
                    className="bg-[#ff5734] hover:bg-[#e94c2d]"
                  >
                    Voir tous les logements
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default RechercheLogement;