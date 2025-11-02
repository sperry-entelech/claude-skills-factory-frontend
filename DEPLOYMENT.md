# Skills Factory Frontend - Deployment Guide

## Deploy to Vercel (Recommended)

### Method 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Navigate to frontend directory:
```bash
cd frontend
```

4. Deploy:
```bash
vercel
```

5. Follow prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - What's your project's name? **skills-factory-frontend**
   - In which directory is your code located? **./frontend**
   - Want to override settings? **No**

6. Add environment variable:
```bash
vercel env add VITE_API_URL
# Enter your backend URL: https://your-backend.railway.app/api
```

7. Deploy to production:
```bash
vercel --prod
```

### Method 2: Vercel Dashboard (GitHub Integration)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend.railway.app/api`

6. Click "Deploy"

## Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
cd frontend
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Or use Netlify dashboard:
   - Go to https://app.netlify.com
   - Drag and drop the `dist` folder
   - Add environment variable: `VITE_API_URL`

## Post-Deployment

Your frontend will be live at:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`

Make sure to update `VITE_API_URL` with your production backend URL.
