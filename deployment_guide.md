# Netlify CLI Deployment Guide (macOS)

Follow these steps to deploy your LifeOS project to Netlify using the Command Line Interface.

## 1. Prerequisites
- [Netlify Account](https://app.netlify.com/signup)
- Node.js installed on your Mac

## 2. Install Netlify CLI
Open your terminal and run:
```bash
npm install netlify-cli -g
```

## 3. Login to Netlify
Authenticate the CLI with your Netlify account:
```bash
netlify login
```
This will open a browser window for authentication.

## 4. Initialize Netlify Project
In your project root directory (`life_os`), run:
```bash
netlify init
```
- Choose "Create & configure a new site"
- Select your Team
- Choose a site name (or leave blank for a random one)
- Build command: `npm run build`
- Directory to deploy: `build`
- Select "Yes" to create a `netlify.toml` (if it asks, though one already exists)

## 5. Environment Variables
Since this project uses Firebase, you must add your environment variables to Netlify:
```bash
netlify env:set VITE_FIREBASE_API_KEY "your_api_key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_auth_domain"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_project_id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_storage_bucket"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_sender_id"
netlify env:set VITE_FIREBASE_APP_ID "your_app_id"
```
*Alternatively, you can add them in the Netlify UI under Site Settings > Build & Deploy > Environment.*

## 6. Build and Deploy
### Production Deploy
To build and deploy to production:
```bash
npm run build
netlify deploy --prod
```

### Preview Deploy (Draft)
To deploy a draft version for testing:
```bash
netlify deploy
```

## 7. Useful CLI Commands
- `netlify status`: Check login status and site info
- `netlify open`: Open the Netlify admin panel for this site
- `netlify dev`: Run a local development server that emulates the Netlify environment
