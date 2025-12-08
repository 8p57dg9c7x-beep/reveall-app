# 🔧 Render Deployment Troubleshooting

## ❌ Current Status

**All API endpoints are returning 404 errors.**

The diagnosis shows `x-render-routing: no-server` which means:
- The Render service is NOT running, OR
- The deployment failed, OR
- Render hasn't deployed the new code yet

---

## 🔍 Steps to Diagnose on Render Dashboard

### Step 1: Check Service Status

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Find your service: **cinescan-backend-1**
3. Look at the status badge at the top:
   - ✅ **"Live"** (green) = Service is running
   - ⚠️ **"Deploy in progress"** (yellow) = Still deploying
   - ❌ **"Failed"** (red) = Deployment failed
   - ⏸️ **"Suspended"** (gray) = Service stopped

**What's the current status?**

---

### Step 2: Check Deployment Logs

This is the MOST IMPORTANT step to find out what went wrong.

1. In your service dashboard, click **"Logs"** tab (left sidebar)
2. Look for the most recent deployment
3. Check for these indicators:

**✅ SUCCESSFUL Deployment Looks Like:**
```
==> Cloning from https://github.com/Dagem04/reveal-backend...
==> Downloading cache...
==> Installing dependencies
Successfully installed ...
==> Build succeeded
==> Starting service with 'uvicorn server:app --host 0.0.0.0 --port 8001'
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

**❌ FAILED Deployment Looks Like:**
```
ERROR: Could not find a version that satisfies...
ERROR: No module named 'server'
ERROR: Failed to build
Build failed
```

**Common Error Messages to Look For:**

#### Error 1: "No module named 'server'"
```
ModuleNotFoundError: No module named 'server'
```
**Cause:** The `server.py` file wasn't uploaded or is in the wrong location.

**Solution:**
- Verify `server.py` exists in your GitHub repo root
- Go to: https://github.com/Dagem04/reveal-backend
- Make sure `server.py` is visible in the file list
- If it's in a subfolder, you need to move it to the root

#### Error 2: "Could not find a version that satisfies requirement"
```
ERROR: Could not find a version that satisfies the requirement ...
```
**Cause:** A package in `requirements.txt` is not available or version is wrong.

**Solution:**
- Check the Render logs to see which package failed
- May need to update `requirements.txt`

#### Error 3: "Port already in use" or "Address already in use"
```
OSError: [Errno 98] Address already in use
```
**Cause:** Port configuration issue.

**Solution:**
- Verify Dockerfile CMD: `uvicorn server:app --host 0.0.0.0 --port 8001`
- Or check Render service settings for correct port

#### Error 4: "Application startup failed"
```
ERROR:    Application startup failed. Exiting.
```
**Cause:** Usually environment variables missing (like MONGO_URL).

**Solution:**
- Add all required environment variables (see below)

---

### Step 3: Verify Repository Connection

1. In Render Dashboard, go to your service
2. Click **"Settings"** (left sidebar)
3. Under **"Build & Deploy"** section, verify:
   - **Repository**: Should show `Dagem04/reveal-backend` ✅
   - **Branch**: Should be `main` ✅
   - **Auto-Deploy**: Enabled or Disabled (your choice)

**If repository is NOT connected:**
1. Click **"Connect Repository"**
2. Select `Dagem04/reveal-backend`
3. Choose branch: `main`
4. Save changes

---

### Step 4: Verify Files Were Uploaded to GitHub

1. Go to: **https://github.com/Dagem04/reveal-backend**
2. You should see these files in the root:

**Required Files:**
- ✅ `server.py` (click to verify it has 1200+ lines)
- ✅ `Dockerfile`
- ✅ `requirements.txt`
- ✅ `.gitignore`
- ✅ `.dockerignore`
- ✅ `load_real_outfits.py`
- ✅ `load_beauty_looks.py`

**If files are missing or in a subfolder:**
- You need to re-upload them to the repository root
- Use GitHub web interface: "Add file" → "Upload files"

---

### Step 5: Check Environment Variables

**CRITICAL:** These MUST be set on Render for the backend to work.

1. Render Dashboard → Your Service
2. Go to **"Environment"** section (left sidebar)
3. Verify these variables exist:

| Variable | Required? | Notes |
|----------|-----------|-------|
| `MONGO_URL` | ✅ YES | Must be MongoDB Atlas connection string (NOT localhost) |
| `TMDB_API_KEY` | ✅ YES | Movie database API |
| `AUDD_API_KEY` | ✅ YES | Music recognition API |
| `OPENAI_API_KEY` | ✅ YES | AI features |
| `GOOGLE_VISION_API_KEY` | ✅ YES | Image recognition |

**If any are missing:**
1. Click **"Add Environment Variable"**
2. Add each one
3. Click **"Save Changes"**
4. Render will automatically restart

**Values to use:**
```
MONGO_URL=mongodb+srv://YOUR_ATLAS_CONNECTION_STRING
TMDB_API_KEY=04253a70fe55d02b56ecc5f48e52b255
AUDD_API_KEY=e8a4e451c1f0bb0e7b86f7a4c6f2bd62
OPENAI_API_KEY=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
GOOGLE_VISION_API_KEY=AIzaSyCmJcZA12j9wOIc2gDf0T-StZ2OQ3BHObA
```

⚠️ **Note:** You need to set up MongoDB Atlas first to get the `MONGO_URL` connection string.

---

### Step 6: Check Build Configuration

1. Render Dashboard → Your Service → **"Settings"**
2. Scroll to **"Build & Deploy"** section
3. Verify these settings:

**Build Command:**
- Should be empty or: `pip install -r requirements.txt`
- Render uses Dockerfile automatically

**Start Command:**
- Should be empty (Dockerfile CMD will be used)
- Or: `uvicorn server:app --host 0.0.0.0 --port 8001`

**Root Directory:**
- Should be empty (repository root) ✅
- NOT: `backend/` or any subfolder

**Docker:**
- Should be: **Enabled** (if using Dockerfile) ✅

---

## 🚀 Common Solutions

### Solution 1: Force Redeploy

If everything looks correct but service isn't starting:

1. Render Dashboard → Your Service
2. Click **"Manual Deploy"** (top right)
3. Select **"Clear build cache & deploy"**
4. Wait 5-10 minutes
5. Check logs for success or error messages

---

### Solution 2: Files in Wrong Location

If GitHub shows files in a `backend/` subfolder instead of root:

**The files MUST be in the repository root, not in a subfolder.**

1. Go to GitHub: https://github.com/Dagem04/reveal-backend
2. If you see a `backend/` folder, the files are nested wrong
3. You need to move files to root:
   - Option A: Re-upload files directly to root (not in any folder)
   - Option B: Use GitHub web interface to move files

**Correct structure:**
```
reveal-backend/           ← Repository root
├── server.py            ← Direct in root ✅
├── Dockerfile           ← Direct in root ✅
├── requirements.txt     ← Direct in root ✅
└── ...
```

**Wrong structure:**
```
reveal-backend/
└── backend/             ← Extra folder ❌
    ├── server.py        ← Nested ❌
    ├── Dockerfile
    └── ...
