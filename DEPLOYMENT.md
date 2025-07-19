# Deployment Guide

This guide explains how to deploy the TypeMonkey application with the frontend on Vercel and backend on Render.

## Prerequisites

1. **MongoDB Atlas Account**: Create a free MongoDB Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com/)
3. **Render Account**: Sign up at [render.com](https://render.com/)

## Backend Deployment (Render)

### 1. Prepare Your Code

1. Push your code to a GitHub repository
2. Ensure all environment variables are configured

### 2. Deploy to Render

1. Go to [render.com](https://render.com/) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `typemonkey-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typing-test-db
FRONTEND_URL=https://your-frontend-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Important**: 
- Generate a strong JWT_SECRET (use a tool like [generate-secret.now.sh](https://generate-secret.now.sh/64))
- Get your MONGODB_URI from MongoDB Atlas
- Update FRONTEND_URL after deploying the frontend

### 4. Deploy

Click "Deploy Web Service" and wait for the deployment to complete.

Your backend URL will be: `https://your-backend-app.onrender.com`

## Frontend Deployment (Vercel)

### 1. Update Environment Variables

Update your `.env` file with your backend URL:

```
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=TypeMonkey
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### 2. Deploy to Vercel

#### Option 1: Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel login`
3. Run: `vercel` and follow the prompts

#### Option 2: Using GitHub Integration

1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables in Vercel

In the Vercel dashboard, go to Settings → Environment Variables and add:

**For Production:**
```
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=TypeMonkey
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

**Important Notes:**
- Replace `your-backend-app` with your actual Render service name
- Make sure to include `/api` at the end of the backend URL
- Set these for "Production" environment in Vercel
- Do NOT use the `@secret` syntax in vercel.json (it's been removed)

### 4. Update Backend CORS

After getting your Vercel URL, update the `FRONTEND_URL` in your Render backend environment variables:

```
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## Final Steps

1. **Test the deployment**: Visit your Vercel URL and ensure everything works
2. **Update DNS** (optional): Configure custom domains in both platforms
3. **Monitor**: Check logs in both Render and Vercel dashboards

## Troubleshooting

### Backend Issues
- Check Render logs for database connection errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)

### Frontend Issues
- Check browser console for CORS errors
- Verify API endpoints are correctly configured
- Ensure environment variables are prefixed with `VITE_`

### CORS Issues
- Make sure `FRONTEND_URL` in backend matches your actual Vercel URL
- Check that both HTTP and HTTPS protocols are handled correctly

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Limit MongoDB Atlas IP access** if possible
4. **Enable HTTPS** for all communications
5. **Monitor API usage** and adjust rate limits as needed

## Performance Tips

1. **Enable caching** for static assets
2. **Use CDN** for better global performance
3. **Monitor response times** and optimize queries
4. **Implement proper error handling** and logging
