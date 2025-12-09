# 🛍️ Affiliate Products Integration Guide

## Overview
The REVEAL app now supports affiliate product monetization for both Outfits and Beauty Looks. This guide explains how to add, manage, and integrate affiliate products.

---

## Database Schema

### Products Array Structure
Each outfit/beauty look document can contain a `products` array:

```javascript
{
  _id: ObjectId,
  title: "...",
  category: "...",
  // ... other fields ...
  products: [
    {
      name: "Product Name",
      price: "$XX.XX",
      image_url: "https://...",
      affiliate_url: "https://affiliate-link" // Optional
    }
  ]
}
```

### Field Descriptions:
- **name**: Product name (e.g., "Classic White T-Shirt")
- **price**: Formatted price string (e.g., "$29.99", "$50-$100")
- **image_url**: Direct URL to product image
- **affiliate_url**: Your affiliate link (optional - falls back to Google search)

---

## Adding Products to Database

### Method 1: Using MongoDB Compass / Studio
```javascript
// Navigate to your collection (outfits or beauty_looks)
// Edit a document and add the products array:

products: [
  {
    name: "Oversized Denim Jacket",
    price: "$89.99",
    image_url: "https://images.example.com/jacket.jpg",
    affiliate_url: "https://amazon.com/associate-link-xyz"
  },
  {
    name: "White Canvas Sneakers",
    price: "$65.00",
    image_url: "https://images.example.com/sneakers.jpg",
    affiliate_url: "" // Will use Google search fallback
  }
]
```

### Method 2: Using Python Script
```python
from pymongo import MongoClient

client = MongoClient('your-mongo-url')
db = client.get_database()

# Add products to a specific outfit
db.outfits.update_one(
    {'_id': ObjectId('...')},
    {'$set': {
        'products': [
            {
                'name': 'Product Name',
                'price': '$XX.XX',
                'image_url': 'https://...',
                'affiliate_url': 'https://...'
            }
        ]
    }}
)
```

### Method 3: Bulk Update via API (Coming Soon)
We can add an admin API endpoint for bulk product uploads.

---

## Affiliate Link Behavior

### With Affiliate URL:
When a product has an `affiliate_url`, tapping "Shop Now" opens that link directly.

### Without Affiliate URL (Fallback):
When `affiliate_url` is empty or missing, the app automatically creates a Google search:
```
https://www.google.com/search?q=Product+Name
```

This is useful for:
- Products you haven't obtained affiliate links for yet
- General product discovery
- Backup option

---

## Supported Affiliate Programs

### Ready for Integration:
1. **Amazon Associates**
   - Use standard Amazon affiliate links
   - Format: `https://amazon.com/dp/PRODUCT_ID?tag=YOUR_TAG`

2. **LTK (LikeToKnow.it)**
   - Use your LTK shortened links
   - Format: `https://www.shopltk.com/explore/YOUR_ID`

3. **Skimlinks**
   - Use Skimlinks redirect URLs
   - Format: `https://go.skimresources.com/...`

4. **RewardStyle**
   - Use RewardStyle tracking links

5. **Direct Brand Affiliate Programs**
   - Nike, Adidas, Sephora, etc.

### Adding Your Affiliate Tag:
Simply paste your affiliate link in the `affiliate_url` field. The app will handle opening it correctly.

---

## Frontend Implementation

### ProductCard Component
Location: `/app/frontend/components/ProductCard.js`

Features:
- ✅ Smooth press animations
- ✅ Product image display
- ✅ Price formatting
- ✅ "Shop Now" button
- ✅ Automatic link handling
- ✅ Google search fallback

### Integration Points:
1. **Outfit Detail Page** (`outfitdetail.js`)
   - Shows products under "🛍️ Shop The Look"
   - Horizontal scrollable cards

2. **Beauty Detail Page** (`beautydetail.js`)
   - Shows products under "💄 Shop The Look"
   - Horizontal scrollable cards

---

## Best Practices

### Product Images:
- Use high-quality, square images (400x400px minimum)
- Ensure images are on a clean background
- Use consistent image sizes across products

### Product Names:
- Keep concise but descriptive (max 50 characters)
- Include brand name if relevant
- Example: "Nike Air Max 90 - White/Black"

### Pricing:
- Use consistent currency symbols
- For ranges: "$50-$100"
- For discounts: "~~$99.99~~ $79.99" (optional)

### Number of Products:
- **Outfits**: 2-5 products per look (optimal)
- **Beauty**: 3-7 products per look (optimal)
- Don't overwhelm users with too many options

---

## Monetization Strategy

### Phase 1 (Current):
- Manual product addition via database
- Support for all major affiliate programs
- Google search fallback

### Phase 2 (Future):
- Admin dashboard for product management
- Bulk product upload via CSV
- Analytics tracking for affiliate clicks

### Phase 3 (Future):
- Automated product recommendations
- Dynamic pricing updates
- Commission tracking integration

---

## Testing Your Products

### Test Checklist:
1. ✅ Product image loads correctly
2. ✅ Product name displays fully
3. ✅ Price is formatted properly
4. ✅ "Shop Now" button works
5. ✅ Affiliate link opens correctly
6. ✅ Fallback to Google works (for empty affiliate_url)

### Sample Test Product:
```javascript
{
  name: "Test Product Name",
  price: "$99.99",
  image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  affiliate_url: ""  // Leave empty to test Google fallback
}
```

---

## Revenue Tracking

### Recommended Tools:
1. **Google Analytics**
   - Track outbound clicks
   - Monitor user journey

2. **Affiliate Dashboard**
   - Use your affiliate program's native analytics
   - Track conversions and commissions

3. **UTM Parameters** (Optional)
   - Add tracking to your affiliate URLs
   - Example: `?utm_source=reveal_app&utm_medium=affiliate`

---

## Support & Updates

### Current Version: 1.0
- ✅ Basic affiliate product display
- ✅ Click tracking ready
- ✅ Google search fallback
- ✅ Multi-program support

### Coming Soon:
- Admin panel for product management
- Product performance analytics
- Automated product suggestions

---

## Quick Start Commands

### Add Sample Products to Test:
```bash
cd /app/backend
python add_products_field.py
```

### View Products in Database:
```javascript
// In MongoDB Compass
db.outfits.findOne({}, { products: 1 })
db.beauty_looks.findOne({}, { products: 1 })
```

---

**Ready to monetize! 💰🔥**
