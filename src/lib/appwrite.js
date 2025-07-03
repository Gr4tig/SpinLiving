import { Client, Account, Databases } from "appwrite";

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
