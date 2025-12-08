#!/usr/bin/env python3
"""
Load expanded outfit collection with new Bohemian category
Adds 20+ new outfits across all categories
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

# Expanded outfit collection
EXPANDED_OUTFITS = [
    # Additional Streetwear (3 more)
    {
        "title": "Vintage Hip-Hop Streetwear",
        "category": "streetwear",
        "image": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
        "description": "Classic 90s hip-hop inspired look with oversized silhouettes and bold graphics",
        "priceRange": "$150-$250",
        "gender": "Unisex",
        "items": [
            {"name": "Oversized Graphic Hoodie", "brand": "Stüssy", "price": "$85"},
            {"name": "Baggy Denim Jeans", "brand": "Levi's", "price": "$90"},
            {"name": "High-Top Sneakers", "brand": "Nike Dunk High", "price": "$140"}
        ],
        "budgetAlternatives": [
            {"name": "Graphic Hoodie", "brand": "H&M", "price": "$35"},
            {"name": "Relaxed Jeans", "brand": "Uniqlo", "price": "$45"}
        ]
    },
    {
        "title": "Tech Streetwear Black",
        "category": "streetwear",
        "image": "https://images.unsplash.com/photo-1558769132-cb1aea4c5e90?w=800&q=80",
        "description": "Futuristic all-black techwear with functional details and modular design",
        "priceRange": "$400-$650",
        "gender": "Unisex",
        "items": [
            {"name": "Technical Jacket", "brand": "Acronym", "price": "$450"},
            {"name": "Cargo Pants", "brand": "Guerrilla Group", "price": "$200"},
            {"name": "Trail Sneakers", "brand": "Salomon XT-6", "price": "$180"}
        ],
        "budgetAlternatives": [
            {"name": "Windbreaker Jacket", "brand": "Uniqlo", "price": "$50"},
            {"name": "Cargo Pants", "brand": "Dickies", "price": "$45"}
        ]
    },
    {
        "title": "Skater Style Essentials",
        "category": "streetwear",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        "description": "Classic skater aesthetic with durable pieces and laid-back vibes",
        "priceRange": "$180-$280",
        "gender": "Unisex",
        "items": [
            {"name": "Skate T-Shirt", "brand": "Thrasher", "price": "$35"},
            {"name": "Dickies Work Pants", "brand": "Dickies", "price": "$45"},
            {"name": "Skate Shoes", "brand": "Vans Old Skool", "price": "$70"}
        ],
        "budgetAlternatives": [
            {"name": "Plain Tee", "brand": "Gildan", "price": "$12"},
            {"name": "Canvas Sneakers", "brand": "Airwalk", "price": "$30"}
        ]
    },
    
    # Additional Luxury (3 more)
    {
        "title": "Modern Luxury Neutrals",
        "category": "luxury",
        "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
        "description": "Sophisticated neutral palette with premium fabrics and timeless silhouettes",
        "priceRange": "$1,200-$2,000",
        "gender": "Women",
        "items": [
            {"name": "Cashmere Sweater", "brand": "Loro Piana", "price": "$890"},
            {"name": "Wide-Leg Trousers", "brand": "The Row", "price": "$650"},
            {"name": "Leather Loafers", "brand": "Hermès", "price": "$890"}
        ],
        "budgetAlternatives": [
            {"name": "Wool Blend Sweater", "brand": "COS", "price": "$120"},
            {"name": "Wide Pants", "brand": "Mango", "price": "$80"}
        ]
    },
    {
        "title": "Executive Power Suit",
        "category": "luxury",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        "description": "Sharp tailored suit for the modern executive with impeccable fit",
        "priceRange": "$2,500-$4,000",
        "gender": "Men",
        "items": [
            {"name": "Wool Suit", "brand": "Tom Ford", "price": "$3,200"},
            {"name": "Dress Shirt", "brand": "Brunello Cucinelli", "price": "$650"},
            {"name": "Oxford Shoes", "brand": "Church's", "price": "$750"}
        ],
        "budgetAlternatives": [
            {"name": "Suit", "brand": "J.Crew", "price": "$450"},
            {"name": "Dress Shirt", "brand": "Charles Tyrwhitt", "price": "$89"}
        ]
    },
    {
        "title": "Luxury Evening Gown",
        "category": "luxury",
        "image": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
        "description": "Stunning floor-length gown perfect for gala events and red carpets",
        "priceRange": "$3,000-$6,000",
        "gender": "Women",
        "items": [
            {"name": "Silk Evening Gown", "brand": "Oscar de la Renta", "price": "$4,500"},
            {"name": "Statement Earrings", "brand": "Cartier", "price": "$1,200"},
            {"name": "Evening Clutch", "brand": "Judith Leiber", "price": "$2,500"}
        ],
        "budgetAlternatives": [
            {"name": "Evening Dress", "brand": "ASOS Design", "price": "$120"},
            {"name": "Statement Earrings", "brand": "BaubleBar", "price": "$42"}
        ]
    },
    
    # Additional Minimal (3 more)
    {
        "title": "Scandinavian Minimal",
        "category": "minimal",
        "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        "description": "Clean Scandinavian design with focus on quality basics and natural tones",
        "priceRange": "$250-$400",
        "gender": "Unisex",
        "items": [
            {"name": "Organic Cotton Tee", "brand": "Arket", "price": "$45"},
            {"name": "Tapered Pants", "brand": "COS", "price": "$135"},
            {"name": "Minimalist Sneakers", "brand": "Common Projects", "price": "$420"}
        ],
        "budgetAlternatives": [
            {"name": "Basic Tee", "brand": "Everlane", "price": "$18"},
            {"name": "Chino Pants", "brand": "Uniqlo", "price": "$40"}
        ]
    },
    {
        "title": "Japanese Minimal Aesthetic",
        "category": "minimal",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        "description": "Influenced by Japanese minimalism with flowing fabrics and muted colors",
        "priceRange": "$300-$500",
        "gender": "Unisex",
        "items": [
            {"name": "Oversized Linen Shirt", "brand": "Muji", "price": "$65"},
            {"name": "Drop-Crotch Pants", "brand": "Yohji Yamamoto", "price": "$380"},
            {"name": "Canvas Slip-Ons", "brand": "Maison Margiela", "price": "$395"}
        ],
        "budgetAlternatives": [
            {"name": "Linen Shirt", "brand": "Uniqlo", "price": "$30"},
            {"name": "Relaxed Pants", "brand": "Muji", "price": "$45"}
        ]
    },
    {
        "title": "Monochrome Minimal",
        "category": "minimal",
        "image": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&q=80",
        "description": "All-black minimal outfit with architectural silhouettes",
        "priceRange": "$280-$450",
        "gender": "Women",
        "items": [
            {"name": "Black Turtleneck", "brand": "COS", "price": "$79"},
            {"name": "Straight-Leg Pants", "brand": "Everlane", "price": "$98"},
            {"name": "Leather Ankle Boots", "brand": "Vagabond", "price": "$189"}
        ],
        "budgetAlternatives": [
            {"name": "Turtleneck", "brand": "H&M", "price": "$25"},
            {"name": "Black Pants", "brand": "Zara", "price": "$40"}
        ]
    },
    
    # Additional Sport/Athleisure (3 more)
    {
        "title": "Yoga Studio Chic",
        "category": "sport",
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
        "description": "Comfortable and stylish yoga wear for studio or street",
        "priceRange": "$150-$250",
        "gender": "Women",
        "items": [
            {"name": "High-Waist Leggings", "brand": "Lululemon", "price": "$98"},
            {"name": "Sports Bra", "brand": "Alo Yoga", "price": "$58"},
            {"name": "Oversized Hoodie", "brand": "Outdoor Voices", "price": "$85"}
        ],
        "budgetAlternatives": [
            {"name": "Leggings", "brand": "Old Navy", "price": "$25"},
            {"name": "Sports Bra", "brand": "Target", "price": "$20"}
        ]
    },
    {
        "title": "Running Performance",
        "category": "sport",
        "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        "description": "High-performance running gear with moisture-wicking technology",
        "priceRange": "$200-$320",
        "gender": "Unisex",
        "items": [
            {"name": "Running Jacket", "brand": "Nike", "price": "$120"},
            {"name": "Running Shorts", "brand": "Adidas", "price": "$45"},
            {"name": "Running Shoes", "brand": "On Cloud", "price": "$160"}
        ],
        "budgetAlternatives": [
            {"name": "Sport Jacket", "brand": "Decathlon", "price": "$35"},
            {"name": "Running Shoes", "brand": "New Balance", "price": "$75"}
        ]
    },
    {
        "title": "Gym Essentials Pack",
        "category": "sport",
        "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        "description": "Complete gym outfit with performance fabrics and supportive fit",
        "priceRange": "$140-$220",
        "gender": "Men",
        "items": [
            {"name": "Training T-Shirt", "brand": "Under Armour", "price": "$35"},
            {"name": "Training Shorts", "brand": "Gymshark", "price": "$40"},
            {"name": "Training Shoes", "brand": "Nike Metcon", "price": "$140"}
        ],
        "budgetAlternatives": [
            {"name": "Sport Tee", "brand": "Champion", "price": "$18"},
            {"name": "Gym Shorts", "brand": "Amazon Essentials", "price": "$15"}
        ]
    },
    
    # Additional Elegant/Formal (3 more)
    {
        "title": "Business Cocktail Attire",
        "category": "elegant",
        "image": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
        "description": "Perfect for corporate events and sophisticated cocktail parties",
        "priceRange": "$450-$750",
        "gender": "Women",
        "items": [
            {"name": "Midi Dress", "brand": "Reiss", "price": "$350"},
            {"name": "Heeled Sandals", "brand": "Stuart Weitzman", "price": "$425"},
            {"name": "Structured Bag", "brand": "Strathberry", "price": "$595"}
        ],
        "budgetAlternatives": [
            {"name": "Midi Dress", "brand": "& Other Stories", "price": "$99"},
            {"name": "Heels", "brand": "Steve Madden", "price": "$90"}
        ]
    },
    {
        "title": "Black Tie Optional",
        "category": "elegant",
        "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
        "description": "Refined evening wear that transitions seamlessly from dinner to gala",
        "priceRange": "$800-$1,400",
        "gender": "Men",
        "items": [
            {"name": "Dinner Jacket", "brand": "Hugo Boss", "price": "$695"},
            {"name": "Dress Trousers", "brand": "Canali", "price": "$395"},
            {"name": "Patent Leather Shoes", "brand": "Allen Edmonds", "price": "$395"}
        ],
        "budgetAlternatives": [
            {"name": "Blazer", "brand": "Banana Republic", "price": "$200"},
            {"name": "Dress Pants", "brand": "Bonobos", "price": "$98"}
        ]
    },
    {
        "title": "Garden Party Elegance",
        "category": "elegant",
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        "description": "Light and breezy formal wear perfect for outdoor daytime events",
        "priceRange": "$380-$620",
        "gender": "Women",
        "items": [
            {"name": "Floral Maxi Dress", "brand": "Zimmermann", "price": "$695"},
            {"name": "Woven Clutch", "brand": "Cult Gaia", "price": "$198"},
            {"name": "Block Heel Sandals", "brand": "Sam Edelman", "price": "$140"}
        ],
        "budgetAlternatives": [
            {"name": "Floral Dress", "brand": "Zara", "price": "$80"},
            {"name": "Straw Bag", "brand": "H&M", "price": "$30"}
        ]
    },
    
    # NEW CATEGORY: Bohemian (5 items)
    {
        "title": "Desert Boho Vibes",
        "category": "bohemian",
        "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
        "description": "Free-spirited bohemian look with flowing fabrics and earthy tones",
        "priceRange": "$220-$380",
        "gender": "Women",
        "items": [
            {"name": "Embroidered Tunic", "brand": "Free People", "price": "$128"},
            {"name": "Wide-Leg Pants", "brand": "Spell & The Gypsy", "price": "$189"},
            {"name": "Leather Sandals", "brand": "Birkenstock", "price": "$135"}
        ],
        "budgetAlternatives": [
            {"name": "Flowy Top", "brand": "Old Navy", "price": "$35"},
            {"name": "Wide Pants", "brand": "Shein", "price": "$25"}
        ]
    },
    {
        "title": "Festival Boho Chic",
        "category": "bohemian",
        "image": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80",
        "description": "Perfect for music festivals with layered textures and vintage details",
        "priceRange": "$180-$320",
        "gender": "Women",
        "items": [
            {"name": "Crochet Top", "brand": "Urban Outfitters", "price": "$68"},
            {"name": "Denim Shorts", "brand": "Levi's", "price": "$68"},
            {"name": "Fringe Bag", "brand": "Anthropologie", "price": "$98"}
        ],
        "budgetAlternatives": [
            {"name": "Lace Top", "brand": "Forever 21", "price": "$22"},
            {"name": "Jean Shorts", "brand": "Target", "price": "$25"}
        ]
    },
    {
        "title": "Vintage Bohemian",
        "category": "bohemian",
        "image": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80",
        "description": "Vintage-inspired boho with romantic florals and flowing silhouettes",
        "priceRange": "$240-$400",
        "gender": "Women",
        "items": [
            {"name": "Maxi Dress", "brand": "Christy Dawn", "price": "$268"},
            {"name": "Leather Belt", "brand": "Madewell", "price": "$58"},
            {"name": "Ankle Boots", "brand": "Frye", "price": "$368"}
        ],
        "budgetAlternatives": [
            {"name": "Maxi Dress", "brand": "ASOS", "price": "$55"},
            {"name": "Belt", "brand": "Target", "price": "$15"}
        ]
    },
    {
        "title": "Modern Boho Luxe",
        "category": "bohemian",
        "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
        "description": "Elevated bohemian style with premium materials and refined details",
        "priceRange": "$450-$750",
        "gender": "Women",
        "items": [
            {"name": "Silk Kimono", "brand": "Johnny Was", "price": "$348"},
            {"name": "Linen Pants", "brand": "Eileen Fisher", "price": "$198"},
            {"name": "Suede Mules", "brand": "Vince", "price": "$295"}
        ],
        "budgetAlternatives": [
            {"name": "Kimono", "brand": "Zara", "price": "$60"},
            {"name": "Linen Pants", "brand": "Uniqlo", "price": "$40"}
        ]
    },
    {
        "title": "Coastal Bohemian",
        "category": "bohemian",
        "image": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&q=80",
        "description": "Breezy coastal boho with natural fabrics and relaxed fits",
        "priceRange": "$190-$340",
        "gender": "Women",
        "items": [
            {"name": "Linen Shirt", "brand": "Reformation", "price": "$128"},
            {"name": "Cotton Skirt", "brand": "Madewell", "price": "$98"},
            {"name": "Espadrilles", "brand": "Soludos", "price": "$85"}
        ],
        "budgetAlternatives": [
            {"name": "Linen Shirt", "brand": "Mango", "price": "$40"},
            {"name": "Skirt", "brand": "H&M", "price": "$30"}
        ]
    }
]

def load_expanded_outfits():
    """Load expanded outfit collection"""
    print("="*80)
    print("📦 Loading Expanded Outfit Collection")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    collection = db['outfits']
    
    print(f"\n✅ Connected to MongoDB")
    print(f"   Database: {db.name}")
    
    # Insert new outfits
    print(f"\n📥 Inserting {len(EXPANDED_OUTFITS)} new outfits...")
    result = collection.insert_many(EXPANDED_OUTFITS)
    print(f"✅ Inserted {len(result.inserted_ids)} outfits")
    
    # Count by category
    print("\n📊 Current outfit count by category:")
    categories = collection.distinct('category')
    for category in sorted(categories):
        count = collection.count_documents({'category': category})
        print(f"   {category.capitalize()}: {count} outfits")
    
    total = collection.count_documents({})
    print(f"\n✅ Total outfits in database: {total}")
    print("\n" + "="*80)
    print("🎉 Expanded outfit collection loaded successfully!")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    load_expanded_outfits()
