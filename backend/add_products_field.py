#!/usr/bin/env python3
"""
Add products array field to outfits and beauty_looks collections
Prepares the schema for affiliate monetization
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

def add_products_field():
    """Add products field to all documents"""
    print("="*80)
    print("🛍️  Adding Products Field for Affiliate Monetization")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    
    # Update Outfits Collection
    print("\n📦 Updating Outfits Collection...")
    outfits_collection = db['outfits']
    
    # Add empty products array to documents that don't have it
    result = outfits_collection.update_many(
        {'products': {'$exists': False}},
        {'$set': {'products': []}}
    )
    print(f"   ✅ Updated {result.modified_count} outfit documents")
    
    # Add sample products to first outfit for testing
    sample_outfit = outfits_collection.find_one({})
    if sample_outfit and len(sample_outfit.get('products', [])) == 0:
        sample_products = [
            {
                'name': 'Classic White T-Shirt',
                'price': '$29.99',
                'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
                'affiliate_url': ''  # Will fall back to Google search
            },
            {
                'name': 'Denim Jeans',
                'price': '$79.99',
                'image_url': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
                'affiliate_url': 'https://www.example.com/affiliate-link'  # Sample affiliate link
            }
        ]
        outfits_collection.update_one(
            {'_id': sample_outfit['_id']},
            {'$set': {'products': sample_products}}
        )
        print(f"   📝 Added sample products to outfit: {sample_outfit.get('title', 'Unknown')}")
    
    # Update Beauty Looks Collection
    print("\n💄 Updating Beauty Looks Collection...")
    beauty_collection = db['beauty_looks']
    
    # Add empty products array to documents that don't have it
    result = beauty_collection.update_many(
        {'products': {'$exists': False}},
        {'$set': {'products': []}}
    )
    print(f"   ✅ Updated {result.modified_count} beauty look documents")
    
    # Add sample products to first beauty look for testing
    sample_beauty = beauty_collection.find_one({})
    if sample_beauty and len(sample_beauty.get('products', [])) == 0:
        sample_products = [
            {
                'name': 'Matte Lipstick - Ruby Red',
                'price': '$24.99',
                'image_url': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80',
                'affiliate_url': ''
            },
            {
                'name': 'Eye Shadow Palette',
                'price': '$49.99',
                'image_url': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
                'affiliate_url': 'https://www.example.com/beauty-affiliate'
            },
            {
                'name': 'Foundation - Natural Glow',
                'price': '$39.99',
                'image_url': 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&q=80',
                'affiliate_url': ''
            }
        ]
        beauty_collection.update_one(
            {'_id': sample_beauty['_id']},
            {'$set': {'products': sample_products}}
        )
        print(f"   📝 Added sample products to beauty look: {sample_beauty.get('title', 'Unknown')}")
    
    # Summary
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"Total Outfits: {outfits_collection.count_documents({})}")
    print(f"Total Beauty Looks: {beauty_collection.count_documents({})}")
    print(f"\n✅ Database schema updated successfully!")
    print("📝 Products field structure:")
    print("   {")
    print("     name: string,")
    print("     price: string,")
    print("     image_url: string,")
    print("     affiliate_url: string (optional)")
    print("   }")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    add_products_field()
