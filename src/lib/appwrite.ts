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
export const APPWRITE_BUCKET_PHOTOSAPPART_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PHOTOSAPPART_ID!;

// --- TYPES ---
export type LogementData = {
  proprio: string; // userId
  titre: string;
  description: string;
  adresse: string;
  nombreColoc: number;
  m2?: number;
  equipement?: "wifi" | "cuisine" | "machine";
  datedispo: string; // ISO date
  photo1?: string;
  photo2?: string;
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

/** Créer un logement dans la collection Appwrite */
export async function createLogement(data: LogementData) {
  return databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COLLECTION_LOGEMENT_ID,
    ID.unique(),
    data
  );
}

// --- AUTH & INSCRIPTION (inchangés, juste déplacés) ---
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