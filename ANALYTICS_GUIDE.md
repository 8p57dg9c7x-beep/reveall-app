# 📊 Analytics & Click Tracking Guide

## Overview
The REVEAL app now includes a comprehensive analytics system that tracks user behavior and monetization metrics. This system provides valuable insights into what content performs best and which products drive the most engagement.

---

## What We Track

### 1. Product Clicks 🛍️
**Event Type:** `product_click`

Tracked whenever a user taps "Shop Now" on a product card.

**Data Captured:**
- Product name
- Product price
- Affiliate URL (if provided)
- Parent outfit/beauty look details
- Category
- Session ID
- Timestamp

**Use Case:** Know which products are getting the most clicks to optimize your affiliate partnerships.

### 2. Outfit Views 👔
**Event Type:** `outfit_view`

Tracked whenever a user opens an outfit detail page.

**Data Captured:**
- Outfit ID
- Outfit title
- Category
- Session ID
- Timestamp

**Use Case:** Identify your most popular outfits to create similar content.

### 3. Beauty Look Views 💄
**Event Type:** `beauty_view`

Tracked whenever a user opens a beauty detail page.

**Data Captured:**
- Beauty look ID
- Beauty look title
- Category
- Session ID
- Timestamp

**Use Case:** Understand which beauty looks resonate with your audience.

### 4. Category Views 📁
**Event Type:** `category_view`

Tracked whenever a user switches categories on Style or Beauty screens.

**Data Captured:**
- Category name
- Type (outfit or beauty)
- Session ID
- Timestamp

**Use Case:** See which categories are most popular to prioritize content creation.

---

## Database Structure

### Analytics Collection
**Collection Name:** `analytics`

**Document Schema:**
```javascript
{
  _id: ObjectId,
  event_type: String,  // product_click, outfit_view, beauty_view, category_view
  
  // Item details (for views)
  item_id: String,
  item_title: String,
  category: String,
  
  // Product details (for clicks)
  product_name: String,
  product_price: String,
  product_affiliate_url: String,
  
  // Session tracking
  session_id: String,
  referral_source: String,
  
  // Timestamps
  timestamp: Number,  // Unix timestamp
  datetime: String    // ISO 8601 format
}
```

---

## API Endpoints

### 1. Track Event
**Endpoint:** `POST /api/analytics/track`

**Request Body:**
```javascript
{
  "event_type": "product_click",
  "product_name": "Nike Air Max 90",
  "product_price": "$130",
  "product_affiliate_url": "https://...",
  "item_id": "123",
  "item_title": "Streetwear Outfit",
  "category": "streetwear",
  "session_id": "session_xxx",
  "referral_source": "app"
}
```

**Response:**
```javascript
{
  "success": true,
  "event_id": "64abc123...",
  "message": "Event tracked successfully"
}
```

### 2. Get Dashboard Data
**Endpoint:** `GET /api/analytics/dashboard`

**Response:**
```javascript
{
  "success": true,
  "period": "Last 30 Days",
  "summary": {
    "total_events": 1250,
    "product_clicks": 450,
    "outfit_views": 500,
    "beauty_views": 300
  },
  "top_products": [
    {
      "_id": "Nike Air Max 90",
      "clicks": 45,
      "price": "$130"
    }
  ],
  "top_outfits": [
    {
      "_id": "123",
      "title": "Streetwear Outfit",
      "views": 120
    }
  ],
  "top_beauty_looks": [
    {
      "_id": "456",
      "title": "Glamour Look",
      "views": 95
    }
  ],
  "category_stats": [
    {
      "_id": "streetwear",
      "views": 250
    }
  ]
}
```

---

## Frontend Integration

### Analytics Service
**Location:** `/app/frontend/services/analytics.js`

**Available Functions:**

1. **trackProductClick(product, itemContext)**
   ```javascript
   import { trackProductClick } from '../services/analytics';
   
   trackProductClick(product, {
     item_id: outfit.id,
     item_title: outfit.title,
     category: outfit.category
   });
   ```

2. **trackOutfitView(outfit)**
   ```javascript
   import { trackOutfitView } from '../services/analytics';
   
   trackOutfitView(outfit);
   ```

3. **trackBeautyView(beautyLook)**
   ```javascript
   import { trackBeautyView } from '../services/analytics';
   
   trackBeautyView(beautyLook);
   ```

4. **trackCategoryView(category, type)**
   ```javascript
   import { trackCategoryView } from '../services/analytics';
   
   trackCategoryView('streetwear', 'outfit');
   ```

5. **getAnalyticsDashboard()**
   ```javascript
   import { getAnalyticsDashboard } from '../services/analytics';
   
   const data = await getAnalyticsDashboard();
   ```

---

## Analytics Dashboard

### Accessing the Dashboard
Navigate to `/analytics` in the app to view the analytics dashboard.

**Dashboard Features:**
- ✅ Total events summary
- ✅ Product clicks count
- ✅ Outfit & Beauty views count
- ✅ Top 10 clicked products
- ✅ Top 10 viewed outfits
- ✅ Top 10 viewed beauty looks
- ✅ Category popularity ranking
- ✅ Pull to refresh
- ✅ 30-day time range

**Dashboard URL:** `https://your-app.com/analytics`

---

## Key Metrics to Monitor