```

---

### Solution 3: MongoDB Not Set Up

If logs show MongoDB connection errors:

**You MUST set up MongoDB Atlas (or another MongoDB host).**

The local `mongodb://localhost:27017/` will NOT work on Render.

**Quick MongoDB Atlas Setup (5 minutes):**

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a free cluster (M0 Sandbox)
4. Create database user
5. Set network access to: 0.0.0.0/0 (allow all)
6. Get connection string
7. Add to Render environment variables as `MONGO_URL`

**I can guide you through MongoDB Atlas setup if needed.**

---

## 📊 What to Check in Order

Use this checklist:

1. ☐ Check Render service status (Live/Failed/Deploying)
2. ☐ Read deployment logs for error messages
3. ☐ Verify files are on GitHub in repository root
4. ☐ Verify Render is connected to correct repository
5. ☐ Check all environment variables are set
6. ☐ Verify MongoDB Atlas is set up (if using)
7. ☐ Try force redeploy with cache clear
8. ☐ Wait 5-10 minutes for deployment
9. ☐ Check logs again

---

## 🆘 Next Steps - Tell Me What You See

**Please check these on your Render Dashboard and reply with:**

1. **Service Status:** (Live / Failed / Deploying / Suspended)
2. **Last Error in Logs:** (copy the error message)
3. **Files on GitHub:** (Are they in root or in a subfolder?)
4. **Repository Connected:** (Yes/No - is `Dagem04/reveal-backend` connected?)
5. **Environment Variables:** (How many are set? Are all 5 there?)

**Once you provide this info, I can give you exact steps to fix the issue!**

---

## 🎯 Most Likely Issues

Based on diagnosis, the most likely causes are:

1. **Files uploaded to wrong location** (in `backend/` subfolder instead of root)
2. **Deployment is still in progress** (wait 5-10 minutes)
3. **Environment variables not set** (especially `MONGO_URL`)
4. **Repository not connected** to Render yet

**Check these first!** 🔍
