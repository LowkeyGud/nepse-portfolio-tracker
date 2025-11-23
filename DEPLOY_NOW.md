# Quick Deployment Guide

## Step 1: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository named: `nepse-portfolio-tracker`
3. Don't initialize with README (we already have one)
4. Copy the repository URL

Then run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nepse-portfolio-tracker.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New Project"
4. Import `nepse-portfolio-tracker`
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Add Environment Variables (click "Environment Variables"):
   ```
   VITE_CLERK_PUBLISHABLE_KEY
   Value: pk_test_Z2VudWluZS1oYW1zdGVyLTg1LmNsZXJrLmFjY291bnRzLmRldiQ

   MONGODB_URI
   Value: mongodb+srv://sharetracker:7oZ9QDEJ2CewqfQK@cluster0.vhbxxra.mongodb.net/?appName=Cluster0
   ```

7. Click **Deploy**

## Step 3: Configure MongoDB Atlas

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

## Step 4: Configure Clerk

1. Go to Clerk Dashboard
2. Configure → Domains
3. Add your Vercel domain (e.g., `nepse-portfolio-tracker.vercel.app`)
4. Update allowed redirect URLs

## Step 5: Update API URL (After First Deploy)

1. Copy your Vercel URL (e.g., `https://nepse-portfolio-tracker.vercel.app`)
2. In Vercel Dashboard → Settings → Environment Variables
3. Add:
   ```
   VITE_API_URL
   Value: https://nepse-portfolio-tracker.vercel.app
   ```
4. Redeploy (Deployments → ... → Redeploy)

## ✅ Done!

Your app is now live at: `https://nepse-portfolio-tracker.vercel.app`

## Troubleshooting

**MongoDB Connection Error:**
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0

**Clerk Authentication Error:**
- Verify your domain is added in Clerk Dashboard

**API Not Working:**
- Make sure VITE_API_URL is set to your Vercel domain
- Check that all environment variables are added

**CORS Error:**
- The server.js already has CORS enabled, should work automatically
