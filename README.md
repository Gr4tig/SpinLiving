# Next.js starter kit with Appwrite

Kickstart your Next.js development with this ready-to-use starter project integrated with [Appwrite](https://www.appwrite.io).
It now includes simple pages for user registration, login and logout using the Appwrite `Account` API.

## 🚀Getting started

### Clone the Project
Clone this repository to your local machine using Git:

`git clone https://github.com/appwrite/starter-for-nextjs`

## 🛠️ Development guide
1. **Configure Appwrite**<br/>
   Copy `.env.example` to `.env` and update the values to match your Appwrite project credentials.
   When deploying to a platform like Vercel, ensure the `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   and `NEXT_PUBLIC_APPWRITE_PROJECT_ID` environment variables are available.
   Otherwise the Appwrite client will only be partially initialised.
2. **Customize as needed**<br/>
   Modify the starter kit to suit your app's requirements. Adjust UI, features, or backend
   integrations as per your needs.
3. **Install dependencies**<br/>
   Run `npm install` to install all dependencies.
4. **Run the app**<br/>
   Start the project by running `npm run dev`.
   Then visit `/signup` to create a new account or `/login` to authenticate.

## 💡 Additional notes
- This starter project is designed to streamline your Next.js development with Appwrite.
- Refer to the [Appwrite documentation](https://appwrite.io/docs) for detailed integration guidance.