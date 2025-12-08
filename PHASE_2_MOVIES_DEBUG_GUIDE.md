# Phase 2: Movies API Debugging Guide

## What We Did
Added **critical startup diagnostic logging** to see if `TMDB_API_KEY` is loaded when the backend starts.

The backend will now print during startup:
```
TMDB_API_KEY loaded: <value_here>
```

This will appear in Render's **deployment logs** (not runtime logs), so we can see immediately if the environment variable is being injected.

**Local test confirmed working:**
```
TMDB_API_KEY loaded: 04253a70fe55d02b56ecc5f48e52b255 ✅
```

Additionally, the `/api/discover/trending` endpoint logs:
- ✅ The actual API key value during requests
- ✅ The length of the API key (should be 32 characters)
- ✅ Whether the key is None/empty
- ✅ The TMDB API response status code

## How to Deploy to Render & Check Logs

### Step 1: Push Code to GitHub
The backend code has been updated with diagnostic logging. You need to push this to your GitHub repository:

```bash
git add backend/server.py
git commit -m "Add diagnostic logging for TMDB API key debugging"
git push origin main
```

### Step 2: Trigger Render Deployment
1. Go to your Render dashboard: https://dashboard.render.com
2. Find your backend service (likely named "cinescan-backend" or similar)
3. Render should auto-deploy when it detects the GitHub push
4. If not, click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 3: Wait for Deployment to Complete
- Watch the deployment logs in Render
- Wait for the status to show "Live" with a green checkmark

### Step 4: Trigger the Movies Endpoint
Once deployed, trigger the endpoint to generate logs:

```bash
curl https://cinescan-backend.onrender.com/api/discover/trending
```

Or simply open your REVEAL app and navigate to the Movies/Discover tab.

### Step 5: Check Render Deployment Logs (CRITICAL STEP)
1. In Render dashboard, go to your backend service
2. Click **"Logs"** tab
3. **First, look for the startup print statement:**
   ```
   TMDB_API_KEY loaded: <value>
   ```
   This appears during deployment/startup (scroll to the top of recent deployment logs).

4. **Then, look for runtime logs** (after triggering the endpoint):
   Lines starting with 🔍 and 📡:

```
🔍 TMDB_API_KEY received from environment: 'YOUR_KEY_HERE'
🔍 TMDB_API_KEY length: 32
🔍 TMDB_API_KEY is None: False
📡 Making TMDB API request to: https://api.themoviedb.org/3/trending/movie/week
📡 TMDB API response status: 200
```

## What to Look For

### ✅ GOOD SCENARIO (Everything Working):
```
🔍 TMDB_API_KEY received from environment: '04253a70fe55d02b56ecc5f48e52b255'
🔍 TMDB_API_KEY length: 32
🔍 TMDB_API_KEY is None: False
📡 TMDB API response status: 200
```

### ❌ BAD SCENARIO 1 (Key Missing):
```
🔍 TMDB_API_KEY received from environment: 'None'
🔍 TMDB_API_KEY length: 0
🔍 TMDB_API_KEY is None: True
❌ TMDB_API_KEY is missing or empty!
```
**Fix:** The environment variable is not set in Render. Go to Environment tab and add it.

### ❌ BAD SCENARIO 2 (Wrong Key Name):
If you see the key is None/empty, check that the environment variable name in Render is **exactly**:
```
TMDB_API_KEY
```
(Not `TMDB_KEY`, not `TMDB_API`, not `tmdb_api_key` - it's case-sensitive!)

### ❌ BAD SCENARIO 3 (Key Has Extra Characters):
```
🔍 TMDB_API_KEY received from environment: ' 04253a70fe55d02b56ecc5f48e52b255 '
🔍 TMDB_API_KEY length: 34
📡 TMDB API response status: 401
```
**Fix:** The key has extra spaces. Edit it in Render and remove spaces.

### ❌ BAD SCENARIO 4 (Wrong API Key):
```
🔍 TMDB_API_KEY received from environment: 'wrong_key_12345'
🔍 TMDB_API_KEY length: 16
📡 TMDB API response status: 401
```
**Fix:** The key is incorrect. Use the correct TMDB API key: `04253a70fe55d02b56ecc5f48e52b255`

## Next Steps
Once you check the Render logs, share what you see and we'll fix the issue based on what the logs reveal! 🔍

The correct TMDB API key for your project is:
```
04253a70fe55d02b56ecc5f48e52b255
```
