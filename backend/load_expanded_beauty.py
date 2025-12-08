#!/usr/bin/env python3
"""
Load expanded beauty looks collection with new Bridal category
Adds 15+ new beauty looks across all categories
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017/app_database')

# Expanded beauty looks collection
EXPANDED_BEAUTY_LOOKS = [
    # Additional Natural Looks (2 more)
    {
        "title": "Dewy Fresh Face",
        "category": "natural",
        "celebrity": "Jennifer Aniston",
        "image": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
        "description": "Radiant dewy skin with barely-there makeup for a fresh, youthful glow",
        "priceRange": "$80-$150",
        "products": [
            {"name": "Hydrating Primer", "type": "Primer", "price": "$38"},
            {"name": "Dewy Foundation", "type": "Foundation", "price": "$48"},
            {"name": "Cream Blush", "type": "Blush", "price": "$28"},
            {"name": "Tinted Lip Balm", "type": "Lip", "price": "$18"}
        ],
        "budgetDupes": [
            {"name": "e.l.f. Poreless Primer", "type": "Primer", "price": "$8"},
            {"name": "NYX Bare With Me Tinted Skin Veil", "type": "Foundation", "price": "$14"}
        ]
    },
    {
        "title": "Soft Freckled Look",
        "category": "natural",
        "celebrity": "Meghan Markle",
        "image": "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
        "description": "Embracing natural freckles with light coverage and sun-kissed warmth",
        "priceRange": "$70-$130",
        "gender": "Women",
        "products": [
            {"name": "Tinted Moisturizer", "type": "Foundation", "price": "$42"},
            {"name": "Freckle Pen", "type": "Special", "price": "$16"},
            {"name": "Bronze Glow", "type": "Bronzer", "price": "$32"},
            {"name": "Lip Tint", "type": "Lip", "price": "$22"}
        ],
        "budgetDupes": [
            {"name": "Neutrogena Tinted Moisturizer", "type": "Foundation", "price": "$13"},
            {"name": "Milani Baked Bronzer", "type": "Bronzer", "price": "$10"}
        ]
    },
    
    # Additional Glam Looks (3 more)
    {
        "title": "Old Hollywood Glamour",
        "category": "glam",
        "celebrity": "Zendaya",
        "image": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
        "description": "Classic Hollywood glam with red lips, winged liner, and sculpted features",
        "priceRange": "$180-$320",
        "gender": "Women",
        "products": [
            {"name": "Full Coverage Foundation", "type": "Foundation", "price": "$52"},
            {"name": "Contour Palette", "type": "Contour", "price": "$48"},
            {"name": "Liquid Eyeliner", "type": "Eyeliner", "price": "$24"},
            {"name": "Classic Red Lipstick", "type": "Lipstick", "price": "$38"}
        ],
        "budgetDupes": [
            {"name": "L'Oréal Infallible Foundation", "type": "Foundation", "price": "$15"},
            {"name": "NYX Epic Ink Liner", "type": "Eyeliner", "price": "$9"}
        ]
    },
    {
        "title": "Golden Hour Glow",
        "category": "glam",
        "celebrity": "Beyoncé",
        "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        "description": "Warm golden tones with bronzed skin and shimmery highlights",
        "priceRange": "$160-$280",
        "gender": "Women",
        "products": [
            {"name": "Bronzing Drops", "type": "Bronzer", "price": "$44"},
            {"name": "Gold Highlighter", "type": "Highlighter", "price": "$42"},
            {"name": "Warm Eyeshadow Palette", "type": "Eyeshadow", "price": "$65"},
            {"name": "Nude Gloss", "type": "Lip Gloss", "price": "$28"}
        ],
        "budgetDupes": [
            {"name": "Physicians Formula Butter Bronzer", "type": "Bronzer", "price": "$14"},
            {"name": "Wet n Wild MegaGlo Highlighter", "type": "Highlighter", "price": "$5"}
        ]
    },
    {
        "title": "Met Gala Drama",
        "category": "glam",
        "celebrity": "Blake Lively",
        "image": "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=800&q=80",
        "description": "High-fashion editorial glam with bold colors and perfect skin",
        "priceRange": "$220-$400",
        "gender": "Women",
        "products": [
            {"name": "Luxury Foundation", "type": "Foundation", "price": "$68"},
            {"name": "Setting Powder", "type": "Powder", "price": "$44"},
            {"name": "Statement Lashes", "type": "Lashes", "price": "$28"},
            {"name": "Designer Lipstick", "type": "Lipstick", "price": "$42"}
        ],
        "budgetDupes": [
            {"name": "Revolution Foundation", "type": "Foundation", "price": "$12"},
            {"name": "Ardell Lashes", "type": "Lashes", "price": "$5"}
        ]
    },
    
    # Additional Smokey Eye (2 more)
    {
        "title": "Bronze Smokey Eye",
        "category": "smokey",
        "celebrity": "Jennifer Lopez",
        "image": "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80",
        "description": "Warm bronze smokey eye perfect for evening events",
        "priceRange": "$110-$190",
        "gender": "Women",
        "products": [
            {"name": "Bronze Eyeshadow Palette", "type": "Eyeshadow", "price": "$58"},
            {"name": "Black Eyeliner", "type": "Eyeliner", "price": "$24"},
            {"name": "Volumizing Mascara", "type": "Mascara", "price": "$26"},
            {"name": "Nude Lip", "type": "Lipstick", "price": "$32"}
        ],
        "budgetDupes": [
            {"name": "NYX Ultimate Palette", "type": "Eyeshadow", "price": "$18"},
            {"name": "Maybelline Mascara", "type": "Mascara", "price": "$10"}
        ]
    },
    {
        "title": "Charcoal Smokey",
        "category": "smokey",
        "celebrity": "Megan Fox",
        "image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
        "description": "Intense charcoal smokey eye with sultry definition",
        "priceRange": "$130-$220",
        "gender": "Women",
        "products": [
            {"name": "Smokey Eye Palette", "type": "Eyeshadow", "price": "$62"},
            {"name": "Gel Liner", "type": "Eyeliner", "price": "$22"},
            {"name": "False Lashes", "type": "Lashes", "price": "$18"},
            {"name": "Matte Lipstick", "type": "Lipstick", "price": "$28"}
        ],
        "budgetDupes": [
            {"name": "e.l.f. Smokey Eye Palette", "type": "Eyeshadow", "price": "$10"},
            {"name": "Kiss Lashes", "type": "Lashes", "price": "$4"}
        ]
    },
    
    # Additional Everyday Looks (2 more)
    {
        "title": "5-Minute Fresh Face",
        "category": "everyday",
        "celebrity": "Emma Watson",
        "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
        "description": "Quick and easy everyday makeup that enhances natural beauty",
        "priceRange": "$60-$110",
        "gender": "Women",
        "products": [
            {"name": "BB Cream", "type": "Foundation", "price": "$28"},
            {"name": "Tinted Brow Gel", "type": "Brow", "price": "$18"},
            {"name": "Cream Blush Stick", "type": "Blush", "price": "$22"},
            {"name": "Lip Stain", "type": "Lip", "price": "$16"}
        ],
        "budgetDupes": [
            {"name": "Garnier BB Cream", "type": "Foundation", "price": "$12"},
            {"name": "NYX Brow Mascara", "type": "Brow", "price": "$7"}
        ]
    },
    {
        "title": "Office Ready Makeup",
        "category": "everyday",
        "celebrity": "Priyanka Chopra",
        "image": "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=800&q=80",
        "description": "Professional and polished look perfect for the workplace",
        "priceRange": "$85-$145",
        "gender": "Women",
        "products": [
            {"name": "Medium Coverage Foundation", "type": "Foundation", "price": "$42"},
            {"name": "Matte Bronzer", "type": "Bronzer", "price": "$28"},
            {"name": "Neutral Eyeshadow", "type": "Eyeshadow", "price": "$32"},
            {"name": "Professional Lipstick", "type": "Lipstick", "price": "$26"}
        ],
        "budgetDupes": [
            {"name": "Revlon ColorStay", "type": "Foundation", "price": "$13"},
            {"name": "Wet n Wild Lipstick", "type": "Lipstick", "price": "$5"}
        ]
    },
    
    # Additional Festival Look (1 more)
    {
        "title": "Neon Festival Glow",
        "category": "festival",
        "celebrity": "Dua Lipa",
        "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
        "description": "Bold neon colors with glitter and creative face art for music festivals",
        "priceRange": "$90-$160",
        "gender": "Women",
        "products": [
            {"name": "Neon Eyeshadow Palette", "type": "Eyeshadow", "price": "$45"},
            {"name": "Body Glitter", "type": "Glitter", "price": "$18"},
            {"name": "UV Face Paint", "type": "Face Paint", "price": "$22"},
            {"name": "Glitter Glue", "type": "Adhesive", "price": "$12"}
        ],
        "budgetDupes": [
            {"name": "NYX Brights Palette", "type": "Eyeshadow", "price": "$18"},
            {"name": "EcoStardust Glitter", "type": "Glitter", "price": "$8"}
        ]
    },
    
    # NEW CATEGORY: Bridal (5 items)
    {
        "title": "Classic Bridal Elegance",
        "category": "bridal",
        "celebrity": "Kate Middleton",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
        "description": "Timeless bridal makeup with soft pink tones and radiant glow",
        "priceRange": "$200-$350",
        "gender": "Women",
        "products": [
            {"name": "Bridal Foundation", "type": "Foundation", "price": "$58"},
            {"name": "Setting Spray", "type": "Setting", "price": "$32"},
            {"name": "Pink Eyeshadow Palette", "type": "Eyeshadow", "price": "$54"},
            {"name": "Rose Lipstick", "type": "Lipstick", "price": "$34"}
        ],
        "budgetDupes": [
            {"name": "L'Oréal True Match", "type": "Foundation", "price": "$14"},
            {"name": "NYX Setting Spray", "type": "Setting", "price": "$8"}
        ]
    },
    {
        "title": "Romantic Bridal Glow",
        "category": "bridal",
        "celebrity": "Priyanka Chopra",
        "image": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
        "description": "Soft romantic makeup with dewy skin and peachy tones",
        "priceRange": "$180-$300",
        "gender": "Women",
        "products": [
            {"name": "Luminous Foundation", "type": "Foundation", "price": "$52"},
            {"name": "Peach Blush", "type": "Blush", "price": "$28"},
            {"name": "Champagne Highlighter", "type": "Highlighter", "price": "$38"},
            {"name": "Nude Pink Lipstick", "type": "Lipstick", "price": "$32"}
        ],
        "budgetDupes": [
            {"name": "Maybelline Fit Me", "type": "Foundation", "price": "$8"},
            {"name": "Milani Baked Blush", "type": "Blush", "price": "$9"}
        ]
    },
    {
        "title": "Glamorous Bridal Drama",
        "category": "bridal",
        "celebrity": "Deepika Padukone",
        "image": "https://images.unsplash.com/photo-1515552726385-41a3ddb29af7?w=800&q=80",
        "description": "Bold and glamorous bridal look with dramatic eyes and sculpted features",
        "priceRange": "$250-$420",
        "gender": "Women",
        "products": [
            {"name": "HD Foundation", "type": "Foundation", "price": "$62"},
            {"name": "Bridal Eyeshadow Palette", "type": "Eyeshadow", "price": "$68"},
            {"name": "Luxury Lashes", "type": "Lashes", "price": "$32"},
            {"name": "Long-Wear Lipstick", "type": "Lipstick", "price": "$38"}
        ],
        "budgetDupes": [
            {"name": "Catrice HD Foundation", "type": "Foundation", "price": "$12"},
            {"name": "Essence Lashes", "type": "Lashes", "price": "$4"}
        ]
    },
    {
        "title": "Minimalist Bridal Beauty",
        "category": "bridal",
        "celebrity": "Meghan Markle",
        "image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
        "description": "Clean and minimal bridal makeup focusing on perfect skin and natural features",
        "priceRange": "$160-$280",
        "gender": "Women",
        "products": [
            {"name": "Skin Tint", "type": "Foundation", "price": "$48"},
            {"name": "Natural Brow Pencil", "type": "Brow", "price": "$22"},
            {"name": "Soft Brown Mascara", "type": "Mascara", "price": "$24"},
            {"name": "MLBB Lipstick", "type": "Lipstick", "price": "$28"}
        ],
        "budgetDupes": [
            {"name": "Glossier Skin Tint", "type": "Foundation", "price": "$26"},
            {"name": "NYX Micro Brow", "type": "Brow", "price": "$10"}
        ]
    },
    {
        "title": "Golden Bridal Goddess",
        "category": "bridal",
        "celebrity": "Aishwarya Rai",
        "image": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
        "description": "Regal bridal look with gold accents and warm bronze tones",
        "priceRange": "$220-$380",
        "gender": "Women",
        "products": [
            {"name": "Radiant Foundation", "type": "Foundation", "price": "$56"},
            {"name": "Gold Eyeshadow Palette", "type": "Eyeshadow", "price": "$62"},
            {"name": "Bronze Highlighter", "type": "Highlighter", "price": "$42"},
            {"name": "Red Lipstick", "type": "Lipstick", "price": "$36"}
        ],
        "budgetDupes": [
            {"name": "Wet n Wild Photo Focus", "type": "Foundation", "price": "$6"},
            {"name": "Colourpop Palette", "type": "Eyeshadow", "price": "$12"}
        ]
    },
    
    # NEW CATEGORY: Bold (3 items)
    {
        "title": "Electric Blue Statement",
        "category": "bold",
        "celebrity": "Rihanna",
        "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
        "description": "Bold electric blue eyeshadow with dramatic liner for a statement look",
        "priceRange": "$120-$200",
        "gender": "Women",
        "products": [
            {"name": "Bright Blue Eyeshadow", "type": "Eyeshadow", "price": "$38"},
            {"name": "Black Liner", "type": "Eyeliner", "price": "$22"},
            {"name": "Dramatic Lashes", "type": "Lashes", "price": "$24"},
            {"name": "Nude Lip", "type": "Lipstick", "price": "$28"}
        ],
        "budgetDupes": [
            {"name": "NYX Jumbo Eye Pencil", "type": "Eyeshadow", "price": "$5"},
            {"name": "e.l.f. Eyeliner", "type": "Eyeliner", "price": "$3"}
        ]
    },
    {
        "title": "Graphic Liner Art",
        "category": "bold",
        "celebrity": "Euphoria Inspired",
        "image": "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=800&q=80",
        "description": "Creative graphic liner with artistic shapes and bold colors",
        "priceRange": "$95-$165",
        "gender": "Women",
        "products": [
            {"name": "Colorful Liner Set", "type": "Eyeliner", "price": "$42"},
            {"name": "White Base", "type": "Eyeshadow", "price": "$18"},
            {"name": "Rhinestones", "type": "Accessories", "price": "$15"},
            {"name": "Glitter Gel", "type": "Glitter", "price": "$22"}
        ],
        "budgetDupes": [
            {"name": "NYX Epic Wear Liner", "type": "Eyeliner", "price": "$10"},
            {"name": "Amazon Rhinestones", "type": "Accessories", "price": "$8"}
        ]
    },
    {
        "title": "Neon Cut Crease",
        "category": "bold",
        "celebrity": "Lady Gaga",
        "image": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80",
        "description": "Sharp cut crease with vibrant neon colors and precision",
        "priceRange": "$110-$185",
        "gender": "Women",
        "products": [
            {"name": "Neon Palette", "type": "Eyeshadow", "price": "$48"},
            {"name": "Cut Crease Brush Set", "type": "Tools", "price": "$35"},
            {"name": "Mixing Medium", "type": "Medium", "price": "$18"},
            {"name": "Matte Lipstick", "type": "Lipstick", "price": "$26"}
        ],
        "budgetDupes": [
            {"name": "BH Cosmetics Take Me Back", "type": "Eyeshadow", "price": "$12"},
            {"name": "EcoTools Brushes", "type": "Tools", "price": "$10"}
        ]
    }
]

def load_expanded_beauty_looks():
    """Load expanded beauty looks collection"""
    print("="*80)
    print("💄 Loading Expanded Beauty Looks Collection")
    print("="*80)
    
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    collection = db['beauty_looks']
    
    print(f"\n✅ Connected to MongoDB")
    print(f"   Database: {db.name}")
    
    # Insert new beauty looks
    print(f"\n📥 Inserting {len(EXPANDED_BEAUTY_LOOKS)} new beauty looks...")
    result = collection.insert_many(EXPANDED_BEAUTY_LOOKS)
    print(f"✅ Inserted {len(result.inserted_ids)} beauty looks")
    
    # Count by category
    print("\n📊 Current beauty looks count by category:")
    categories = collection.distinct('category')
    for category in sorted(categories):
        count = collection.count_documents({'category': category})
        print(f"   {category.capitalize()}: {count} looks")
    
    total = collection.count_documents({})
    print(f"\n✅ Total beauty looks in database: {total}")
    print("\n" + "="*80)
    print("🎉 Expanded beauty looks collection loaded successfully!")
    print("="*80)
    
    client.close()

if __name__ == "__main__":
    load_expanded_beauty_looks()
