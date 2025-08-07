"use client";

import { useState, useEffect } from "react";
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SingleCalendar } from "@/components/ui/single-calendar";
import { CityAutocomplete } from "@/components/ui/city-autocomplete"; // 👈 Utilisation de notre composant
import { LogementCompletData, rechercherLogementsComplets } from '@/lib/appwrite';
import { ListingsLogements } from '@/components/ListingsLogements';
import { equipementMapping, EquipementType } from "@/lib/appwrite";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Type pour les données de ville récupérées de l'API Geo
interface CityData {
  nom: string;
  code: string;
  codeDepartement: string;
  codeRegion: string;
  codesPostaux: string[];
  population: number;
  centre?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const RechercheLogement = () => {
  // États de recherche
  const [ville, setVille] = useState<string>("");
  const [villeData, setVilleData] = useState<CityData | null>(null);
  const [distance, setDistance] = useState<number>(10); // Distance par défaut de 10km
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [nombreColoc, setNombreColoc] = useState<number | null>(null);
  const [dateDisponibilite, setDateDisponibilite] = useState<Date | undefined>(undefined);
  const [equipements, setEquipements] = useState<EquipementType[]>([]);
  
  // États UI
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  // Résultats de recherche
  const [filterParams, setFilterParams] = useState<any>({});
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [logements, setLogements] = useState<LogementCompletData[]>([]);

  // Appliquer les filtres
  const applyFilters = async () => {
    try {
      setSearchLoading(true);
      let filterCount = 0;
      
      // Construire les filtres pour la recherche
      const filtres: any = {};
      
      // GÉOLOCALISATION avec DISTANCE PERSONNALISÉE
      if (villeData) {
        // Stockage du code INSEE et du nom de la ville
        filtres.villeCode = villeData.code;
        filtres.ville = villeData.nom;
        
        // Utiliser les coordonnées géographiques avec la distance définie par l'utilisateur
        if (villeData.centre) {
          filtres.latitude = villeData.centre.coordinates[1]; // Latitude
          filtres.longitude = villeData.centre.coordinates[0]; // Longitude
          filtres.distanceMax = distance; // Distance en km choisie par l'utilisateur
          
          // IMPORTANT: Activer explicitement la recherche par rayon
          filtres.rechercheParRayon = true;
          
          console.log(`🌍 Recherche dans un rayon de ${distance} km autour de ${villeData.nom}`);
          console.log(`📍 Coordonnées: lat=${filtres.latitude}, lon=${filtres.longitude}`);
        } else {
          console.log(`🏙️ Recherche dans la ville: ${villeData.nom}`);
        }
        
        filterCount++;
      }
      
      // Filtre par nombre de colocataires
      if (nombreColoc !== null) {
        filtres.nombreColoc = nombreColoc;
        console.log(`👥 Filtre nombre de colocataires: ${nombreColoc}`);
        filterCount++;
      }
      
      // Filtre par prix max
      if (prixMax !== null) {
        filtres.prixMax = prixMax;
        console.log(`💰 Filtre prix maximum: ${prixMax}€`);
        filterCount++;
      }
      
      // Filtre par date de disponibilité
      if (dateDisponibilite) {
        filtres.dateDispoMin = dateDisponibilite.toISOString().split('T')[0]; // Format YYYY-MM-DD
        console.log(`📅 Filtre date de disponibilité minimale: ${filtres.dateDispoMin}`);
        filterCount++;
      }
      
      // Filtre par équipements
      if (equipements.length > 0) {
        filtres.equipements = equipements;
        console.log(`🔌 Filtre équipements: ${equipements.join(', ')}`);
        filterCount++;
      }
      
      // Log des filtres complets
      console.log("📊 Résumé des filtres:", filtres);
      
      // Mettre à jour le nombre de filtres actifs
      setActiveFilters(filterCount);
      setFilterParams(filtres);
      
      // IMPORTANT: Récupération des résultats filtrés
      console.log("⏳ Chargement des logements avec paramètres:", filtres);
      const resultats = await rechercherLogementsComplets(filtres);
      console.log(`✅ ${resultats.length} logements trouvés au total`);
      
      // Mise à jour de l'état avec les résultats
      setLogements(resultats);
      
      // Fermer le panneau de filtres
      setIsFilterOpen(false);
    } catch (error) {
      console.error("❌ Erreur lors de l'application des filtres:", error);
      // En cas d'erreur, vider les résultats
      setLogements([]);
    } finally {
      // Quoi qu'il arrive, désactiver l'indicateur de chargement
      setSearchLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setVille("");
    setVilleData(null);
    setDistance(10);
    setPrixMax(null);
    setNombreColoc(null);
    setDateDisponibilite(undefined);
    setEquipements([]);
    setActiveFilters(0);
    setFilterParams({});
  };

  // Toggle d'un équipement dans la liste
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
        {/* En-tête de recherche avec style adapté */}
        <section className="pb-10 px-4 sm:px-6 lg:px-8 relative bg-white/5 pt-20">
          <div className="mx-auto">
            <h1 className="text-3xl font-semibold text-white text-gradient mb-6 text-left">
              Rechercher un logement
            </h1>
            <p className="text-lg text-white/80 mb-6 text-left">
              Trouvez la colocation idéale pour votre séjour de courte durée
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start max-w-4xl mx-auto">
              {/* Barre de recherche principale avec CityAutocomplete - SANS LABEL */}
              <div className="w-full sm:w-2/3 flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  {/* Utilisation modifiée de CityAutocomplete */}
                  <CityAutocomplete
                    value={ville}
                    onChange={(value, cityData) => {
                      setVille(value);
                      setVilleData(cityData);
                    }}
                    placeholder="Rechercher par ville..."
                    label=""
                  />
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
              
              {/* Bouton de filtres reste inchangé */}
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
                    {/* Filtre de distance - visible uniquement quand une ville est sélectionnée */}
                    {villeData && (
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
                    
                    {/* Date de disponibilité avec SingleCalendar */}
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
        
        {/* Résultats de recherche avec votre composant ListingsLogements */}
        <section className="flex flex-col items-center justify-center w-full">
          <ListingsLogements searchParams={filterParams} />
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default RechercheLogement;