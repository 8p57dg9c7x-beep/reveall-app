# 🚀 RENDER DEPLOYMENT GUIDE - REVEAL App

## 📋 Problem Identified

**Current Situation:**
- Render backend at `https://cinescan-backend-1.onrender.com` is running OLD CINESCAN code
- Missing ALL REVEAL features: Style, Beauty, Movies, Lyrics endpoints
- Only basic CINESCAN movie recognition endpoints exist

**Root Cause:**
- The repository connected to Render contains outdated code
- Render is deploying the old version without the REVEAL features

---

## ✅ Solution: Redeploy Latest Code to Render

### Option 1: Deploy from GitHub (Recommended)

#### Step 1: Check Current Render Configuration

1. Go to Render Dashboard: https://dashboard.render.com
2. Find your service: `cinescan-backend-1`
3. Check **Settings** → **Build & Deploy**:
   - What repository is connected?
   - What branch is being deployed?
   - Is auto-deploy enabled?

#### Step 2: Update Repository with Latest Code

**You need to push the complete REVEAL backend code to your GitHub repository.**

The complete backend code includes:
- ✅ `server.py` (1100+ lines with all routes)
- ✅ `load_real_outfits.py` (outfit data loader)
- ✅ `load_beauty_looks.py` (beauty data loader)
- ✅ `requirements.txt` (all dependencies)
- ✅ `Dockerfile` (container configuration)
- ✅ `.dockerignore` (exclude unnecessary files)

**Critical files checklist:**
```
backend/
├── server.py          ← MUST have ALL routes (outfits, beauty, movies, lyrics)
├── Dockerfile         ← Already exists ✅
├── requirements.txt   ← Already exists ✅
├── .env              ← API keys (don't commit this to GitHub!)
├── load_real_outfits.py
└── load_beauty_looks.py
```

#### Step 3: Verify server.py Contains All Routes

Run this command to verify your local `server.py` has all required routes:

```bash
grep -E "@api_router\.(get|post)" /app/backend/server.py | grep -E "(outfit|beauty|movie|lyric)"
```

**Expected output should include:**
- `/outfits/trending`
- `/outfits/celebrity`
- `/outfits/{category}`
- `/beauty/{category}`
- `/beauty/trending`
- `/movies/trending`
- `/movies/coming-soon`
- `/lyrics/{query}`

#### Step 4: Push to GitHub

```bash
# Initialize git if not already done
cd /app/backend
git init

# Add all files (EXCEPT .env - keep API keys secret!)
git add server.py Dockerfile requirements.txt .dockerignore
git add load_real_outfits.py load_beauty_looks.py

# Commit
git commit -m "Deploy complete REVEAL backend with all features"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main branch (or whatever branch Render is watching)
git push -u origin main
```

#### Step 5: Trigger Render Deployment

**Option A: Auto-Deploy (if enabled)**
- Render will automatically detect the push and start deploying
- Go to your Render dashboard and watch the deployment logs

**Option B: Manual Deploy**
1. Go to Render Dashboard
2. Select your service: `cinescan-backend-1`
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete (5-10 minutes)

#### Step 6: Configure Environment Variables on Render

**CRITICAL: Add API keys to Render environment variables**

1. Go to your service settings on Render
2. Navigate to **Environment** section
3. Add these environment variables:

```
MONGO_URL=mongodb+srv://YOUR_MONGO_CONNECTION_STRING
TMDB_API_KEY=04253a70fe55d02b56ecc5f48e52b255
AUDD_API_KEY=e8a4e451c1f0bb0e7b86f7a4c6f2bd62
OPENAI_API_KEY=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
GOOGLE_VISION_API_KEY=AIzaSyCmJcZA12j9wOIc2gDf0T-StZ2OQ3BHObA
```

**⚠️ IMPORTANT: MongoDB Connection**

The local `MONGO_URL=mongodb://localhost:27017/` won't work on Render!

