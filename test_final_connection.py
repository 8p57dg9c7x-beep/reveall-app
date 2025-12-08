from pymongo import MongoClient
import sys

MONGO_URL = "mongodb+srv://cinescan:reveal2025@cluster0.9wucxrm.mongodb.net/app_database?retryWrites=true&w=majority"

print("="*80)
print("🔗 Testing MongoDB Atlas Connection")
print("="*80)
print(f"URL: {MONGO_URL[:50]}...")

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=10000)
    client.server_info()
    
    print("\n✅ CONNECTION SUCCESSFUL!")
    print(f"   Available databases: {client.list_database_names()}")
    
    db = client['app_database']
    collections = db.list_collection_names()
    print(f"   Collections in 'app_database': {collections if collections else '[]'}")
    
    print("\n✅ Ready to load data!")
    sys.exit(0)
except Exception as e:
    print(f"\n❌ Connection failed: {e}")
    sys.exit(1)
