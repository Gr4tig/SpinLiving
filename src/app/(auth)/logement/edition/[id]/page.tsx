"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Upload, MapPin, Hash, Ruler, Home, Building, Euro, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import {
  getCurrentUserId,
  getProprioDocIdByUserId,
  uploadLogementImage,
  getLogementComplet,
  LogementData,
  AdresseData,
  EquipementType,
  equipementMapping,
} from "@/lib/appwrite";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { databases, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_LOGEMENT_ID, APPWRITE_COLLECTION_ADRESSES_ID, APPWRITE_COLLECTION_PHOTOSAPPART_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { CityData } from "@/lib/geo-service";

type ImagePreview = {
  url: string;
  file?: File;
  id?: string; 
};

export default function EditionLogement() {
  const router = useRouter();
  const params = useParams();
  const logementId = params.id as string;
  
  const [logement, setLogement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [nombreColoc, setNombreColoc] = useState("");
  const [m2, setM2] = useState("");
  const [prix, setPrix] = useState("");
  const [equipements, setEquipements] = useState<EquipementType[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [photosDocId, setPhotosDocId] = useState<string | null>(null);
  const [adresseDocId, setAdresseDocId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ 
    from: undefined,
    to: undefined 
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);

  // Chargement initial des données du logement
  useEffect(() => {
    async function loadLogementData() {
      try {
        setIsLoading(true);
        
        // 1. Récupérer l'ID de l'utilisateur courant
        const userId = await getCurrentUserId();
        if (!userId) {
          setError("Vous devez être connecté pour accéder à cette page");
          setIsLoading(false);
          return;
        }
        
        // 2. Récupérer le logement complet avec toutes ses relations
        const logementData = await getLogementComplet(logementId);
        if (!logementData) {
          setError("Logement non trouvé");
          setIsLoading(false);
          return;
        }
        
        // 3. Vérifier que l'utilisateur est le propriétaire du logement
        const proprioUserId = logementData.proprio?.userid;
        if (!proprioUserId || proprioUserId !== userId) {
          setError("Vous n'êtes pas autorisé à modifier ce logement");
          setIsLoading(false);
          return;
        }
        
        // 4. Remplir le formulaire avec les données existantes
        setLogement(logementData);
        setTitre(logementData.titre || "");
        setDescription(logementData.description || "");
        
        // Adresse
        if (logementData.adresse) {
          setAdresse(logementData.adresse.adresse || "");
          setVille(logementData.adresse.ville || "");
          setCodePostal(logementData.adresse.code_postal || "");
          setAdresseDocId(logementData.adresse.$id || null);
        }
        
        // Autres informations
        setNombreColoc(logementData.nombreColoc?.toString() || "");
        setM2(logementData.m2?.toString() || "");
        setPrix(logementData.prix?.toString() || "");
        setEquipements(logementData.equipement || []);
        
        // Date de disponibilité
        if (logementData.datedispo) {
          try {
            let dateDispo = new Date(logementData.datedispo);
            if (!isNaN(dateDispo.getTime())) {
              setDateRange({ 
                from: dateDispo,
                to: dateDispo
              });
            }
          } catch (error) {
            console.error("Erreur lors du parsing de la date:", error);
          }
        }
        
        // Photos
        if (logementData.photos) {
          setPhotosDocId(logementData.photos.$id || null);
          
          // Structure de photos claire
          const photoEntries: ImagePreview[] = [];
          
          // Traiter uniquement les photos valides (1-5)
          for (let i = 1; i <= 5; i++) {
            const photoKey = i.toString();
            const photoUrl = logementData.photos[photoKey];
            
            if (photoUrl) {
              photoEntries.push({
                url: photoUrl,
                id: photoKey
              });
            }
          }
          
          setImages(photoEntries);
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Une erreur s'est produite lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLogementData();
  }, [logementId]);

  const handleEquipementToggle = (value: EquipementType) => {
    setEquipements(current => 
      current.includes(value)
        ? current.filter(eq => eq !== value)
        : [...current, value]
    );
  };

  const formatDateDisplay = () => {
    if (dateRange?.from) {
      return `${format(dateRange.from, 'dd MMM yyyy', { locale: fr })}`;
    }
    return 'Choisir une date';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: ImagePreview[] = [];
      
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
    const imageToRemove = images[idx];
    
    // Si l'image a un fichier, libérer l'URL
    if (imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    // Retirer l'image de la liste
    const newImages = [...images];
    newImages.splice(idx, 1);
    setImages(newImages);
  };

  // Remplacez uniquement la fonction handleSubmit par celle-ci:

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // 1. Validation des champs obligatoires
      if (!titre || !description || !adresse || !ville || !codePostal || !nombreColoc || !dateRange?.from) {
        toast.error("Tous les champs obligatoires doivent être remplis.");
        setSubmitting(false);
        return;
      }
      
      // 2. Mise à jour du document logement
      try {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_LOGEMENT_ID,
          logementId,
          {
            titre,
            description,
            nombreColoc: Number(nombreColoc),
            m2: m2 ? Number(m2) : null,
            equipement: equipements,
            datedispo: dateRange.from.toISOString(),
            prix: prix || ""
          }
        );
        console.log("✅ Logement mis à jour");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du logement:", error);
        throw new Error("Erreur lors de la mise à jour des informations du logement");
      }
      
      // 3. Mise à jour de l'adresse
      try {
        const adresseData = {
            ville,
            adresse,
            code_postal: codePostal,
            logement: logementId,
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
        
        // Trouver le document adresse existant
        const adressesResult = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ADRESSES_ID,
          [Query.equal("logement", logementId)]
        );
        
        if (adressesResult.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ADRESSES_ID,
            adressesResult.documents[0].$id,
            adresseData
          );
          console.log("✅ Adresse mise à jour");
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ADRESSES_ID,
            "unique()",
            adresseData
          );
          console.log("✅ Nouvelle adresse créée");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'adresse:", error);
        // Continuer malgré cette erreur
      }
      
      // 4. Mise à jour des photos - APPROCHE COMPLÈTEMENT DIFFÉRENTE
      try {
        // Rechercher le document photos existant
        const photosResult = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_PHOTOSAPPART_ID,
          [Query.equal("logement", logementId)]
        );
        
        // Si un document photos existe, le supprimer
        if (photosResult.documents.length > 0) {
          await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_PHOTOSAPPART_ID,
            photosResult.documents[0].$id
          );
          console.log("✅ Ancien document photos supprimé");
        }
        
        // Upload des nouvelles images si nécessaire
        const newImages = images.filter(img => img.file);
        const uploadPromises = newImages.map(img => uploadLogementImage(img.file!));
        const uploadedUrls = await Promise.all(uploadPromises.map(p => p.catch(e => null))).then(
          results => results.filter(url => url !== null)
        );
        
        // Récupérer les URLs des images existantes (déjà uploadées)
        const existingUrls = images
          .filter(img => !img.file && img.url)
          .map(img => img.url);
        
        // Créer un tableau de toutes les URLs d'images
        const allImageUrls = [...existingUrls, ...uploadedUrls].slice(0, 5);
        
        // Créer un objet photos propre
        const photoDoc = {
          logement: logementId
        };
        
        // Assigner les URLs aux positions 1-5
        for (let i = 0; i < Math.min(allImageUrls.length, 5); i++) {
          const position = (i + 1).toString(); // "1", "2", "3", "4", "5"
          photoDoc[position] = allImageUrls[i];
        }
        
        // Créer un nouveau document photos
        const newPhotoDoc = await databases.createDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_PHOTOSAPPART_ID,
          "unique()",
          photoDoc
        );
        
        console.log("✅ Nouveau document photos créé", newPhotoDoc.$id);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des photos:", error);
        // Ne pas bloquer le reste du processus
      }
      
      toast.success("Annonce mise à jour avec succès!");
      setTimeout(() => router.push("/mes-annonces"), 1000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  // Affichage des états de chargement et d'erreur inchangés...
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
              <Skeleton className="h-10 w-32" />
            </div>
            
            <Card className="glass-morphism">
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6 flex items-center"
              onClick={() => router.push("/mes-annonces")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes annonces
            </Button>
            
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {error || "Vous n'êtes pas autorisé à modifier ce logement"}
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="default" 
              onClick={() => router.push("/mes-annonces")}
            >
              Retourner à mes annonces
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Le reste du rendu du formulaire est inchangé...
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mt-10 mx-auto">
          <Button
            variant="ghost"
            className="mb-6 flex items-center"
            onClick={() => router.push("/mes-annonces")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes annonces
          </Button>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Modifier votre annonce</CardTitle>
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
                  
                  {/* Ville */}
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

                {/* Prix du logement */}
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

                {/* Equipement */}
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

                {/* Date de disponibilité */}
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
                      <Calendar 
                        dateRange={dateRange || { from: undefined, to: undefined }} 
                        onSelect={setDateRange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    "Mettre à jour l'annonce"
                  )}
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