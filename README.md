# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

The app runs at **http://localhost:3000** (Next.js default).

## Environment variables

Copy `.env.example` to `.env.local` and set:

- **GEMINI_API_KEY** – From [Google AI Studio](https://aistudio.google.com/app/apikey). Used server-side to compute risk and alerts from dashboard inputs.
- **NEXT_PUBLIC_FIREBASE_DATABASE_URL** – Your Firebase Realtime Database URL (e.g. `https://ventria-f106e-default-rtdb.europe-west1.firebasedatabase.app`). Optional: add other `NEXT_PUBLIC_FIREBASE_*` from Firebase Console if you use the Firebase client elsewhere.

For Firebase Realtime Database to accept writes from the app, ensure **Database rules** allow access (e.g. for development you can temporarily set `"rules": { ".read": true, ".write": true }` in Firebase Console → Realtime Database → Rules; for production use authenticated rules).

## AI analysis and Firebase storage

- **Compute with AI**: On the Patient Dashboard, **Compute with AI** sends current metrics (heart rate, HRV, steps, sleep, weight, symptoms) to the Gemini API. The model returns risk level, risk score, alerts, flags, and a plausible medications list (faked where not provided). This data is shown in the Overall Status pill, AI Risk Engine tab, alert badges, and Medications tab.
- **Firebase**: The same analysis and inputs are saved to your Firebase Realtime Database under `users/<userId>/` so returning users see their last computed state. User ID is stored in `localStorage` (`ventria.userId`).

## Apple Watch (CardioGuard) import

Ventria can receive heart rate, HRV, steps, sleep, weight, and risk data from the **CardioGuard** iOS app (Apple Watch + HealthKit):

1. **In CardioGuard**: Open Settings and set the **Web dashboard URL** to your Ventria base URL (e.g. `https://your-ventria-domain.com` or `http://localhost:3000` when testing). Sync from the app to push data to Ventria.
2. **In Ventria**: Open the Patient Dashboard and use the **Import from Apple Watch (CardioGuard)** section. Enter the **sync code** returned by CardioGuard (if any) and click **Load data** to display the latest sync. The dashboard will show last sync time, live HR/HRV when available, and use Apple Watch metrics for charts when sync data exists.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Next.js** (App Router)
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

It includes an **API route** `POST /api/sync` and `GET /api/sync` for receiving and retrieving Apple Watch data from the CardioGuard app.

## How can I deploy this project?

### Deploy on Railway

1. **Create a project** at [railway.app](https://railway.app) and connect this repo. Set the **root directory** to `Ventria-1` if the repo root is the parent folder.

2. **Set environment variables** in Railway: Project → your service → **Variables**. Add every variable from `.env.example` (no real keys are stored in the repo):
   - `GEMINI_API_KEY` – from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and any other `NEXT_PUBLIC_FIREBASE_*` from Firebase Console

3. **Deploy**: Railway will run `npm run build` then `npm run start`. The app uses Next.js `output: "standalone"` for a smaller, production-ready image.

**Secrets:** All secrets live only in Railway Variables (or in a local `.env` / `.env.local` for dev). Never commit `.env` or `.env.local`; `.env.example` is the only env file in the repo and contains no real values.

You can also use [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) → Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
