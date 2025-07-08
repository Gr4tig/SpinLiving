import { Client, Account, Databases, Models, ID } from "appwrite";

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

export { client, account, databases };

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
    if (!email || !password || password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('Email ou mot de passe invalide (min 8 caractères)');
    }

    const userId = ID.unique();

    // Création du compte utilisateur
    await account.create(userId, email, password, `${prenom} ${name}`);

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

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      collectionId,
      ID.unique(),
      data
    );

    // Création de la session
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (err: any) {
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

