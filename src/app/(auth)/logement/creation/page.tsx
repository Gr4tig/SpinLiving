"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Upload, MapPin, Hash, Ruler } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentUserId,
  getProprioDocIdByUserId,
  uploadLogementImage,
  createLogement,
  LogementData,
} from "@/lib/appwrite";

type ImagePreview = {
  url: string;
  file: File;
};

const EQUIPEMENTS: { value: "wifi" | "cuisine" | "machine"; label: string }[] = [
  { value: "wifi", label: "Wifi" },
  { value: "cuisine", label: "Cuisine" },
  { value: "machine", label: "Machine à laver" },
];

export default function CreationLogement() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");
  const [nombreColoc, setNombreColoc] = useState("");
  const [m2, setM2] = useState("");
  const [equipement, setEquipement] = useState<"wifi" | "cuisine" | "machine" | undefined>();
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [dateDispo, setDateDispo] = useState<Date | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Upload image (max 2)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: ImagePreview[] = [];
      for (let i = 0; i < e.target.files.length && images.length + i < 2; i++) {
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
      !nombreColoc ||
      !dateDispo ||
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

      // 3. Upload images (max 2)
      const photoUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        photoUrls.push(await uploadLogementImage(images[i].file));
      }

      // 4. Création du logement
      const data: LogementData = {
        proprio: proprioDocId, // CHAMP RELATIONNEL !
        titre,
        description,
        adresse,
        nombreColoc: Number(nombreColoc),
        m2: m2 ? Number(m2) : undefined,
        equipement,
        datedispo: dateDispo.toISOString(),
        photo1: photoUrls[0],
        photo2: photoUrls[1],
      };

      await createLogement(data);

      toast({
        title: "Logement créé !",
        description: "Votre annonce a été publiée avec succès.",
      });

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err) {
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
      <Navbar />
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
                  <div className="grid grid-cols-2 gap-4 mt-2">
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
                    {images.length < 2 && (
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
                    Ajoutez jusqu'à 2 photos de votre logement.
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

                {/* Adresse */}
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

                {/* Equipement */}
                <div className="space-y-2">
                  <Label>Équipement</Label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPEMENTS.map((eq) => (
                      <Button
                        type="button"
                        key={eq.value}
                        variant={equipement === eq.value ? "default" : "outline"}
                        onClick={() => setEquipement(eq.value)}
                      >
                        {eq.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date de disponibilité */}
                <div className="space-y-2">
                  <Label>Date de disponibilité</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-white/10 border-white/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateDispo ? (
                          format(dateDispo, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionnez la date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={dateDispo}
                        onSelect={setDateDispo}
                        locale={fr}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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