You need to:
1. **Option A:** Add a MongoDB database on Render (free tier available)
2. **Option B:** Use MongoDB Atlas (free tier: https://www.mongodb.com/cloud/atlas)
3. Get the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database`)
4. Add it to Render environment variables

#### Step 7: Wait for Deployment

- Watch the deployment logs on Render dashboard
- Look for: `✅ Build succeeded` and `✅ Service running`
- This takes about 5-10 minutes

#### Step 8: Verify Deployment

Run the diagnosis script again:

```bash
python /app/diagnose_render.py
```

**Expected result:**
- ✅ All outfit endpoints working
- ✅ All beauty endpoints working
- ✅ All movie endpoints working
- ✅ Lyrics endpoint working

If endpoints return **empty data** (0 outfits, 0 looks):
- This means MongoDB is empty
- Proceed to **Step 9: Load Data**

#### Step 9: Load Data into Render MongoDB

Once the backend is deployed and MongoDB is connected, you need to populate the database:

**Option A: Load from local machine**

1. Update the MongoDB URL in the data loading scripts to point to Render's MongoDB
2. Run:

```bash
cd /app/backend

# Update MONGO_URL in the scripts or set environment variable
export MONGO_URL="mongodb+srv://YOUR_RENDER_MONGO_URL"

# Load outfit data
python load_real_outfits.py

# Load beauty data
python load_beauty_looks.py
```

**Option B: Load from Render (SSH)**

If Render allows SSH access:
1. SSH into your Render service
2. Run the data loading scripts from within the container

**Option C: Use MongoDB Compass or mongosh**

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to your Render MongoDB using the connection string
3. Import data manually or run scripts locally

---

### Option 2: Deploy without GitHub (Direct from Render)

If you don't want to use GitHub, Render also supports:

1. **Deploy from Docker Hub**: Build and push your Docker image to Docker Hub, then deploy from there
2. **Deploy from GitLab/Bitbucket**: Similar to GitHub workflow

---

## 🧪 Testing After Deployment

### Test All Endpoints

```bash
# Test outfit endpoints
curl https://cinescan-backend-1.onrender.com/api/outfits/trending
curl https://cinescan-backend-1.onrender.com/api/outfits/celebrity
curl https://cinescan-backend-1.onrender.com/api/outfits/streetwear

# Test beauty endpoints
curl https://cinescan-backend-1.onrender.com/api/beauty/glam
curl https://cinescan-backend-1.onrender.com/api/beauty/natural

# Test movie endpoints
curl https://cinescan-backend-1.onrender.com/api/movies/trending
curl https://cinescan-backend-1.onrender.com/api/movies/coming-soon

# Test lyrics endpoint
curl https://cinescan-backend-1.onrender.com/api/lyrics/shape%20of%20you
```

---

## 🎯 Quick Checklist

- [ ] Verify local `server.py` has all REVEAL routes
- [ ] Push complete backend code to GitHub
- [ ] Configure Render to deploy from correct repository/branch
- [ ] Add all environment variables on Render (especially MONGO_URL)
- [ ] Set up MongoDB database (Render or Atlas)
- [ ] Deploy and wait for completion
- [ ] Run diagnosis script to verify all endpoints exist
- [ ] Load data into MongoDB if endpoints return empty
- [ ] Test frontend app to ensure all features work

---

## 🆘 Troubleshooting

### Issue: Endpoints still return 404 after deployment

**Cause:** Render might be caching the old code or deployment failed

**Solution:**
1. Check Render deployment logs for errors
2. Try **Clear Build Cache** in Render settings
3. Force a new deployment: Make a small change to code and push again
4. Verify the Dockerfile CMD is correct: `uvicorn server:app --host 0.0.0.0 --port 8001`

### Issue: Endpoints work but return empty data

**Cause:** MongoDB is empty

**Solution:** Load data using the scripts (see Step 9 above)

### Issue: MongoDB connection error

**Cause:** Wrong MONGO_URL or database not accessible

**Solution:**
1. Verify MongoDB connection string format
2. Check MongoDB Atlas network access settings (allow Render's IP or 0.0.0.0/0)
3. Test connection string locally first

### Issue: Deployment takes too long or times out

**Cause:** Large dependencies or slow builds

**Solution:**
1. Check if requirements.txt has unnecessary packages
2. Use Render's build cache
3. Consider upgrading Render plan for faster builds

---

## 📞 Need Help?

If you encounter issues during deployment:

1. **Check Render Logs**: Most detailed error information is in deployment logs
2. **Verify Environment Variables**: Missing API keys will cause failures
3. **Test MongoDB Connection**: Ensure database is accessible from Render
4. **Run Diagnosis Script**: Helps identify exactly what's missing

---

**Expected Timeline:**
- Pushing code to GitHub: 5 minutes
- Render deployment: 5-10 minutes
- Loading data to MongoDB: 2-3 minutes
- **Total: ~15-20 minutes** to full deployment
