"use client";

import { useState, useEffect, useRef } from "react";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Phone, MapPin, Building, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { CityData } from "@/lib/geo-service";
import {
  databases,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_PROPRIO_ID,
  APPWRITE_COLLECTION_LOCATAIRE_ID,
  uploadProfilePhoto
} from "@/lib/appwrite";

export default function EditProfile() {
  const { user, profile, isOwner, loading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    tel: "",
    ville: "",
    objectif: ""
  });
  
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);

  // Initialiser le formulaire avec les données de profil existantes
  useEffect(() => {
    if (profile) {
      setFormData({
        nom: profile.nom || "",
        prenom: profile.prenom || "",
        tel: profile.tel || "",
        ville: !isOwner && "ville" in profile ? profile.ville || "" : "",
        objectif: !isOwner && "objectif" in profile ? profile.objectif || "" : ""
      });
      
      if (profile.photo) {
        setPhotoPreview(profile.photo);
      }
    }
  }, [profile]);

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Gérer le changement dans les champs de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer l'upload de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      
      // Créer une prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  // Ouvrir le sélecteur de fichier quand on clique sur le bouton
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !profile.$id) {
      toast.error("Impossible de modifier le profil: données manquantes");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // 1. Déterminer quelle collection utiliser selon le type d'utilisateur
      const collectionId = isOwner ? APPWRITE_COLLECTION_PROPRIO_ID : APPWRITE_COLLECTION_LOCATAIRE_ID;
      
      // 2. Préparer les données à mettre à jour
      const updateData: Record<string, any> = {
        nom: formData.nom,
        prenom: formData.prenom,
        tel: formData.tel
      };
      
      // Ajouter les champs spécifiques aux locataires
      if (!isOwner) {
        updateData.ville = formData.ville;
        updateData.objectif = formData.objectif;
      }
      
      // 3. Si une nouvelle photo est sélectionnée, la télécharger
      if (newPhoto) {
        try {
          const photoUrl = await uploadProfilePhoto(newPhoto);
          updateData.photo = photoUrl;
        } catch (photoError) {
          console.error("Erreur lors de l'upload de la photo:", photoError);
          toast.error("Erreur lors de l'upload de la photo");
          // Continuer malgré l'erreur de photo
        }
      }
      
      // 4. Mettre à jour le document
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        profile.$id,
        updateData
      );
      
      if (!isOwner) {
        updateData.ville = formData.ville;
        updateData.objectif = formData.objectif;
        
        // Ajouter les données géographiques
        if (selectedCityData) {
          updateData.ville_code = selectedCityData.code;
          updateData.departement = selectedCityData.codeDepartement;
          
          if (selectedCityData.centre) {
            updateData.latitude = selectedCityData.centre.coordinates[1];
            updateData.longitude = selectedCityData.centre.coordinates[0];
          }
        }
      }
      
      // 5. Rafraîchir les données utilisateur
      await refreshUser();
      
      toast.success("Profil mis à jour avec succès!");
      
      // 6. Rediriger vers la page de profil
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setSubmitting(false);
    }
  };

  // Loader ou rien tant que c'est en attente
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  
  if (!user || !profile) {
    return null;
  }

  const avatarInitials =
    (profile.prenom?.charAt(0) || profile.nom?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6 flex items-center"
              onClick={() => router.push("/profile")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au profil
            </Button>

            <Card className="bg-white/5 rounded-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Modifier mon profil</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Photo de profil */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={photoPreview || profile.photo || ""} />
                      <AvatarFallback className="text-4xl bg-muted">
                        {avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={triggerFileInput}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Changer la photo
                    </Button>
                    <Input
                      ref={fileInputRef}
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés: JPG, PNG. Max 2Mo
                    </p>
                  </div>

                  {/* Informations de base */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Informations personnelles</h3>
                    
                    {/* Prénom */}
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="prenom"
                          name="prenom"
                          placeholder="Votre prénom"
                          className="pl-10 bg-white/10 border-white/20"
                          value={formData.prenom}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    {/* Nom */}
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nom"
                          name="nom"
                          placeholder="Votre nom"
                          className="pl-10 bg-white/10 border-white/20"
                          value={formData.nom}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    {/* Téléphone */}
                    <div className="space-y-2">
                      <Label htmlFor="tel">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="tel"
                          name="tel"
                          placeholder="Votre numéro de téléphone"
                          className="pl-10 bg-white/10 border-white/20"
                          value={formData.tel}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Champs spécifiques aux locataires */}
                  {!isOwner && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Informations de recherche</h3>
                      
                      {/* Ville */}
                      <CityAutocomplete
                        value={formData.ville}
                        onChange={(value, cityData) => {
                          setFormData(prev => ({ ...prev, ville: value }));
                          setSelectedCityData(cityData || null);
                        }}
                        label="Ville recherchée"
                        placeholder="Rechercher une ville..."
                      />
                      
                      {/* Objectif */}
                      <div className="space-y-2">
                        <Label htmlFor="objectif">Objectif de recherche</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            id="objectif"
                            name="objectif"
                            placeholder="Décrivez ce que vous recherchez (type de logement, durée, budget...)"
                            className="pl-10 min-h-[100px] bg-white/10 border-white/20"
                            value={formData.objectif}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}