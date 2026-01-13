# Deploying to GitHub and Vercel

This guide explains how to deploy the Thinking Robot Knowledge Base to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier works)
3. Your Supabase project already set up with tables created

## Step 1: Export to GitHub

### Option A: From Replit
1. In Replit, click the three dots menu (⋮) next to your project name
2. Select "Export to GitHub"
3. Choose or create a repository name
4. Click "Export"

### Option B: Manual Export
1. Download the project files from Replit
2. Create a new GitHub repository
3. Push the files to the repository

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Connect your GitHub account if not already connected
4. Select the repository you just created
5. Vercel should auto-detect the Vite framework

### Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://lsdarxflmcjqzxqajrvz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Ld1e-5tFhGNbSmYddT-VLQ_7gUVT23D` |

### Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at `your-project.vercel.app`

## Step 3: Configure Supabase (if not done)

Make sure you've run the SQL schema in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Create an admin user in Authentication → Users

## Custom Domain (Optional)

1. In Vercel, go to your project settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Ensure the repository has all required files

### App Loads but Shows Empty
- Verify the Supabase tables were created
- Check browser console for errors
- Confirm environment variables are correct

### Can't Login as Admin
- Make sure you created a user in Supabase Authentication
- Verify RLS policies allow authenticated write access

## Architecture Notes

- **Frontend Only**: Vercel only hosts the React frontend
- **Backend**: Supabase provides the database and authentication
- **No Server**: The Express server in this project is only for local development

The frontend communicates directly with Supabase using the JavaScript client library.
