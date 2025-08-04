import { Client, Account, Databases, Models, ID, Storage, Query } from "appwrite";

// --- INIT CLIENT ---
const client = new Client();

if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
} else {
  console.warn(
    "NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined. Appwrite will not be fully initialised."
  );
}

if (process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  client.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
} else {
  console.warn(
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined. Appwrite will not be fully initialised."
  );
}

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };

// --- ENV HELPERS ---
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const APPWRITE_COLLECTION_LOGEMENT_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOGEMENT_ID!;
export const APPWRITE_COLLECTION_ADRESSES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ADRESSES_ID!;
export const APPWRITE_COLLECTION_PHOTOSAPPART_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PHOTOSAPPART_ID!;
export const APPWRITE_BUCKET_PHOTOSAPPART_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PHOTOSAPPART_ID!;

// --- TYPES ---
export type LogementData = {
  proprio: string; // userId
  titre: string;
  description: string;
  nombreColoc: number;
  m2?: number;
  equipement?: "wifi" | "cuisine" | "machine";
  datedispo: string; // ISO date
  prix: string;
};

export type AdresseData = {
  ville: string;
  adresse: string;
  code_postal: string;
  logement?: string; // Relation ID - optionnel car créé après le logement
};

export type PhotosAppartData = {
  logement: string; // Relation ID
  "1"?: string; // URL photo 1
  "2"?: string; // URL photo 2
  "3"?: string; // URL photo 3
  "4"?: string; // URL photo 4
  "5"?: string; // URL photo 5
};

export type LogementCompletData = LogementData & {
  $id: string;
  adresse?: AdresseData & { $id: string };
  photos?: (PhotosAppartData & { $id: string });
};

// --- HELPERS ---

/** Récupérer l'utilisateur connecté (proprio) */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await account.get();
    return user.$id;
  } catch {
    return null;
  }
}

/** Upload une image sur Appwrite Storage, retourne son URL publique */
export async function uploadLogementImage(file: File): Promise<string> {
  const fileId = ID.unique();
  const uploaded = await storage.createFile(APPWRITE_BUCKET_PHOTOSAPPART_ID, fileId, file);
  // Attention : le bucket doit être public pour cette URL !
  return storage.getFileView(APPWRITE_BUCKET_PHOTOSAPPART_ID, uploaded.$id);
}

/** Créer un logement avec son adresse et ses photos */
export async function createLogement(
  logementData: LogementData, 
  adresseData: AdresseData,
  photos: {[key: string]: string} // Objet avec les URLs des photos (clés "1", "2", etc.)
) {
  try {
    // 1. Créer le logement principal
    const logement = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_LOGEMENT_ID,
      ID.unique(),
      logementData
    );

    // 2. Créer l'adresse associée
    const adresse = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ADRESSES_ID,
      ID.unique(),
      {
        ...adresseData,
        logement: logement.$id // Relation avec le logement
      }
    );

    // 3. Créer l'entrée pour les photos
    const photosData: PhotosAppartData = {
      logement: logement.$id,
      ...photos
    };

    const photosDoc = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_PHOTOSAPPART_ID,
      ID.unique(),
      photosData
    );

    return {
      ...logement,
      adresse,
      photos: photosDoc
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création du logement complet', error);
    throw error;
  }
}

/** Récupérer un logement avec son adresse et ses photos */
export async function getLogementComplet(logementId: string): Promise<LogementCompletData | null> {
  try {
    // 1. Récupérer le logement
    const logement = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_LOGEMENT_ID,
      logementId
    );

    // 2. Récupérer l'adresse associée
    const adresses = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ADRESSES_ID,
      [Query.equal('logement', logementId)]
    );
    
    const adresse = adresses.documents.length > 0 ? adresses.documents[0] : undefined;

    // 3. Récupérer les photos associées
    const photosDocs = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_PHOTOSAPPART_ID,
      [Query.equal('logement', logementId)]
    );
    
    const photos = photosDocs.documents.length > 0 ? photosDocs.documents[0] : undefined;

    return {
      ...logement,
      adresse,
      photos
    } as unknown as LogementCompletData;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du logement complet', error);
    return null;
  }
}

