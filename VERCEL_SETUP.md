# Vercel Environment Variables Setup Guide

## Setting Up Environment Variables in Vercel

### Step 1: Access Your Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project dashboard
3. Click on "Settings" tab
4. Click on "Environment Variables" in the sidebar

### Step 2: Add Required Environment Variables

Add the following environment variables in your Vercel project settings:

#### Production Environment Variables:

```
Name: VITE_API_BASE_URL
Value: https://your-backend-app.onrender.com/api
Environment: Production

Name: VITE_APP_NAME
Value: TypeMonkey
Environment: Production

Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production

Name: VITE_NODE_ENV
Value: production
Environment: Production
```

#### Preview Environment Variables (Optional):

```
Name: VITE_API_BASE_URL
Value: https://your-staging-backend.onrender.com/api
Environment: Preview

Name: VITE_APP_NAME
Value: TypeMonkey (Preview)
Environment: Preview

Name: VITE_APP_VERSION
Value: 1.0.0-preview
Environment: Preview

Name: VITE_NODE_ENV
Value: development
Environment: Preview
```

### Step 3: Update Your Backend URL

**Important**: Replace `https://your-backend-app.onrender.com/api` with your actual Render backend URL.

To find your Render backend URL:
1. Go to your Render dashboard
2. Find your backend service
3. Copy the URL from the service details
4. Add `/api` to the end

Example: If your Render URL is `https://typemonkey-backend-xyz123.onrender.com`, then set:
```
VITE_API_BASE_URL=https://typemonkey-backend-xyz123.onrender.com/api
```

### Step 4: Redeploy Your Application

After adding the environment variables:
1. Go to the "Deployments" tab in Vercel
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Troubleshooting

#### Common Issues:

1. **"Environment Variable references Secret" Error**:
   - This happens when using `@` syntax in vercel.json
   - Solution: Remove the `env` section from vercel.json (already fixed)
   - Set variables directly in Vercel dashboard

2. **API calls failing**:
   - Check that `VITE_API_BASE_URL` is correctly set
   - Ensure the backend URL is accessible
   - Verify CORS settings in your backend

3. **Variables not updating**:
   - Make sure to redeploy after changing environment variables
   - Check that variable names start with `VITE_` prefix

#### Verification Steps:

1. Check browser console for the API base URL being used
2. Test API endpoints manually: `https://your-backend-url/api/health`
3. Verify environment variables in Vercel deployment logs

### Environment Variable Priority

Vercel loads environment variables in this order:
1. Environment Variables set in Vercel dashboard
2. `.env.local` (not recommended for production)
3. `.env.production` or `.env.development`
4. `.env`

### Security Notes

- Never commit actual production URLs to version control
- Use Preview environment for testing
- Regularly rotate sensitive credentials
- Monitor API usage and set appropriate rate limits

### Quick Setup Checklist

- [ ] Backend deployed to Render with correct CORS settings
- [ ] Frontend environment variables set in Vercel dashboard
- [ ] `VITE_API_BASE_URL` points to correct Render URL
- [ ] Application redeployed after environment variable changes
- [ ] API endpoints tested and working
- [ ] CORS configured to allow your Vercel domain
