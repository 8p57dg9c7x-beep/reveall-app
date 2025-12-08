#!/usr/bin/env python3
"""
Fix broken image URLs in outfits and beauty looks
Replaces invalid URLs with valid Unsplash placeholders
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv
import requests

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

# Valid Unsplash placeholder categories
OUTFIT_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",  # Fashion
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",  # Style
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",  # Streetwear
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",  # Minimal
    "https://images.unsplash.com/photo-1558769132-cb1aea4c5e90?w=800&q=80",  # Modern
]

BEAUTY_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",  # Beauty
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",  # Makeup
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",  # Glam
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",  # Natural
]

def check_image_url(url):
    """Check if an image URL is valid"""
    if not url:
        return False
    
    # Check if URL has proper format
    if not url.startswith('http'):
        return False
    
    # Check if Unsplash URL has required parameters
    if 'unsplash.com' in url and '?w=' not in url:
        return False
    
    return True

def fix_images():
    """Fix all broken image URLs in the database"""
    print("="*80)
    print("🔧 Fixing Broken Image URLs")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    
    # Fix Outfits
    print("\n📦 Checking Outfits Collection...")
    outfits_collection = db['outfits']
    outfits = list(outfits_collection.find({}))
    
    outfit_fixes = 0
    placeholder_index = 0
    
    for outfit in outfits:
        if not check_image_url(outfit.get('image')):
            # Assign placeholder
            new_image = OUTFIT_PLACEHOLDERS[placeholder_index % len(OUTFIT_PLACEHOLDERS)]
            placeholder_index += 1
            
            outfits_collection.update_one(
                {'_id': outfit['_id']},
                {'$set': {'image': new_image}}
            )
            outfit_fixes += 1
            print(f"   Fixed: {outfit.get('title', 'Unknown')} → {new_image[:50]}...")
    
    print(f"\n✅ Fixed {outfit_fixes} outfit images")
    
    # Fix Beauty Looks
    print("\n💄 Checking Beauty Looks Collection...")
    beauty_collection = db['beauty_looks']
    looks = list(beauty_collection.find({}))
    
    beauty_fixes = 0
    placeholder_index = 0
    
    for look in looks:
        if not check_image_url(look.get('image')):
            # Assign placeholder
            new_image = BEAUTY_PLACEHOLDERS[placeholder_index % len(BEAUTY_PLACEHOLDERS)]
            placeholder_index += 1
            
            beauty_collection.update_one(
                {'_id': look['_id']},
                {'$set': {'image': new_image}}
            )
            beauty_fixes += 1
            print(f"   Fixed: {look.get('title', 'Unknown')} → {new_image[:50]}...")
    
    print(f"\n✅ Fixed {beauty_fixes} beauty look images")
    
    # Summary
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"Total Outfits: {len(outfits)}")
    print(f"Fixed Outfits: {outfit_fixes}")
    print(f"Total Beauty Looks: {len(looks)}")
    print(f"Fixed Beauty Looks: {beauty_fixes}")
    print(f"\n✅ Total Images Fixed: {outfit_fixes + beauty_fixes}")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    fix_images()
