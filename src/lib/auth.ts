import { account } from "./appwrite";
import { ID, Models } from "appwrite";

export async function createAccount(email: string, password: string, name: string) {
  await account.create(ID.unique(), email, password, name);
  return login(email, password);
}

export async function login(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    
    // Vérifier si l'email est vérifié
    const user = await account.get();
    const isVerified = user.emailVerification;
    
    // Stocker l'état de vérification dans un cookie pour le middleware
    document.cookie = `email-verified=${isVerified}; path=/;`;
    
    return session;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

export async function getCurrentAccount(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch (err) {
    return null;
  }
}

export async function logout() {
  try {
    await account.deleteSession("current");
  } catch (err) {
    console.error(err);
  }
}

