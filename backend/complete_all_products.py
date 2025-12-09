#!/usr/bin/env python3
"""
Add products to ALL remaining outfits and beauty looks
Makes the app feel complete with no empty product sections
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv
import random

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

# Generic outfit products (can be used for any category)
OUTFIT_PRODUCTS_POOL = [
    {
        'name': 'Classic White Sneakers',
        'price': '$85',
        'image_url': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Slim Fit Black Jeans',
        'price': '$68',
        'image_url': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Cotton Crew Neck T-Shirt',
        'price': '$25',
        'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Denim Jacket',
        'price': '$89',
        'image_url': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Leather Ankle Boots',
        'price': '$145',
        'image_url': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Canvas Tote Bag',
        'price': '$32',
        'image_url': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Wool Blend Cardigan',
        'price': '$78',
        'image_url': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'High-Waist Wide Leg Pants',
        'price': '$72',
        'image_url': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Minimalist Watch',
        'price': '$129',
        'image_url': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Leather Crossbody Bag',
        'price': '$95',
        'image_url': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Oversized Blazer',
        'price': '$135',
        'image_url': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Striped Button-Up Shirt',
        'price': '$54',
        'image_url': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
        'affiliate_url': ''
    }
]

# Generic beauty products (can be used for any look)
BEAUTY_PRODUCTS_POOL = [
    {
        'name': 'Hydrating Face Primer',
        'price': '$32',
        'image_url': 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Full Coverage Foundation',
        'price': '$42',
        'image_url': 'https://images.unsplash.com/photo-1631214500869-2ce9d1b5d6f5?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Creamy Concealer',
        'price': '$28',
        'image_url': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Contour & Highlight Duo',
        'price': '$36',
        'image_url': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Soft Matte Blush',
        'price': '$24',
        'image_url': 'https://images.unsplash.com/photo-1583241800698-a8ca99ddb3ea?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Shimmer Highlighter',
        'price': '$29',
        'image_url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Eyeshadow Palette - Neutrals',
        'price': '$48',
        'image_url': 'https://images.unsplash.com/photo-1625186344195-a94515c7ff66?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Waterproof Liquid Eyeliner',
        'price': '$18',
        'image_url': 'https://images.unsplash.com/photo-1631214500869-2ce9d1b5d6f5?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Volumizing Mascara',
        'price': '$26',
        'image_url': 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Nude Lip Liner',
        'price': '$16',
        'image_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Satin Finish Lipstick',
        'price': '$22',
        'image_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Glossy Lip Oil',
        'price': '$19',
        'image_url': 'https://images.unsplash.com/photo-1631214500869-2ce9d1b5d6f5?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Setting Spray - Long Wear',
        'price': '$33',
        'image_url': 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Brow Gel - Tinted',
        'price': '$21',
        'image_url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
        'affiliate_url': ''
    },
    {
        'name': 'Makeup Brush Set',
        'price': '$45',
        'image_url': 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
        'affiliate_url': ''
    }
]

def complete_all_products():
    """Add products to ALL items that don't have them"""
    print("="*80)
    print("🛍️  Adding Products to ALL Remaining Items")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    
    # ====== OUTFITS ======
    print("\n📦 Processing Outfits...")
    outfits_collection = db['outfits']
    
    outfits_without_products = list(outfits_collection.find({
        '$or': [
            {'products': {'$exists': False}},
            {'products': {'$size': 0}}
        ]
    }))
    
    print(f"Found {len(outfits_without_products)} outfits without products\n")
    
    outfit_count = 0
    for outfit in outfits_without_products:
        # Pick 3-4 random products
        num_products = random.randint(3, 4)
        selected_products = random.sample(OUTFIT_PRODUCTS_POOL, num_products)
        
        outfits_collection.update_one(
            {'_id': outfit['_id']},
            {'$set': {'products': selected_products}}
        )
        
        outfit_count += 1
        print(f"✅ {outfit.get('title', 'Unknown')} - {num_products} products")
    
    # ====== BEAUTY LOOKS ======
    print(f"\n💄 Processing Beauty Looks...")
    beauty_collection = db['beauty_looks']
    
    beauty_without_products = list(beauty_collection.find({
        '$or': [
            {'products': {'$exists': False}},
            {'products': {'$size': 0}}
        ]
    }))
    
    print(f"Found {len(beauty_without_products)} beauty looks without products\n")
    
    beauty_count = 0
    for look in beauty_without_products:
        # Pick 4-5 random products (beauty usually has more)
        num_products = random.randint(4, 5)
        selected_products = random.sample(BEAUTY_PRODUCTS_POOL, num_products)
        
        beauty_collection.update_one(
            {'_id': look['_id']},
            {'$set': {'products': selected_products}}
        )
        
        beauty_count += 1
        print(f"✅ {look.get('title', 'Unknown')} - {num_products} products")
    
    # Final Summary
    print("\n" + "="*80)
    print("📊 FINAL SUMMARY")
    print("="*80)
    print(f"🎯 Outfits updated: {outfit_count}")
    print(f"💄 Beauty looks updated: {beauty_count}")
    print(f"\n📦 Total outfits with products: {outfits_collection.count_documents({'products': {'$exists': True, '$ne': []}})}/{outfits_collection.count_documents({})}")
    print(f"💄 Total beauty looks with products: {beauty_collection.count_documents({'products': {'$exists': True, '$ne': []}})}/{beauty_collection.count_documents({})}")
    print("\n✅ ALL items now have products! Ready for monetization! 💰🔥")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    complete_all_products()