/** Rechercher des logements avec filtres */
export async function rechercherLogements(filtres: {
  ville?: string;
  nombreColoc?: number;
  equipement?: string;
  dateDispoMin?: string;
} = {}): Promise<LogementCompletData[]> {
  try {
    // Préparation des queries pour le logement
    const logementQueries: any[] = [];
    
    if (filtres.nombreColoc) {
      logementQueries.push(Query.equal('nombreColoc', filtres.nombreColoc));
    }
    
    if (filtres.equipement) {
      logementQueries.push(Query.equal('equipement', filtres.equipement));
    }
    
    if (filtres.dateDispoMin) {
      logementQueries.push(Query.greaterThanEqual('datedispo', filtres.dateDispoMin));
    }

    // Récupérer tous les logements qui correspondent aux critères de base
    const logements = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_LOGEMENT_ID,
      logementQueries
    );
    
    // Si aucun résultat, retourner un tableau vide
    if (logements.documents.length === 0) {
      return [];
    }
    
    // Récupérer toutes les adresses qui correspondent au filtre ville
    let adressesMatchingVille = null;
    if (filtres.ville) {
      adressesMatchingVille = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ADRESSES_ID,
        [Query.equal('ville', filtres.ville)]
      );
      
      // Si aucune adresse ne correspond à la ville, retourner un tableau vide
      if (adressesMatchingVille.documents.length === 0) {
        return [];
      }
    }
    
    // Construire un tableau complet avec les informations associées
    const logementsComplets = await Promise.all(
      logements.documents.map(async (logement) => {
        // Récupérer l'adresse associée au logement
        const adresses = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_ADRESSES_ID,
          [Query.equal('logement', logement.$id)]
        );
        
        const adresse = adresses.documents.length > 0 ? adresses.documents[0] : undefined;
        
        // Si on a un filtre ville et que l'adresse ne correspond pas, ignorer ce logement
        if (filtres.ville && adressesMatchingVille && 
            !adressesMatchingVille.documents.some(a => a.$id === adresse?.$id)) {
          return null;
        }
        
        // Récupérer les photos associées
        const photosDocs = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          APPWRITE_COLLECTION_PHOTOSAPPART_ID,
          [Query.equal('logement', logement.$id)]
        );
        
        const photos = photosDocs.documents.length > 0 ? photosDocs.documents[0] : undefined;
        
        return {
          ...logement,
          adresse,
          photos
        } as unknown as LogementCompletData;
      })
    );
    
    // Filtrer les logements nuls (ceux qui ne correspondaient pas au filtre ville)
    return logementsComplets.filter(Boolean) as LogementCompletData[];
  } catch (error) {
    console.error('❌ Erreur lors de la recherche de logements', error);
    return [];
  }
}

// --- AUTH & INSCRIPTION (inchangés) ---
export async function register(
  email: string,
  password: string,
  name: string,
  prenom: string,
  tel: string,
  ville: string,
  objectif: string,
  photo: string,
  accountType: "locataire" | "proprietaire"
): Promise<Models.Session> {
  const MIN_PASSWORD_LENGTH = 8;

  try {
    console.log("[register] Début de la fonction", { email, accountType });

    if (!email || !password || password.length < MIN_PASSWORD_LENGTH) {
      console.error("[register] Email ou mot de passe invalide");
      throw new Error('Email ou mot de passe invalide (min 8 caractères)');
    }

    const userId = ID.unique();
    console.log("[register] userId généré :", userId);

    // Création du compte utilisateur
    console.log("[register] Création du compte utilisateur...");
    await account.create(userId, email, password, `${prenom} ${name}`);
    console.log("[register] Compte utilisateur créé");

    // Attendre un court instant pour s'assurer que le compte est bien créé
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Création du document dans la bonne collection
    let collectionId = "";
    let data: Record<string, any> = {};

    if (accountType === "locataire") {
      collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LOCATAIRE_ID!;
      data = { nom: name, prenom, tel, ville, objectif, photo, userid: userId };
    } else {
      collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPRIO_ID!;
      data = { nom: name, prenom, tel, photo, userid: userId };
    }

    console.log("[register] Données du document à créer :", { collectionId, data });

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      collectionId,
      ID.unique(),
      data
    );
    console.log("[register] Document créé dans la collection", collectionId);

    // Création de la session
    console.log("[register] Création de la session...");
    const session = await account.createEmailPasswordSession(email, password);
    console.log("[register] Session créée avec succès");

    return session;
  } catch (err: any) {
    console.error("[register] Erreur attrapée :", err);
    throw err;
  }
}

export async function login(
  email: string,
  password: string
): Promise<Models.Session> {
  try {
    if (!email || !password) {
      throw new Error('Email ou mot de passe invalide');
    }

    // ✅ Uniformiser avec createEmailSession
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (err: any) {
    console.error('❌ Erreur Appwrite.login()', err);
    
    if (err.code === 429) {
      console.warn('⏱ Trop de requêtes envoyées à Appwrite');
      throw new Error('Trop de tentatives. Réessaie dans 30 secondes.');
    }
    if (err.code === 401) {
      throw new Error('Email ou mot de passe incorrect');
    }
    if (err.code === 404) {
      throw new Error('Aucun compte trouvé avec cet email');
    }

    throw new Error('Une erreur est survenue lors de la connexion');
  }
}

export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (err: any) {
    console.error('❌ Erreur Appwrite.logout()', err);
    throw new Error('Une erreur est survenue lors de la déconnexion');
  }
}

// Fonction pour trouver l'ID du document proprio lié à l'utilisateur courant
export async function getProprioDocIdByUserId(userId: string): Promise<string | null> {
  const collectionProprio = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROPRIO_ID!;
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const result = await databases.listDocuments(dbId, collectionProprio, [
    Query.equal("userid", [userId]),
  ]);
  return result.documents[0]?.$id ?? null;
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PHOTOS_ID!;
  const res = await storage.createFile(bucketId, ID.unique(), file);
  // URL d’accès public ou preview (selon config bucket)
  // Pour un accès sécurisé, il faut générer une URL de preview, sinon utilise getFileView
  return storage.getFileView(bucketId, res.$id);
}