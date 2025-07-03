import { account, ID } from "./appwrite";

export async function register(name, email, password) {
  return await account.create(ID.unique(), email, password, name);
}

export async function login(email, password) {
  return await account.createEmailSession(email, password);
}

export async function logout() {
  return await account.deleteSessions();
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (err) {
    return null;
  }
}
