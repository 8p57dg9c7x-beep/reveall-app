from pymongo import MongoClient
import sys

# Connection string with app_database specified
MONGO_URL = "mongodb+srv://cinescan:CINESCAN2025@cluster0.9wucxrm.mongodb.net/app_database?appName=Cluster0"

print("🔗 Testing MongoDB Atlas connection...")
print(f"   URL: {MONGO_URL[:50]}...")

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    # Force connection
    client.server_info()
    
    print("✅ Connection successful!")
    print(f"   Available databases: {client.list_database_names()}")
    
    # Check our database
    db = client['app_database']
    collections = db.list_collection_names()
    print(f"   Collections in 'app_database': {collections if collections else 'None yet'}")
    
    sys.exit(0)
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
