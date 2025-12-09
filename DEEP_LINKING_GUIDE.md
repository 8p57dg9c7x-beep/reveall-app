# 🔗 Deep Linking & Sharing Guide

## Overview
REVEAL now supports deep linking and social sharing, enabling viral growth and better user acquisition. Users can share specific outfits and beauty looks with friends, who can open them directly in the app!

---

## What We Built

### 1. Backend API Endpoints ✅
**Endpoint:** `GET /api/outfits/id/{outfit_id}`
- Fetches a specific outfit by MongoDB ObjectId
- Used when opening deep links
- Returns outfit with all product data

**Endpoint:** `GET /api/beauty/id/{beauty_id}`
- Fetches a specific beauty look by MongoDB ObjectId
- Used when opening deep links
- Returns beauty look with all product data

### 2. Share Buttons ✅
- Floating share button on outfit detail pages
- Floating share button on beauty detail pages
- Premium design with smooth animations
- Positioned at top-right of hero image

### 3. Deep Link Generation ✅
**Format:**
- Outfits: `cinescan://outfitdetail?id={outfit_id}`
- Beauty: `cinescan://beautydetail?id={beauty_id}`

**Share Message:**
```
Check out this [Outfit Name] outfit on REVEAL! 🔥

cinescan://outfitdetail?id=67567abc123...
```

### 4. Deep Link Handling ✅
- Automatic detection of incoming deep links
- Fetches item data from backend by ID
- Navigates to correct detail page
- Shows loading state while fetching
- Error handling if item not found

---

## How It Works

### User Flow:

**Sharing:**
1. User opens outfit/beauty detail page
2. Taps share button (top-right)
3. Native share sheet appears
4. User shares via WhatsApp, SMS, Instagram, etc.
5. Recipient receives message with deep link

**Opening Deep Link:**
1. Recipient taps the link
2. App opens automatically (if installed)
3. App fetches outfit/beauty by ID from backend
4. Detail page displays with all data
5. User can shop products and explore

---

## Deep Link Configuration

### App Scheme
**Scheme:** `cinescan`

Configured in `/app/frontend/app.json`:
```json
{
  "expo": {
    "scheme": "cinescan"
  }
}
```

### URL Patterns
- `/outfitdetail` - with query param `id`
- `/beautydetail` - with query param `id`

---

## Testing Deep Links

### Method 1: Share Button (Production-like)
1. Open any outfit or beauty detail
2. Tap the share button
3. Share to yourself via SMS or another app
4. Tap the link to test

### Method 2: Manual Deep Link (Development)
**On Device:**
```bash
# iOS (using Terminal)
xcrun simctl openurl booted "cinescan://outfitdetail?id=YOUR_OUTFIT_ID"

# Android (using adb)
adb shell am start -W -a android.intent.action.VIEW -d "cinescan://outfitdetail?id=YOUR_OUTFIT_ID"
```

**On Expo Go:**
```bash
npx uri-scheme open "cinescan://outfitdetail?id=YOUR_OUTFIT_ID" --ios
npx uri-scheme open "cinescan://outfitdetail?id=YOUR_OUTFIT_ID" --android
```

### Method 3: Web Browser
If on iOS/Android, open Safari/Chrome and enter:
```
cinescan://outfitdetail?id=YOUR_OUTFIT_ID
```

---

## Getting Item IDs for Testing

### Get Outfit ID:
1. Go to MongoDB Compass
2. Open `outfits` collection
3. Copy any `_id` value
4. Use in deep link: `cinescan://outfitdetail?id=COPIED_ID`

### Get Beauty ID:
1. Go to MongoDB Compass
2. Open `beauty_looks` collection
3. Copy any `_id` value
4. Use in deep link: `cinescan://beautydetail?id=COPIED_ID`

### Quick Test Command:
```bash
# Get a random outfit ID
mongo app_database --eval "db.outfits.findOne({}, {_id: 1})"
```

---

## Share Button Design

### Location:
- Top-right corner of hero image
- Floating above the image
- Always visible and accessible

### Style:
- Purple background (`rgba(163, 76, 255, 0.9)`)
- White share icon
- 50x50px circle
- Shadow for depth
- Smooth press animation

### Icon:
MaterialCommunityIcons - `share-variant`

---

## Implementation Details

### Outfit Detail (`/app/frontend/app/outfitdetail.js`)