### 1. Click-Through Rate (CTR)
**Formula:** (Product Clicks / Outfit Views) × 100

**Example:**
- 450 product clicks
- 500 outfit views
- CTR = (450/500) × 100 = 90%

**Goal:** Aim for 30%+ CTR

### 2. Product Performance
Monitor which products get the most clicks to:
- Focus on high-performing affiliate partners
- Remove underperforming products
- Negotiate better commission rates for top products

### 3. Content Performance
Track outfit/beauty view counts to:
- Identify trending styles
- Create similar high-performing content
- Remove low-performing items

### 4. Category Insights
Understand category popularity to:
- Prioritize content creation
- Focus marketing efforts
- Optimize navigation

---

## Monetization Strategy

### Phase 1: Data Collection (Current)
- ✅ Track all user interactions
- ✅ Build baseline metrics
- ✅ Identify patterns

### Phase 2: Optimization (Week 2-4)
- Promote top-performing products
- Create more content in popular categories
- A/B test product placements

### Phase 3: Scaling (Month 2+)
- Partner with brands for top products
- Negotiate commission increases
- Add sponsored content in popular categories

---

## Privacy & Compliance

### Data Collection
- ✅ Anonymous session tracking (no personal info)
- ✅ No email or name collection
- ✅ No device fingerprinting
- ✅ No third-party cookies

### User Control
The analytics system is:
- Non-intrusive
- Performance-optimized (fails silently if API is down)
- Privacy-focused

---

## Viewing Raw Analytics Data

### Using MongoDB Compass/Atlas

**View all events:**
```javascript
db.analytics.find().sort({ timestamp: -1 }).limit(100)
```

**Product clicks only:**
```javascript
db.analytics.find({ event_type: "product_click" }).sort({ timestamp: -1 })
```

**Outfit views for specific category:**
```javascript
db.analytics.find({ 
  event_type: "outfit_view",
  category: "streetwear"
}).sort({ timestamp: -1 })
```

**Top products (manual aggregation):**
```javascript
db.analytics.aggregate([
  { $match: { event_type: "product_click" } },
  { $group: { 
      _id: "$product_name", 
      clicks: { $sum: 1 },
      price: { $first: "$product_price" }
  }},
  { $sort: { clicks: -1 } },
  { $limit: 10 }
])
```

---

## Export Analytics Data

### For Excel/Google Sheets
1. Open MongoDB Compass
2. Navigate to `analytics` collection
3. Click "Export Collection"
4. Choose JSON or CSV format
5. Import into Excel/Sheets for custom reports

### For Affiliate Reporting
Use the dashboard API to pull data programmatically:

```javascript
const response = await fetch('YOUR_API_URL/api/analytics/dashboard');
const data = await response.json();

// Export top products for affiliate reporting
const productReport = data.top_products.map(p => ({
  product: p._id,
  clicks: p.clicks,
  price: p.price
}));
```

---

## Testing the Analytics System

### Quick Test Steps:

1. **Test Product Click:**
   - Open any outfit or beauty detail page
   - Tap "Shop Now" on a product
   - Check backend logs for: `Analytics tracked: product_click`

2. **Test Outfit View:**
   - Open an outfit detail page
   - Check backend logs for: `Analytics tracked: outfit_view`

3. **Test Beauty View:**
   - Open a beauty detail page
   - Check backend logs for: `Analytics tracked: beauty_view`

4. **Test Category View:**
   - Go to Style or Beauty screen
   - Tap a different category
   - Check backend logs for: `Analytics tracked: category_view`

5. **View Dashboard:**
   - Navigate to `/analytics` in the app
   - Verify all your test events appear

---

## Troubleshooting

### Events not showing in dashboard?
- Check if backend is running: `sudo supervisorctl status backend`
- Check backend logs: `tail -f /var/log/supervisor/backend.out.log`
- Verify MongoDB connection

### Analytics calls failing silently?
- This is by design! Analytics should never break the user experience
- Check console logs for debugging info
- Verify API_BASE_URL is correct

### Dashboard shows 0 for all metrics?
- Make sure you've interacted with the app (click products, view items)
- Check if analytics collection exists in MongoDB
- Verify time range (currently 30 days)

---

## Future Enhancements

### Coming Soon:
- 📅 Custom date range selection
- 📈 Revenue estimation based on commission rates
- 📊 Conversion funnel analysis
- 📧 Weekly analytics email reports
- 🎯 Real-time analytics updates
- 🌍 Geographic insights (country-level)
- 📱 Device type breakdown (iOS vs Android)

---

## Quick Reference

### Backend Files:
- `/app/backend/server.py` - Analytics endpoints

### Frontend Files:
- `/app/frontend/services/analytics.js` - Analytics service
- `/app/frontend/app/analytics.js` - Dashboard screen
- `/app/frontend/components/ProductCard.js` - Product click tracking
- `/app/frontend/app/outfitdetail.js` - Outfit view tracking
- `/app/frontend/app/beautydetail.js` - Beauty view tracking
- `/app/frontend/app/style.js` - Category tracking
- `/app/frontend/app/beauty.js` - Category tracking

### Test Dashboard:
Navigate to: `http://localhost:3000/analytics` (or your app URL + `/analytics`)

---

**Analytics system is live and tracking! 📊💰**

Access your dashboard at any time to see real-time monetization insights!
