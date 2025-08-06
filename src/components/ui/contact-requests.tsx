"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  databases,
  APPWRITE_DATABASE_ID,
  updateContactRequestStatus
} from "@/lib/appwrite";
import { useAuth } from "@/lib/AuthProvider";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, Home, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Query } from "appwrite";

export function ContactRequests() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      if (!user || !profile) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 1. Récupérer toutes les demandes de contact
        const contactRequestsResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CONTACT_REQUESTS_ID!
        );
        
        if (contactRequestsResponse.documents.length === 0) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        // 2. Filtrer les demandes pour ne garder que celles dont le logement appartient à l'utilisateur actuel
        const filteredRequests = contactRequestsResponse.documents.filter(request => {
          // Vérifier si logement et proprio existent et sont accessibles
          const logement = request.logement;
          const proprio = logement?.proprio;
          
          // Vérifier si ce logement appartient à l'utilisateur actuel
          return proprio && proprio.userid === user.$id;
        });
        
        // 3. Trier par date de création (plus récent en premier)
        filteredRequests.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
        
        setRequests(filteredRequests);
      } catch (err) {
        console.error("Erreur lors du chargement des demandes:", err);
        setError("Impossible de charger les demandes");
      } finally {
        setLoading(false);
      }
    }
    
    fetchRequests();
  }, [user, profile]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      setProcessingId(requestId);
      await updateContactRequestStatus(requestId, newStatus);
      
      // Mettre à jour l'état local
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.$id === requestId 
            ? { ...request, Statut: newStatus } 
            : request
        )
      );
      
      toast.success(
        newStatus === 'accepted' 
          ? "Demande acceptée avec succès" 
          : "Demande refusée"
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setProcessingId(null);
    }
  };
  
  // États spéciaux
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="bg-white/5 rounded-lg border border-white/10">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-white/5 rounded-lg border border-white/10">
        <CardContent className="text-center py-8 text-red-400">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (requests.length === 0) {
    return (
      <Card className="bg-white/5 rounded-lg border border-white/10">
        <CardContent className="text-center py-8 text-muted-foreground">
          Aucune demande de contact pour le moment
        </CardContent>
      </Card>
    );
  }
  
  // Affichage des demandes
  return (
    <div className="space-y-4">
      {requests.map((request) => {
        // Extraction des données des objets imbriqués
        const logement = request.logement || {};
        const locataire = request.locataire || {};
        const adresse = logement.adresse || {};
        
        return (
          <Card 
            key={request.$id} 
            className={`bg-white/5 rounded-lg border ${
              request.Statut === 'pending' 
                ? 'border-yellow-600/30' 
                : request.Statut === 'accepted' 
                  ? 'border-green-600/30' 
                  : 'border-red-600/30'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{logement.titre || "Logement sans titre"}</CardTitle>
                <Badge 
                  variant={
                    request.Statut === 'pending' 
                      ? 'outline' 
                      : request.Statut === 'accepted' 
                        ? 'default' 
                        : 'destructive'
                  }
                >
                  {request.Statut === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                  {request.Statut === 'accepted' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {request.Statut === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                  {request.Statut === 'pending' 
                    ? 'En attente' 
                    : request.Statut === 'accepted' 
                      ? 'Acceptée' 
                      : 'Refusée'
                  }
                </Badge>
              </div>
              <CardDescription>
                {adresse.ville && (
                  <div className="flex items-center text-sm">
                    <Home className="mr-1 h-3 w-3" />
                    {adresse.ville}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-4 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={locataire.photo || ""} />
                  <AvatarFallback>
                    {locataire.prenom?.charAt(0) || locataire.nom?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{locataire.prenom} {locataire.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    Demande envoyée le {format(new Date(request.$createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
              
              {request.date_arrivee_souhaitee && (
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  Arrivée souhaitée: {format(
                    // Gérer différents formats possibles de date
                    typeof request.date_arrivee_souhaitee === 'string' && request.date_arrivee_souhaitee.includes('T') 
                      ? parseISO(request.date_arrivee_souhaitee)
                      : new Date(request.date_arrivee_souhaitee), 
                    "d MMMM yyyy", 
                    { locale: fr }
                  )}
                </div>
              )}
              
              {request.message && (
                <div className="mt-2 p-3 bg-white/5 rounded-md">
                  <p className="text-sm">{request.message}</p>
                </div>
              )}
            </CardContent>
            
            {request.Statut === 'pending' && (
              <CardFooter className="pt-0">
                <div className="flex justify-end gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="border-red-500/30 hover:bg-red-900/20 hover:text-red-200"
                    onClick={() => handleStatusUpdate(request.$id, 'rejected')}
                    disabled={processingId === request.$id}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate(request.$id, 'accepted')}
                    disabled={processingId === request.$id}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Accepter
                  </Button>
                </div>
              </CardFooter>
            )}
            
            {request.Statut === 'accepted' && locataire.tel && (
              <CardFooter className="pt-0">
                <div className="w-full">
                  <p className="text-sm text-muted-foreground">
                    Contact du locataire: <span className="font-medium text-primary">{locataire.tel}</span>
                  </p>
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}