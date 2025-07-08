import { account } from "./appwrite";
import { ID, Models } from "appwrite";

export async function createAccount(email: string, password: string, name: string) {
  await account.create(ID.unique(), email, password, name);
  return login(email, password);
}

export async function login(email: string, password: string) {
  await account.createEmailSession(email, password);
  return getCurrentAccount();
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
