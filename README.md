# QuicReF Project

A task platform application that allows users to create tasks, submit proofs of completion, and earn rewards.

## Project Structure

This project is organized as a full-stack JavaScript application with client and server components:

- **client**: Front-end React application built with Vite
- **server**: Express.js backend with API routes
- **shared**: Common code shared between client and server

![Project Structure](/project-structure.svg)

## Deployment Guide for Netlify

### Prerequisites

- A GitHub account
- A Netlify account
- Node.js version 18+ (as specified in `.nvmrc`)

### Deployment Steps

1. **Push your code to GitHub**

   Create a new repository on GitHub and push your code to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Netlify**

   - Log in to your Netlify account
   - Click "Add New Site" > "Import an existing project"
   - Connect to your GitHub account and select your repository
   - Configure the build settings as follows:
     - Build command: `npm run build`
     - Publish directory: `dist/public`
     - Node.js version: 18.x (automatically detected from `.nvmrc`)

3. **Environment Variables**

   If your application requires environment variables, add them in the Netlify dashboard:
   - Go to Site settings > Build & deploy > Environment > Environment variables
   - Add any required variables (e.g., API keys, database connection strings)

4. **Deploy Your Site**

   - Click "Deploy site" to start the deployment process
   - Netlify will build your project and deploy it to a random subdomain
   - Once deployed, you can assign a custom domain in the Netlify dashboard

### Important Configuration Files

- **netlify.toml**: Contains build settings and redirect rules for Netlify
  ```toml
  [build]
    base = ""
    publish = "dist/public"
    command = "npm run build"
    functions = "netlify/functions"

  [build.environment]
    NODE_VERSION = "18"
    NPM_VERSION = "9"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

- **.nvmrc**: Specifies the Node.js version for deployment
  ```
  18
  ```

### Notes on CI/CD

- Netlify automatically deploys when you push changes to your GitHub repository
- You can set up branch deploys for development/staging environments
- Preview deploys are created for pull requests

### Using Netlify CLI for Deployment

If you prefer using the command line for deployment:

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```bash
   netlify login
   ```

3. Link your local project with a Netlify site:
   ```bash
   netlify link
   ```

4. Deploy your site:
   ```bash
   netlify deploy
   ```

5. For production deployment:
   ```bash
   netlify deploy --prod
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## Project Features

- User authentication
- Task creation and management
- Task submission and review
- Wallet system with deposits and withdrawals
- Referral system
- Admin dashboard

## Technology Stack

- React
- TypeScript
- Express.js
- Drizzle ORM
- Tailwind CSS
- shadcn/ui
- Vite

## Troubleshooting Common Deployment Issues

### Build Fails Due to Node.js Version

**Problem**: Build fails with dependency errors.

**Solution**: Ensure your `.nvmrc` file specifies Node.js 18 and that Netlify is correctly using this version. Check in the Netlify dashboard under Site settings > Build & deploy > Environment > Environment variables that `NODE_VERSION` is set to 18.

### API Routes Not Working

**Problem**: Frontend works but API calls return 404 errors.

**Solution**: This is a single-page application (SPA) with the API backend running separately. Netlify is not suitable for hosting the backend portion directly. You need to:

1. Deploy only the frontend (client) portion to Netlify
2. Deploy the backend separately to a service like Heroku, Railway, or Render
3. Update the API URLs in your frontend code to point to your backend service

### React Router Routes Show 404 on Refresh

**Problem**: Direct navigation to routes works, but refreshing the page shows a 404.

**Solution**: Make sure your `netlify.toml` file has the proper redirect configuration:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Static Assets Not Loading

**Problem**: Images or other static assets aren't loading after deployment.

**Solution**: Check that your asset paths are correct. In a Vite project, you should:

1. Place static assets in the `public` folder
2. Reference them with absolute paths starting with `/`
3. For imported assets, verify the `build.outDir` setting in your `vite.config.ts` is set correctly

### Environment Variables Not Available

**Problem**: Environment variables defined in `.env` files aren't accessible in production.

**Solution**: 
1. Netlify requires manually adding all environment variables in the dashboard
2. For frontend-accessible variables, they must be prefixed with `VITE_` 
3. Add them in Netlify under Site settings > Build & deploy > Environment > Environment variables