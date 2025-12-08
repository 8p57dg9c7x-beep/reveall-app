# 🔧 Render Environment Variable Update

## Add MongoDB Connection String to Render

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Click on your service: **cinescan-backend**

### Step 2: Add/Update MONGO_URL
1. Click **"Environment"** in the left sidebar
2. Look for existing `MONGO_URL` variable
   - If exists: Click "Edit" and update the value
   - If missing: Click "Add Environment Variable"

### Step 3: Set the Value

**Key:** `MONGO_URL`

**Value:** (Copy this EXACT string)
```
mongodb+srv://cinescan:reveal2025@cluster0.9wucxrm.mongodb.net/app_database?retryWrites=true&w=majority
```

### Step 4: Save
1. Click **"Save Changes"**
2. Render will automatically restart the service
3. Wait 2-3 minutes for restart to complete

### Step 5: Verify
1. Check service status shows: 🟢 **Live**
2. Click **"Logs"** tab
3. Look for: `MongoDB connected: mongodb+srv://cinescan@...`

---

**Once you see "Live" status, reply "Render updated!" and I'll run the full test suite.**
