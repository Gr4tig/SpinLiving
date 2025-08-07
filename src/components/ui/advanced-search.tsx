import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { CityData } from "@/lib/geo-service";

interface AdvancedSearchProps {
  onSearch: (filters: {
    ville?: string;
    villeCode?: string;
    latitude?: number;
    longitude?: number;
    distanceMax?: number;
    nombreColoc?: number;
    equipement?: string;
    dateDispoMin?: string;
  }) => void;
}

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [ville, setVille] = useState("");
  const [villeData, setVilleData] = useState<CityData | null>(null);
  const [distanceMax, setDistanceMax] = useState(20); // 20km par défaut
  const [nombreColoc, setNombreColoc] = useState("");

  const handleSearch = () => {
    const filters: any = {};
    
    if (ville && villeData) {
      filters.ville = ville;
      filters.villeCode = villeData.code;
      
      if (villeData.centre) {
        filters.latitude = villeData.centre.coordinates[1];
        filters.longitude = villeData.centre.coordinates[0];
        filters.distanceMax = distanceMax;
      }
    }
    
    if (nombreColoc) {
      filters.nombreColoc = parseInt(nombreColoc);
    }
    
    onSearch(filters);
  };

  return (
    <Card className="bg-white/5 rounded-lg border border-white/10">
      <CardHeader>
        <CardTitle>Recherche avancée</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CityAutocomplete
          value={ville}
          onChange={(value, cityData) => {
            setVille(value);
            setVilleData(cityData || null);
          }}
          label="Ville"
          placeholder="Dans quelle ville recherchez-vous ?"
        />
        
        {villeData && villeData.centre && (
          <div className="space-y-2">
            <Label>Distance maximale: {distanceMax} km</Label>
            <Slider
              value={[distanceMax]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setDistanceMax(value[0])}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="nombreColoc">Nombre de colocataires</Label>
          <Input
            id="nombreColoc"
            type="number"
            min={1}
            placeholder="2"
            value={nombreColoc}
            onChange={(e) => setNombreColoc(e.target.value)}
            className="bg-white/10 border-white/20"
          />
        </div>
        
        <Button onClick={handleSearch} className="w-full">
          Rechercher
        </Button>
      </CardContent>
    </Card>
  );
}