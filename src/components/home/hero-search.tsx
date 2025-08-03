"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';

export function HeroSearch() {
  const [city, setCity] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (city) {
      params.append('city', city);
    }
    
    if (dateRange.from) {
      params.append('from', dateRange.from.toISOString());
    }
    
    if (dateRange.to) {
      params.append('to', dateRange.to.toISOString());
    }
    
    router.push(`/logement/recherche?${params.toString()}`);
  };

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
          <Input
            placeholder="Rechercher une ville"
            className="w-full rounded-2xl p-7 bg-white border-primary text-secondary placeholder:text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
        
        <Button onClick={handleSearch} className="sm:w-auto p-7 rounded-2xl bg-primary">
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
}
