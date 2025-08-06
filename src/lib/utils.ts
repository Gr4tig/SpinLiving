import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(date).toLocaleDateString('fr-FR', options);
} 

export function formatDateSafe(dateStr: string | undefined | null, formatPattern: string = 'dd MMMM yyyy'): string {
  if (!dateStr) return "Date inconnue";
  
  try {
    // Vérifier différents formats de date possibles
    let dateObj;
    
    // Format YYYY-MM-DD sans heure
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } 
    // Format YYYY-MM-DD HH:MM:SS (celui que vous utilisez)
    else if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // Convertir en format ISO standard en remplaçant l'espace par un T
      const isoDate = dateStr.replace(' ', 'T');
      dateObj = new Date(isoDate);
    } 
    // Format avec timestamp numérique
    else if (!isNaN(Number(dateStr))) {
      dateObj = new Date(Number(dateStr));
    }
    // Autres formats (ISO standard, etc.)
    else {
      dateObj = new Date(dateStr);
    }
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.warn("Date invalide:", dateStr);
      return "Date invalide";
    }
    
    return format(dateObj, formatPattern, { locale: fr });
  } catch (e) {
    console.error("Erreur lors du formatage de la date:", dateStr, e);
    return "Erreur de date";
  }
}