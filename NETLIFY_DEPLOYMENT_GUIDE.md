# Netlify Deployment Guide

This guide explains how to deploy this application to Netlify.

## Prerequisites

1. A GitHub account
2. A Netlify account
3. Node.js 18+ installed locally (for testing)

## Project Structure Overview

This project is structured as follows:

- `client/`: Contains the React frontend code
- `server/`: Contains the Express backend code
- `shared/`: Contains shared schemas and types
- `netlify/functions/`: Contains serverless functions for Netlify deployment
- `netlify.toml`: Netlify configuration file
- `.nvmrc`: Node.js version specification

## Key Files for Netlify Deployment

1. **netlify.toml**: Configuration file that specifies build settings and redirects
2. **netlify/functions/api.js**: Serverless function that handles the backend API
3. **client/public/_redirects**: Redirect rules for the Netlify deployment
4. **.nvmrc**: Specifies the Node.js version for Netlify

## Deployment Steps

### 1. Push Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Connect Netlify to GitHub

1. Log in to your [Netlify account](https://app.netlify.com/)
2. Click "New site from Git"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository containing your project

### 3. Configure Deployment Settings

In the Netlify deployment settings, configure the following:

- **Build command**: `npm run build`
- **Publish directory**: `dist/public`

These settings are already defined in the `netlify.toml` file, but you should verify them in the Netlify interface.

### 4. Set Environment Variables

If your application uses environment variables (e.g., for database connections), set them in the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add environment variables as needed (e.g., `DATABASE_URL`)

### 5. Deploy

1. Click the "Deploy site" button in Netlify
2. Netlify will build and deploy your site
3. Once complete, Netlify will provide a URL for your deployed site

## How it Works

- The Netlify build process compiles your frontend code and deploys it to Netlify's CDN
- The serverless function in `netlify/functions/api.js` runs on Netlify's infrastructure
- API requests to `/api/*` are redirected to the serverless function using the configuration in `netlify.toml`
- The React frontend communicates with the serverless function as though it were a traditional API

## Testing the Deployment

After deploying, test your application:

1. Visit the URL provided by Netlify
2. Test all functionality to ensure it works as expected
3. Check the Netlify logs if you encounter any issues

## Additional Configuration

### Custom Domain

To use a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to set up DNS records

### Continuous Deployment

Netlify automatically sets up continuous deployment from your GitHub repository. Each push to the main branch will trigger a new deployment.

To disable automatic deployments:

1. Go to Site settings > Build & deploy > Continuous Deployment
2. Under "Build settings", select "Stop builds"

## Troubleshooting

If you encounter issues with your deployment:

1. Check the Netlify build logs for errors
2. Verify that all redirects are configured correctly in `netlify.toml` and `_redirects`
3. Ensure environment variables are set correctly
4. Test your application locally before deploying

For more help, refer to the [Netlify documentation](https://docs.netlify.com/).