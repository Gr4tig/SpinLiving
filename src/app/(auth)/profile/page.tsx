"use client";

import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Edit, Home, Plus, List, Search } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useEffect } from "react";
import MesAnnonces from "@/components/ui/mes-annonces";
import { ContactRequests } from "@/components/ui/contact-requests";

export default function Profile() {
  const { user, profile, isOwner, logout, loading } = useAuth();
  const router = useRouter();

  // Rediriger uniquement si le chargement est fini et qu'on a ni user ni profile
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace("/");
    }
  }, [user, profile, loading, router]);

  // Loader ou rien tant que c'est en attente
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  if (!user || !profile) {
    return null;
  }

  const fullName = `${profile.prenom} ${profile.nom}`.trim();
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
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 mt-10">
              {/* Sidebar */}
              <div className="w-full md:w-1/3">
                <Card className="bg-white/5 rounded-lg border border-white/10 ">
                  <CardHeader className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile.photo || ""} />
                      <AvatarFallback className="text-2xl bg-muted">
                        {avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{fullName || user.email}</CardTitle>
                    <CardDescription>
                      {isOwner ? "Propriétaire" : "Locataire"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        Membre depuis{" "}
                        {user.registration
                          ? new Date(user.registration).toLocaleDateString("fr-FR")
                          : "?"}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Mon profil
                        </Link>
                      </Button>
                      {isOwner && (
                        <>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/logement/creation">
                              <Plus className="mr-2 h-4 w-4" />
                              Créer une annonce
                            </Link>
                          </Button>
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/listings">
                              <List className="mr-2 h-4 w-4" />
                              Mes annonces
                            </Link>
                          </Button>
                        </>
                      )}
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/">
                          <Home className="mr-2 h-4 w-4" />
                          Retour à l'accueil
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        await logout();
                        router.replace("/");
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Main Content */}
              <div className="w-full md:w-2/3">
                <Card className="bg-white/5 rounded-lg border border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">Information du profil</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile/edit">
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Nom complet</h3>
                      <p className="text-base">{fullName || "Non renseigné"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-base">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                      <p className="text-base">{profile.tel || "Non renseigné"}</p>
                    </div>
                    {/* Spécifique locataire */}
                    {"ville" in profile && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Ville</h3>
                        <p className="text-base">{profile.ville || "Non renseigné"}</p>
                      </div>
                    )}
                    {"objectif" in profile && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Objectif</h3>
                        <p className="text-base">{profile.objectif || "Non renseigné"}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Type de compte</h3>
                      <p className="text-base capitalize">{isOwner ? "propriétaire" : "locataire"}</p>
                    </div>
                  </CardContent>
                </Card>

                {isOwner ? (
                  <Tabs defaultValue="listings" className="mt-8">
                    <TabsList className="bg-white/5 rounded-lg border border-white/10 grid w-full grid-cols-2 gap-4">
                    <TabsTrigger
                        value="listings"
                        className="focus:bg-secondary data-[state=active]:bg-secondary data-[state=active]:text-white rounded"
                    >
                        Mes annonces
                    </TabsTrigger>
                    <TabsTrigger
                        value="requests"
                        className="focus:bg-secondary data-[state=active]:bg-secondary data-[state=active]:text-white rounded"
                    >
                        Demandes reçues
                    </TabsTrigger>
                    </TabsList>
                    <TabsContent value="listings" className="mt-4">
                      <Card className="bg-white/5 rounded-lg border border-white/10 ">
                        <CardHeader>
                          <CardTitle>Vos annonces</CardTitle>
                          <CardDescription>
                            Gérez les logements que vous proposez à la location
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Link href="/listings" className="block">
                            <Button className="w-full">
                              <List className="mr-2 h-4 w-4" />
                              Voir toutes mes annonces
                            </Button>
                          </Link>
                          <Link href="/logement/creation" className="block">
                            <Button variant="outline" className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Créer une nouvelle annonce
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="requests" className="mt-4">
                      <ContactRequests />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Card className="mt-8 bg-white/5 rounded-lg border border-white/10 ">
                    <CardHeader>
                      <CardTitle>Recherche de logements</CardTitle>
                      <CardDescription>
                        Trouvez le logement idéal pour votre prochain séjour
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        En tant que locataire, vous pouvez rechercher des logements disponibles et contacter les propriétaires.
                      </p>
                      <Link href="/logement/recherche" className="block">
                        <Button className="w-full">
                          <Search className="mr-2 h-4 w-4" />
                          Rechercher un logement
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}