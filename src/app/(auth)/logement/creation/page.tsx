"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Votre composant personnalisé
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Upload, MapPin, Hash, Ruler, Home, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import {
  getCurrentUserId,
  getProprioDocIdByUserId,
  uploadLogementImage,
  createLogement,
  LogementData,
  AdresseData,
  EquipementType,
  equipementMapping
} from "@/lib/appwrite";
import { Checkbox } from "@/components/ui/checkbox"; // Utilisation du composant Checkbox de votre UI kit
import { CityAutocomplete } from "@/components/ui/city-autocomplete"; // Ajout de l'import pour CityAutocomplete
import { CityData } from "@/lib/geo-service"; // Ajout de l'import pour le type CityData

type ImagePreview = {
  url: string;
  file: File;
};

export default function CreationLogement() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  
  // Champs d'adresse séparés
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null); // Nouvel état pour stocker les données de ville
  
  const [nombreColoc, setNombreColoc] = useState("");
  const [m2, setM2] = useState("");
  const [equipements, setEquipements] = useState<EquipementType[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ 
    from: undefined,
    to: undefined 
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [prix, setPrix] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fonction pour gérer le toggle des équipements
  const handleEquipementToggle = (value: EquipementType) => {
    setEquipements(current => 
      current.includes(value)
        ? current.filter(eq => eq !== value)
        : [...current, value]
    );
  };

  // Format d'affichage de la date
  const formatDateDisplay = () => {
    if (dateRange?.from && dateRange.to) {
      return `${format(dateRange.from, 'dd MMM', { locale: fr })} - ${format(dateRange.to, 'dd MMM', { locale: fr })}`;
    }
    
    if (dateRange?.from) {
      return `${format(dateRange.from, 'dd MMM', { locale: fr })} - ?`;
    }
    
    return 'Choisir une date';
  };

  // Upload image (max 5 photos maintenant avec la nouvelle collection)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: ImagePreview[] = [];
      // Augmenté de 2 à 5 photos maximum
      for (let i = 0; i < e.target.files.length && images.length + i < 5; i++) {
        const file = e.target.files[i];
        newImages.push({
          url: URL.createObjectURL(file),
          file,
        });
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (idx: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[idx].url);
    newImages.splice(idx, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Champs requis
    if (
      !titre ||
      !description ||
      !adresse ||
      !ville ||
      !codePostal ||
      !nombreColoc ||
      !dateRange?.from ||  // Vérification de la date de début
      images.length === 0
    ) {
      toast({
        title: "Formulaire incomplet",
        description: "Tous les champs obligatoires doivent être remplis.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      // 1. Récupérer l'ID utilisateur connecté
      const userId = await getCurrentUserId();
      if (!userId) {
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // 2. Récupérer l'ID du document proprio lié à cet utilisateur
      const proprioDocId = await getProprioDocIdByUserId(userId);
      if (!proprioDocId) {
        toast({
          title: "Erreur",
          description: "Aucun document propriétaire trouvé.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // 3. Upload images (jusqu'à 5 maintenant)
      const photoUrls: {[key: string]: string} = {};
      for (let i = 0; i < images.length; i++) {
        const url = await uploadLogementImage(images[i].file);
        photoUrls[`${i+1}`] = url; // "1", "2", "3", etc.
      }

      // 4. Création du logement avec adresse et photos séparées
      const logementData: LogementData = {
        proprio: proprioDocId,
        titre,
        description,
        nombreColoc: Number(nombreColoc),
        m2: m2 ? Number(m2) : undefined,
        equipement: equipements,
        datedispo: dateRange!.from!.toISOString(), // Utilisation de la date de début
        prix,
      };

      // Enrichir adresseData avec les coordonnées géographiques si disponibles
      const adresseData: AdresseData = {
        ville,
        adresse,
        code_postal: codePostal,
        // Ajouter les données géographiques si disponibles
        ...(selectedCityData && {
          ville_code: selectedCityData.code,
          departement: selectedCityData.codeDepartement,
          ...(selectedCityData.centre && {
            latitude: selectedCityData.centre.coordinates[1],  // La latitude est la 2ème coordonnée
            longitude: selectedCityData.centre.coordinates[0], // La longitude est la 1ère coordonnée
          }),
        }),
      };

      // Utiliser la nouvelle fonction de création qui gère les 3 collections
      await createLogement(logementData, adresseData, photoUrls);

      toast({
        title: "Logement créé !",
        description: "Votre annonce a été publiée avec succès.",
      });

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 flex items-center"
            onClick={() => router.push("/profile")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au profil
          </Button>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Créer un logement</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Images */}
                <div className="space-y-2">
                  <Label>Images du logement</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {images.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-md overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <div className="aspect-video flex items-center justify-center rounded-md border-2 border-dashed border-white/20 bg-white/5">
                        <Label
                          htmlFor="images-upload"
                          className="cursor-pointer flex flex-col items-center p-4"
                        >
                          <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Ajouter
                          </span>
                        </Label>
                        <Input
                          id="images-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ajoutez jusqu'à 5 photos de votre logement.
                  </p>
                </div>

                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre de l'annonce</Label>
                  <Input
                    id="titre"
                    placeholder="Ex : Chambre lumineuse dans colocation"
                    className="bg-white/10 border-white/20"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre logement, ses équipements, l'environnement..."
                    className="min-h-[120px] bg-white/10 border-white/20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Adresse complète avec champs séparés */}
                <div className="space-y-4">
                  <h3 className="font-medium">Adresse complète</h3>
                  
                  {/* Rue/adresse */}
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adresse"
                        placeholder="123 rue de l'exemple"
                        className="pl-10 bg-white/10 border-white/20"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Ville - Remplacé par le composant CityAutocomplete */}
                  <div className="space-y-2">
                    <CityAutocomplete
                      value={ville}
                      onChange={(value, cityData) => {
                        setVille(value);
                        setSelectedCityData(cityData || null);
                        
                        // Si les données de ville sont disponibles, mettre à jour le code postal
                        if (cityData && cityData.codesPostaux && cityData.codesPostaux.length > 0) {
                          setCodePostal(cityData.codesPostaux[0]);
                        }
                      }}
                      label="Ville"
                      placeholder="Rechercher une ville..."
                      required
                    />
                  </div>
                  
                  {/* Code postal */}
                  <div className="space-y-2">
                    <Label htmlFor="code-postal">Code Postal</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="code-postal"
                        placeholder="75001"
                        className="pl-10 bg-white/10 border-white/20"
                        value={codePostal}
                        onChange={(e) => setCodePostal(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Prix du logement - NOUVEAU CHAMP */}
                <div className="space-y-2">
                  <Label htmlFor="prix">Loyer mensuel (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prix"
                      type="text"
                      inputMode="numeric"
                      placeholder="650"
                      className="pl-10 bg-white/10 border-white/20"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Indiquez le loyer mensuel charges comprises.
                  </p>
                </div>

                {/* Nombre de colocataires */}
                <div className="space-y-2">
                  <Label htmlFor="nombre-coloc">Nombre de colocataires</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombre-coloc"
                      type="number"
                      min={1}
                      placeholder="2"
                      className="pl-10 bg-white/10 border-white/20"
                      value={nombreColoc}
                      onChange={(e) => setNombreColoc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Surface (m2) */}
                <div className="space-y-2">
                  <Label htmlFor="m2">Surface (m²)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="m2"
                      type="number"
                      min={0}
                      placeholder="70"
                      className="pl-10 bg-white/10 border-white/20"
                      value={m2}
                      onChange={(e) => setM2(e.target.value)}
                    />
                  </div>
                </div>

                {/* Equipement - CORRECTION DES CHECKBOX */}
                <div className="space-y-4">
                  <Label>Équipements disponibles</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(equipementMapping).map(([value, { label, icon }]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`equipement-${value}`}
                          checked={equipements.includes(value as EquipementType)}
                          onCheckedChange={() => handleEquipementToggle(value as EquipementType)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-white/30"
                        />
                        <Label
                          htmlFor={`equipement-${value}`}
                          className="cursor-pointer text-sm font-medium"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date de disponibilité avec votre composant Calendar personnalisé */}
                <div className="space-y-2">
                  <Label>Date de disponibilité</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full p-4 justify-between items-center gap-2 bg-white/10 border-white/20"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDateDisplay()}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black border-white/10" align="start">
                      {/* Utilisation correcte du composant Calendar */}
                      <Calendar 
                        dateRange={dateRange || { from: undefined, to: undefined }} 
                        onSelect={setDateRange}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Pour une seule date, sélectionnez la même date pour le début et la fin.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Publication en cours..." : "Publier l'annonce"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}