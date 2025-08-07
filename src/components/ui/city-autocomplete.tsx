"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface CityData {
  nom: string;
  code: string;
  codeDepartement: string;
  codeRegion: string;
  codesPostaux: string[];
  population: number;
  _score?: number;
  centre?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, cityData?: CityData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  label = "Ville",
  placeholder = "Rechercher une ville...",
  required = false,
  disabled = false
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<CityData[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialiser l'input avec la valeur fournie
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Recherche des villes
  const searchCities = async (search: string) => {
    if (search.length < 2) {
      setCities([]);
      return;
    }

    try {
      setLoading(true);
      
      // Utiliser l'API Geo du gouvernement français
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(search)}&boost=population&limit=10&fields=nom,code,codeDepartement,codeRegion,codesPostaux,population,centre`
      );
      
      if (response.ok) {
        const data: CityData[] = await response.json();
        setCities(data);
      } else {
        console.error("Erreur lors de la recherche de villes:", response.statusText);
        setCities([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de villes:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du changement de l'input avec debounce
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Nettoyer le timeout précédent s'il existe
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Définir un nouveau timeout pour la recherche
    debounceTimeout.current = setTimeout(() => {
      if (value.length >= 2) {
        searchCities(value);
      } else {
        setCities([]);
      }
    }, 300);
  };

  // Sélection d'une ville
  const handleSelectCity = (city: CityData) => {
    onChange(city.nom, city);
    setInputValue(city.nom);
    setOpen(false);
  };

  // Formatage du code postal (prendre le premier si plusieurs)
  const formatPostalCode = (codesPostaux: string[]) => {
    return codesPostaux && codesPostaux.length > 0 ? codesPostaux[0] : "";
  };

  return (
    <div className="space-y-2 w-full bg-secondary">
      {label && <Label htmlFor="city-input">{label}</Label>}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full bg-secondary">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="city-input"
              className="pl-10 bg-white/20 border-white/20 w-full"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onClick={() => !disabled && inputValue.length >= 2 && setOpen(true)}
              required={required}
              disabled={disabled}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 w-[400px] max-h-[300px] bg-secondary overflow-y-auto">
          <Command>
            <div className="sticky">
            <CommandInput 
              placeholder="Rechercher une ville..."
              value={inputValue}
              onValueChange={handleInputChange}
            />
            </div>
            <CommandEmpty>
              {inputValue.length < 2 
                ? "Saisissez au moins 2 caractères..." 
                : "Aucune ville trouvée"}
            </CommandEmpty>
            <CommandGroup heading="Villes">
              {cities.map((city) => (
                <CommandItem
                  key={city.code}
                  value={city.nom}
                  onSelect={() => handleSelectCity(city)}
                  className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors" // <-- Classes ajoutées ici
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{city.nom}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPostalCode(city.codesPostaux)} • {city.codeDepartement}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}