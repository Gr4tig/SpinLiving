"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SingleCalendar } from "@/components/ui/single-calendar"; // Importez le composant que nous avons créé précédemment
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string, date?: Date) => Promise<void>;
  isLoading: boolean;
  minDate?: Date; // Date minimale sélectionnable (par défaut: aujourd'hui)
}

export function ContactModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  minDate = new Date()
}: ContactModalProps) {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(message, date);
  };

  const handleCancel = () => {
    setMessage("");
    setDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] bg-[#19191B] border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl">Contacter le propriétaire</DialogTitle>
          <DialogDescription className="text-gray-400">
            Laissez un message et indiquez votre date d'arrivée souhaitée
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            
            {/* Calendrier intégré directement dans la modal */}
              <p className="mb-2 text-sm">
                {date 
                  ? `Date sélectionnée: ${format(date, "dd MMMM yyyy", { locale: fr })}` 
                  : "Sélectionnez une date d'arrivée"}
              </p>
              <SingleCalendar
                date={date}
                onSelect={setDate}
                disabled={(date) => date < minDate}
                fromMonth={minDate}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              Cette date aide le propriétaire à mieux organiser les visites
            </p>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message (optionnel)
            </label>
            <Textarea
              id="message"
              placeholder="Présentez-vous et posez vos questions au propriétaire..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] bg-transparent border border-gray-800 focus:border-primary"
            />
          </div>

          <DialogFooter className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full sm:w-auto"
              >
                {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}