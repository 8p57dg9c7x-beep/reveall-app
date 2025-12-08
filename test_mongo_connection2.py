from pymongo import MongoClient
import sys
from urllib.parse import quote_plus

# URL encode the password in case of special characters
username = "cinescan"
password = "CINESCAN2025"
cluster = "cluster0.9wucxrm.mongodb.net"
database = "app_database"

# Try different connection string formats
connection_strings = [
    f"mongodb+srv://{username}:{password}@{cluster}/{database}?retryWrites=true&w=majority",
    f"mongodb+srv://{username}:{password}@{cluster}/{database}?retryWrites=true&w=majority&appName=Cluster0",
    f"mongodb+srv://{username}:{quote_plus(password)}@{cluster}/{database}?retryWrites=true&w=majority",
]

for i, MONGO_URL in enumerate(connection_strings, 1):
    print(f"\n🔗 Testing connection format {i}...")
    print(f"   URL: {MONGO_URL[:60]}...")
    
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
        
        print(f"\n✅ WORKING CONNECTION STRING:")
        print(MONGO_URL)
        sys.exit(0)
    except Exception as e:
        print(f"❌ Failed: {str(e)[:100]}")

print("\n❌ All connection attempts failed")
sys.exit(1)
