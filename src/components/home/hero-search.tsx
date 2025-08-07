"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';

// Type pour les données de ville
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

export function HeroSearch() {
  const [city, setCity] = useState('');
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const router = useRouter();

  // Construire l'URL et rediriger vers la page de recherche
  const handleSearch = () => {
    // Créer un nouvel objet URLSearchParams
    const params = new URLSearchParams();
    
    // Ajouter les paramètres de ville si définis
    if (city && city.trim() !== '') {
      params.append('ville', city);
      
      // Ajouter le code INSEE si disponible
      if (cityData?.code) {
        params.append('villeCode', cityData.code);
      }
      
      // Ajouter les coordonnées et activer la recherche par rayon si disponibles
      if (cityData?.centre) {
        params.append('latitude', cityData.centre.coordinates[1].toString());
        params.append('longitude', cityData.centre.coordinates[0].toString());
        params.append('distanceMax', '10'); // Distance par défaut: 10km
        params.append('rechercheParRayon', 'true');
      }
    }
    
    // Ajouter la date de disponibilité minimale si définie
    if (dateRange.from) {
      const formattedDate = dateRange.from.toISOString().split('T')[0]; // Format YYYY-MM-DD
      params.append('dateDispoMin', formattedDate);
    }
    
    // Construire l'URL complète
    const searchUrl = `/logement/recherche${params.toString() ? `?${params.toString()}` : ''}`;
    
    // Log pour déboguer
    console.log(`🔍 Redirection vers: ${searchUrl}`);
    
    // Rediriger vers la page de recherche
    router.push(searchUrl);
  };

  // Formatage de l'affichage des dates
  const formatDateDisplay = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd MMM', { locale: fr })} - ${format(dateRange.to, 'dd MMM', { locale: fr })}`;
    }
    
    if (dateRange.from) {
      return `${format(dateRange.from, 'dd MMM', { locale: fr })} - ?`;
    }
    
    return 'Vos dates';
  };

  return (
    <div className="glass-morphism backdrop-blur-xl bg-secondary/50 border-white/30 border-1 rounded-4xl pt-56 sm:p-5 max-w-5xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CityAutocomplete
            value={city}
            onChange={(value, cityDataObj) => {
              setCity(value);
              setCityData(cityDataObj || null);
            }}
            placeholder="Rechercher une ville"
            label=""
            required={false}
            inputClassName="p-7 rounded-2xl bg-white border-primary text-secondary placeholder:text-sm pl-16"
            iconClassName="text-secondary left-7 h-5 w-5"
          />
        </div>
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full p-7 text-sm rounded-2xl text-secondary sm:w-auto flex justify-between items-center gap-2 bg-white border-primary"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{formatDateDisplay()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
            <Calendar dateRange={dateRange} onSelect={setDateRange} />
          </PopoverContent>
        </Popover>
        
        <Button 
          onClick={handleSearch} 
          className="sm:w-auto p-7 rounded-2xl bg-primary"
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
}