**Props accepted:**
- `outfitData` - JSON string (normal navigation)
- `id` - MongoDB ObjectId (deep link navigation)

**Logic:**
1. Check if `id` param exists
2. If yes, fetch outfit from `/api/outfits/id/{id}`
3. Display loading state
4. Set outfit data and render
5. Track analytics

### Beauty Detail (`/app/frontend/app/beautydetail.js`)

**Props accepted:**
- `lookData` - JSON string (normal navigation)
- `id` - MongoDB ObjectId (deep link navigation)

**Logic:**
1. Check if `id` param exists
2. If yes, fetch beauty look from `/api/beauty/id/{id}`
3. Display loading state
4. Set look data and render
5. Track analytics

---

## Analytics Integration

### Tracked Events:
- ✅ Share button taps (tracked as normal page views)
- ✅ Deep link opens (tracked as outfit_view/beauty_view)
- ✅ Product clicks from shared links

### Measuring Viral Growth:
Monitor analytics dashboard for:
- Increased outfit/beauty views
- Traffic spikes after sharing features launch
- Product click rates from new users

---

## Social Sharing Platforms

### Supported Platforms:
- ✅ WhatsApp
- ✅ Instagram (Stories & DMs)
- ✅ iMessage / SMS
- ✅ Facebook Messenger
- ✅ Twitter / X
- ✅ Email
- ✅ Copy Link (universal)

### Platform-Specific Features:
**Instagram Stories:**
- Deep link works in story swipe-up
- Great for influencer partnerships

**WhatsApp:**
- Link preview shows app name
- Click opens app directly

**SMS:**
- Works across iOS and Android
- Universal sharing method

---

## Growth Strategy

### Phase 1: Organic Sharing (Current)
- Users share favorite outfits with friends
- Word-of-mouth growth
- Natural viral loop

### Phase 2: Incentivized Sharing (Future)
- "Share to unlock" premium features
- Referral rewards
- Exclusive content for sharers

### Phase 3: Influencer Partnerships (Future)
- Give influencers unique deep links
- Track conversions per influencer
- Commission-based partnerships

---

## Affiliate Benefits

### Why Deep Linking Boosts Revenue:
1. **More Traffic** = More product clicks
2. **Targeted Sharing** = Higher conversion rates
3. **Viral Growth** = Exponential reach
4. **Social Proof** = Friends trust friends

### Example:
User shares "Nike Air Max 90" outfit → 10 friends see it → 5 click products → 2 purchase = 2x affiliate commissions!

---

## Troubleshooting

### Deep Link Not Opening?
- Check if app is installed
- Verify scheme in app.json: `"scheme": "cinescan"`
- Test with different apps (SMS, WhatsApp, etc.)

### "Item Not Found" Error?
- Verify MongoDB ID is correct
- Check if item exists in database
- Ensure backend endpoint is running

### Share Button Not Visible?
- Check if MaterialCommunityIcons is imported
- Verify button is positioned correctly
- Check z-index/elevation

### Deep Link Opens Wrong Page?
- Verify URL format: `cinescan://outfitdetail?id=...`
- Check routing configuration
- Ensure ID parameter is being passed

---

## Future Enhancements

### Coming Soon:
- 📊 Deep link analytics (track share sources)
- 🎁 "Share to unlock" features
- 💰 Referral rewards system
- 🔗 Short URLs for cleaner sharing
- 📸 Share with preview image
- 🎯 UTM parameter tracking

---

## Quick Reference

### Backend Endpoints:
- `GET /api/outfits/id/{id}` - Get outfit by ID
- `GET /api/beauty/id/{id}` - Get beauty look by ID

### Frontend Files:
- `/app/frontend/app/outfitdetail.js` - Outfit detail with sharing
- `/app/frontend/app/beautydetail.js` - Beauty detail with sharing

### Deep Link Format:
```
cinescan://outfitdetail?id={MONGODB_OBJECT_ID}
cinescan://beautydetail?id={MONGODB_OBJECT_ID}
```

### Test Deep Link:
1. Get an outfit/beauty ID from MongoDB
2. Create link: `cinescan://outfitdetail?id=YOUR_ID`
3. Share to yourself via SMS
4. Tap link to test!

---

**Deep linking is LIVE! Share your favorite looks and watch your app grow! 🚀🔗**

Every share is a potential new user and more affiliate revenue! 💰
