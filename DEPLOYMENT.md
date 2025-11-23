# NEPSE Portfolio Tracker - Deployment Guide

## 🚀 Deployment Steps

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your MongoDB Atlas URI
- Your Clerk Publishable Key

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - NEPSE Portfolio Tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_API_URL=https://your-backend-url.com
   ```

6. Click "Deploy"

### Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: nepse-portfolio-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   PORT=3001
   ```

6. Click "Create Web Service"

### Step 4: Update Frontend with Backend URL

1. Go back to Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your Render backend URL
4. Redeploy

### Step 5: Configure Clerk

1. Go to Clerk Dashboard
2. Add your Vercel domain to allowed origins
3. Update redirect URLs

## 🎉 Your app is now live!

### Alternative: Deploy Both on Vercel

You can also deploy both frontend and backend on Vercel:

1. The `vercel.json` file is already configured
2. Deploy to Vercel
3. Add all environment variables
4. Vercel will handle both the static site and API routes

## Environment Variables Summary

**Frontend (.env)**:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`

**Backend**:
- `MONGODB_URI`
- `PORT` (optional, defaults to 3001)

## Troubleshooting

- **CORS errors**: Make sure your backend allows requests from your frontend domain
- **API not working**: Check that VITE_API_URL is set correctly
- **MongoDB connection**: Verify your MongoDB Atlas IP whitelist includes 0.0.0.0/0 for serverless
