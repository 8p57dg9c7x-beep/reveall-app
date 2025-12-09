#!/usr/bin/env python3
"""
Add example products to more outfits
Makes the Shop The Look section consistent across multiple outfits
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

# Product collections by style/category
OUTFIT_PRODUCTS = {
    'streetwear': [
        {
            'name': 'Nike Dunk Low Sneakers',
            'price': '$110',
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Champion Reverse Weave Hoodie',
            'price': '$60',
            'image_url': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Carhartt Cargo Pants',
            'price': '$89',
            'image_url': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Supreme Box Logo Tee',
            'price': '$44',
            'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
            'affiliate_url': ''
        }
    ],
    'luxury': [
        {
            'name': 'Gucci Leather Loafers',
            'price': '$730',
            'image_url': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Saint Laurent Silk Shirt',
            'price': '$890',
            'image_url': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Tom Ford Tailored Trousers',
            'price': '$1,200',
            'image_url': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Hermès Leather Belt',
            'price': '$650',
            'image_url': 'https://images.unsplash.com/photo-1624222247344-550fb60583e2?w=400&q=80',
            'affiliate_url': ''
        }
    ],
    'minimal': [
        {
            'name': 'Everlane Organic Cotton Tee',
            'price': '$18',
            'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'COS Relaxed Fit Trousers',
            'price': '$99',
            'image_url': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Common Projects Achilles Low',
            'price': '$425',
            'image_url': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Uniqlo U Oversized Coat',
            'price': '$149',
            'image_url': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80',
            'affiliate_url': ''
        }
    ],
    'bohemian': [
        {
            'name': 'Free People Flowy Maxi Dress',
            'price': '$128',
            'image_url': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Birkenstock Arizona Sandals',
            'price': '$110',
            'image_url': 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Vintage Fringe Crossbody Bag',
            'price': '$75',
            'image_url': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Layered Pendant Necklace',
            'price': '$42',
            'image_url': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
            'affiliate_url': ''
        }
    ],
    'sport': [
        {
            'name': 'Nike Pro Dri-FIT Training Top',
            'price': '$35',
            'image_url': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Adidas Tiro Track Pants',
            'price': '$45',
            'image_url': 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Nike Air Zoom Pegasus 40',
            'price': '$130',
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Under Armour Gym Backpack',
            'price': '$55',
            'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
            'affiliate_url': ''
        }
    ],
    'elegant': [
        {
            'name': 'Ted Baker Tailored Blazer',
            'price': '$379',
            'image_url': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Ralph Lauren Slim Fit Dress Shirt',
            'price': '$98',
            'image_url': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Cole Haan Leather Oxford Shoes',
            'price': '$200',
            'image_url': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80',
            'affiliate_url': ''
        },
        {
            'name': 'Montblanc Leather Belt',
            'price': '$285',
            'image_url': 'https://images.unsplash.com/photo-1624222247344-550fb60583e2?w=400&q=80',
            'affiliate_url': ''
        }
    ]
}

def add_products_to_outfits():
    """Add products to outfits that don't have any"""
    print("="*80)
    print("🛍️  Adding Products to More Outfits")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    outfits_collection = db['outfits']
    
    # Find outfits without products (or with empty products array)
    outfits_without_products = list(outfits_collection.find({
        '$or': [
            {'products': {'$exists': False}},
            {'products': {'$size': 0}}
        ]
    }).limit(5))  # Limit to 5 outfits
    
    print(f"\n📦 Found {len(outfits_without_products)} outfits without products")
    print("Adding example products...\n")
    
    updated_count = 0
    
    for outfit in outfits_without_products:
        category = outfit.get('category', '').lower()
        title = outfit.get('title', 'Unknown')
        
        # Get products for this category
        products = OUTFIT_PRODUCTS.get(category, OUTFIT_PRODUCTS['minimal'])
        
        # Pick 3-4 random products for variety
        import random
        selected_products = random.sample(products, min(4, len(products)))
        
        # Update the outfit
        outfits_collection.update_one(
            {'_id': outfit['_id']},
            {'$set': {'products': selected_products}}
        )
        
        updated_count += 1
        print(f"✅ {title}")
        print(f"   Category: {category}")
        print(f"   Products added: {len(selected_products)}")
        for i, p in enumerate(selected_products, 1):
            print(f"     {i}. {p['name']} - {p['price']}")
        print()
    
    # Summary
    print("="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"✅ Updated {updated_count} outfits with products")
    print(f"📦 Total outfits with products: {outfits_collection.count_documents({'products': {'$exists': True, '$ne': []}})}")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    add_products_to_outfits()
