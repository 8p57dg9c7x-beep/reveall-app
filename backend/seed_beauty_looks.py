#!/usr/bin/env python3
"""
Seed trending beauty looks to MongoDB
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['app_database']
beauty_collection = db['beauty_looks']

# Trending beauty looks data
BEAUTY_LOOKS = [
    {
        "title": "Soft Glam Look",
        "celebrity": "Selena Gomez",
        "category": "glam",
        "image_url": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
        "description": "A timeless soft glam makeup look with neutral tones and highlighted features.",
        "products": [
            {"name": "Dewy Foundation", "price": "$42"},
            {"name": "Neutral Eyeshadow Palette", "price": "$54"},
            {"name": "Rose Gold Highlighter", "price": "$28"},
            {"name": "Nude Lipstick", "price": "$22"}
        ]
    },
    {
        "title": "Bold Red Lip Classic",
        "celebrity": "Taylor Swift",
        "category": "bold",
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
        "description": "Classic winged eyeliner with a statement red lip.",
        "products": [
            {"name": "Black Liquid Liner", "price": "$18"},
            {"name": "Matte Red Lipstick", "price": "$24"},
            {"name": "Setting Spray", "price": "$32"}
        ]
    },
    {
        "title": "Natural Glow",
        "celebrity": "Emma Watson",
        "category": "natural",
        "image_url": "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800&q=80",
        "description": "Fresh, dewy skin with barely-there makeup.",
        "products": [
            {"name": "Tinted Moisturizer", "price": "$38"},
            {"name": "Cream Blush", "price": "$26"},
            {"name": "Clear Brow Gel", "price": "$18"},
            {"name": "Lip Balm", "price": "$8"}
        ]
    },
    {
        "title": "Smokey Eye Drama",
        "celebrity": "Zendaya",
        "category": "smokey",
        "image_url": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
        "description": "Sultry smokey eye with perfect blending and sharp liner.",
        "products": [
            {"name": "Black Eyeshadow Palette", "price": "$48"},
            {"name": "Volumizing Mascara", "price": "$24"},
            {"name": "Gel Liner", "price": "$20"},
            {"name": "Setting Powder", "price": "$36"}
        ]
    },
    {
        "title": "Bridal Elegance",
        "celebrity": "Priyanka Chopra",
        "category": "bridal",
        "image_url": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
        "description": "Timeless bridal makeup with glowing skin and romantic tones.",
        "products": [
            {"name": "HD Foundation", "price": "$52"},
            {"name": "Champagne Highlighter", "price": "$34"},
            {"name": "Rose Eyeshadow", "price": "$42"},
            {"name": "Pink Nude Lipstick", "price": "$28"}
        ]
    },
    {
        "title": "Festival Glitter",
        "celebrity": "Billie Eilish",
        "category": "festival",
        "image_url": "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=800&q=80",
        "description": "Bold, colorful festival makeup with glitter and graphic elements.",
        "products": [
            {"name": "Glitter Gel", "price": "$16"},
            {"name": "Rainbow Eyeshadow Palette", "price": "$38"},
            {"name": "Neon Eyeliner Set", "price": "$22"},
            {"name": "Body Glitter", "price": "$14"}
        ]
    },
    {
        "title": "Everyday Fresh Face",
        "celebrity": "Jennifer Aniston",
        "category": "everyday",
        "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
        "description": "Simple, quick makeup for daily wear with natural tones.",
        "products": [
            {"name": "BB Cream", "price": "$28"},
            {"name": "Neutral Eyeshadow Trio", "price": "$22"},
            {"name": "Brown Mascara", "price": "$18"},
            {"name": "Nude Lip Gloss", "price": "$16"}
        ]
    },
    {
        "title": "Golden Goddess Glam",
        "celebrity": "Beyoncé",
        "category": "glam",
        "image_url": "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
        "description": "Luxurious gold tones with bronzed skin and glossy lips.",
        "products": [
            {"name": "Gold Highlighter", "price": "$42"},
            {"name": "Bronzer Duo", "price": "$38"},
            {"name": "Gold Eyeshadow", "price": "$32"},
            {"name": "Glossy Lip Oil", "price": "$24"}
        ]
    },
    {
        "title": "Cool Toned Minimal",
        "celebrity": "Blake Lively",
        "category": "natural",
        "image_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        "description": "Minimal makeup with cool-toned products for a fresh look.",
        "products": [
            {"name": "Cool Foundation", "price": "$44"},
            {"name": "Mauve Blush", "price": "$28"},
            {"name": "Silver Highlighter", "price": "$32"},
            {"name": "Pink Lip Tint", "price": "$18"}
        ]
    },
    {
        "title": "Vintage Hollywood Glam",
        "celebrity": "Margot Robbie",
        "category": "glam",
        "image_url": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80",
        "description": "Classic old Hollywood glamour with winged liner and red lips.",
        "products": [
            {"name": "Full Coverage Foundation", "price": "$48"},
            {"name": "Black Liquid Liner", "price": "$22"},
            {"name": "False Lashes", "price": "$12"},
            {"name": "Cherry Red Lipstick", "price": "$26"}
        ]
    },
    {
        "title": "Peachy Keen Summer",
        "celebrity": "Ariana Grande",
        "category": "everyday",
        "image_url": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
        "description": "Warm peachy tones perfect for summer days.",
        "products": [
            {"name": "Peach Blush", "price": "$24"},
            {"name": "Coral Lipstick", "price": "$22"},
            {"name": "Orange Eyeshadow", "price": "$28"},
            {"name": "Bronze Highlighter", "price": "$30"}
        ]
    },
    {
        "title": "Ice Queen Cool Tones",
        "celebrity": "Rihanna",
        "category": "bold",
        "image_url": "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=800&q=80",
        "description": "Bold blue and silver tones for a striking look.",
        "products": [
            {"name": "Blue Eyeshadow Palette", "price": "$42"},
            {"name": "Silver Highlighter", "price": "$36"},
            {"name": "Metallic Lipstick", "price": "$28"},
            {"name": "White Eyeliner", "price": "$16"}
        ]
    }
]

def seed_beauty_looks():
    """Seed beauty looks to MongoDB"""
    print(f"🎨 Connecting to MongoDB: {MONGO_URL}")
    
    # Clear existing beauty looks (optional - comment out if you want to keep existing data)
    # beauty_collection.delete_many({})
    # print("🗑️  Cleared existing beauty looks")
    
    # Insert new beauty looks
    result = beauty_collection.insert_many(BEAUTY_LOOKS)
    print(f"✅ Successfully seeded {len(result.inserted_ids)} beauty looks!")
    
    # Verify
    count = beauty_collection.count_documents({})
    print(f"📊 Total beauty looks in database: {count}")
    
    # Show sample
    sample = beauty_collection.find_one()
    if sample:
        print(f"\n🎨 Sample beauty look:")
        print(f"  Title: {sample['title']}")
        print(f"  Celebrity: {sample['celebrity']}")
        print(f"  Category: {sample['category']}")
        print(f"  Products: {len(sample['products'])}")

if __name__ == "__main__":
    seed_beauty_looks()
    client.close()
