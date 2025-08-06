"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { databases, APPWRITE_DATABASE_ID, getLogementComplet, deleteLogement } from "@/lib/appwrite";
import { Query } from "appwrite";
import { formatDateSafe } from "@/lib/utils"; // Assurez-vous que cette fonction est définie correctement

// Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";

// Icons
import { Home, Edit, Trash2, Eye, Plus, Calendar, MapPin, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Types
interface Logement {
  $id: string;
  $createdAt : string;
  titre: string;
  description?: string;
  m2?: number;
  nombreColoc?: number;
  prix?: string | number;
  datedispo: string;
  publicId: string;
  photos?: {
    [key: string]: string;
  };
  adresse?: {
    ville: string;
    code_postal: string;
    adresse: string;
    [key: string]: any; // Pour gérer d'autres propriétés possibles
  };
  $updatedAt: string;
  [key: string]: any; // Cette ligne permet d'accepter d'autres propriétés non listées explicitement
}

export default function MesAnnonces() {
  const { user, profile, isOwner } = useAuth();
  const router = useRouter();
  const [logements, setLogements] = useState<Logement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logementToDelete, setLogementToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rediriger les utilisateurs non-propriétaires
  useEffect(() => {
    if (user && !isOwner) {
      toast.error("Cette page est réservée aux propriétaires");
      router.push("/profile");
    }
  }, [user, isOwner, router]);

  useEffect(() => {
    async function fetchLogements() {
      if (!user || !isOwner) return;
  
      try {
        setLoading(true);
        
        // 1. Récupérer le document propriétaire pour l'utilisateur actuel
        const proprioResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPRIO_ID!,
          [Query.equal('userid', user.$id)]
        );
        
        if (proprioResponse.documents.length === 0) {
          setError("Profil propriétaire non trouvé");
          setLoading(false);
          return;
        }
        
        const proprioDocId = proprioResponse.documents[0].$id;
        
        // 2. Récupérer tous les logements de ce propriétaire
        const logementsResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGEMENT_ID!,
          [Query.equal('proprio', proprioDocId)]
        );
        
        // 3. Utiliser getLogementComplet pour chaque logement trouvé
        const logementsComplets = await Promise.all(
          logementsResponse.documents.map(async (logement) => {
            try {
              // Cette fonction récupère toutes les relations (adresse, photos, etc.)
              return await getLogementComplet(logement.$id);
            } catch (err) {
              console.error("Erreur lors de la récupération des détails du logement:", err);
              return logement;
            }
          })
        );
        
        // Tri des logements (plus récent en premier)
        logementsComplets.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
        
        // Utiliser une conversion de type pour résoudre l'erreur TypeScript
        setLogements(logementsComplets as unknown as Logement[]);
      } catch (err) {
        console.error("Erreur lors du chargement des logements:", err);
        setError("Impossible de charger vos annonces");
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogements();
  }, [user, isOwner]);

  // Fonction pour supprimer un logement
  const confirmDeleteLogement = (id: string) => {
    setLogementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteLogement = async () => {
    if (!logementToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Appeler la fonction de suppression
      await deleteLogement(logementToDelete);
      
      // Mettre à jour l'état local
      setLogements(prevLogements => 
        prevLogements.filter(l => l.$id !== logementToDelete)
      );
      
      toast.success("Annonce supprimée avec succès");
      
    } catch (err) {
      console.error("Erreur lors de la suppression du logement:", err);
      toast.error("Impossible de supprimer cette annonce");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLogementToDelete(null);
    }
  };

  // Filtrer les logements selon l'onglet actif
  const getFilteredLogements = () => {
    if (activeTab === "all") return logements;
    
    const today = new Date();
    
    if (activeTab === "available") {
      return logements.filter(logement => {
        const dateDispoStr = logement.datedispo;
        if (!dateDispoStr) return false;
        
        const dateDispo = new Date(dateDispoStr);
        return dateDispo <= today;
      });
    }
    
    if (activeTab === "upcoming") {
      return logements.filter(logement => {
        const dateDispoStr = logement.datedispo;
        if (!dateDispoStr) return false;
        
        const dateDispo = new Date(dateDispoStr);
        return dateDispo > today;
      });
    }
    
    return logements;
  };

  // Si l'utilisateur n'est pas connecté ou n'est pas propriétaire
  if (!user || !isOwner) {
    return null; // Redirection gérée dans le useEffect
  }

  // États de l'UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Mes annonces</h1>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-white/5 rounded-lg border border-white/10">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Mes annonces</h1>
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredLogements = getFilteredLogements();

  return (
    <div className="min-h-screen flex mt-10 flex-col">
      <div className="flex-grow container py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mes annonces</h1>
            <Button asChild>
              <Link href="/logement/creation">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle annonce
              </Link>
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-white/5 rounded-lg border border-white/10 grid w-full grid-cols-3 gap-4">
              <TabsTrigger
                value="all"
                className="focus:bg-secondary data-[state=active]:bg-secondary data-[state=active]:text-white rounded"
              >
                Toutes
              </TabsTrigger>
              <TabsTrigger
                value="available"
                className="focus:bg-secondary data-[state=active]:bg-secondary data-[state=active]:text-white rounded"
              >
                Disponibles
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="focus:bg-secondary data-[state=active]:bg-secondary data-[state=active]:text-white rounded"
              >
                À venir
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredLogements.length === 0 ? (
            <Card className="bg-white/5 rounded-lg border border-white/10">
              <CardContent className="text-center py-12 text-muted-foreground">
                <Home className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p className="text-lg mb-4">Vous n'avez pas encore d'annonce {activeTab !== "all" ? "dans cette catégorie" : ""}</p>
                <Button asChild>
                  <Link href="/logement/creation">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une annonce
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredLogements.map((logement) => {
                // Déterminer si le logement est disponible
                const isAvailable = new Date(logement.datedispo) <= new Date();

                return (
                  <Card key={logement.$id} className="bg-white/5 rounded-lg border border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{logement.titre}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {logement.adresse ? (
                              <span className="flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {`${logement.adresse.adresse}, ${logement.adresse.code_postal} ${logement.adresse.ville}`}
                              </span>
                            ) : (
                              <span className="text-gray-400">Adresse non renseignée</span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={isAvailable ? "default" : "outline"}
                          className={isAvailable ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : "border-yellow-600/30 text-yellow-400"}
                        >
                          {isAvailable ? (
                            <><CheckCircle className="mr-1 h-3.5 w-3.5" /> Disponible</>
                          ) : (
                            <><Clock className="mr-1 h-3.5 w-3.5" /> À venir</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-32 h-24 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                          {logement.photos && logement.photos["1"] ? (
                            <img 
                              src={logement.photos["1"]} 
                              alt={logement.titre} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Home className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {/* Informations principales */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                            {logement.prix && (
                              <div className="text-lg font-semibold text-primary">
                                {logement.prix}€/mois
                              </div>
                            )}
                            
                            {logement.m2 && (
                              <div className="text-sm text-gray-300">
                                {logement.m2} m²
                              </div>
                            )}
                            
                            {logement.nombreColoc && (
                              <div className="text-sm text-gray-300">
                                {logement.nombreColoc} {logement.nombreColoc > 1 ? 'colocataires' : 'colocataire'}
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-300 flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              Disponible {isAvailable 
                                ? "maintenant" 
                                : `à partir du ${new Date(logement.$createdAt).toLocaleDateString("fr-FR")}`
                              }
                            </div>
                          </div>
                          
                          {/* Extrait de la description */}
                          {logement.description && (
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {logement.description}
                            </p>
                          )}
                          
                          {/* Date de création */}
                          <div className="mt-3 text-xs text-gray-400">
                            Annonce créée le {new Date(logement.$createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-gray-800 pt-4">
                      <div className="flex justify-end gap-3 w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-500/30 hover:bg-red-900/20 hover:text-red-200"
                          onClick={() => confirmDeleteLogement(logement.$id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Supprimer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link href={`/logement/edition/${logement.$id}`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Modifier
                          </Link>
                        </Button>
                        <Button 
                          size="sm"
                          asChild
                        >
                          <Link href={`/logement/${logement.publicId}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Voir l'annonce
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#19191B] border border-gray-800">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLogement}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}