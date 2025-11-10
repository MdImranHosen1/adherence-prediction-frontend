# GitHub Pages Deployment Guide

## Quick Deploy Steps

1. **Make sure all changes are committed:**
   ```powershell
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

2. **Deploy to GitHub Pages:**
   ```powershell
   npm run deploy
   ```

3. **Enable GitHub Pages (first time only):**
   - Go to: https://github.com/MdImranHosen1/adherence-prediction-frontend/settings/pages
   - Under "Source", select `gh-pages` branch
   - Click Save

4. **Your app will be live at:**
   ```
   https://mdimranhosen1.github.io/adherence-prediction-frontend
   ```

## What Was Configured

✅ Added `homepage` field to package.json  
✅ Added `predeploy` and `deploy` scripts  
✅ Installed `gh-pages` package  

## Troubleshooting

### 404 Error on Refresh
If you get a 404 error when refreshing pages, this is because GitHub Pages doesn't support client-side routing by default. You can:
- Use HashRouter instead of BrowserRouter
- Add a custom 404.html that redirects to index.html

### Blank Page
If you see a blank page:
- Check the browser console for errors
- Verify the `homepage` URL in package.json matches your GitHub Pages URL
- Make sure all resource paths are relative (no leading `/`)

### Updating the Deployment
To update your deployed app after making changes:
```powershell
npm run deploy
```

This will automatically rebuild and redeploy your app.
