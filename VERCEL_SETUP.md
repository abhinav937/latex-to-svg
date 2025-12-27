# Vercel Environment Variable Setup

## Steps to Add Gemini API Key to Vercel

1. **Go to your Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **Environment Variables**

2. **Add the Environment Variable**
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key from Google AI Studio
   - **Environment**: Select all environments (Production, Preview, Development)

3. **Redeploy**
   - After adding the environment variable, trigger a new deployment
   - The build script will automatically inject the API key into your app

## How It Works

- The build script (`scripts/inject-env.js`) runs after the Angular build
- It reads the `GEMINI_API_KEY` environment variable from Vercel
- It injects the API key into `index.html` as `window.GEMINI_API_KEY`
- The Gemini service reads from `window.GEMINI_API_KEY` at runtime

## Alternative: Manual Setup (for local development)

For local development, you can set the API key directly in the browser console:

```javascript
window.GEMINI_API_KEY = 'your-api-key-here';
```

Then refresh the page.

## Security Note

⚠️ **Important**: Since this is a client-side application, the API key will be visible in the browser. Consider:
- Using API key restrictions in Google Cloud Console
- Limiting the API key to specific domains
- Implementing rate limiting
- Using a serverless function proxy (more secure but requires backend code)
