#!/bin/bash
# Production Data Loading Script for REVEAL Backend

echo "=============================================="
echo "📊 REVEAL Backend - Production Data Loading"
echo "=============================================="
echo ""

# Check if MONGO_URL is provided
if [ -z "$1" ]; then
    echo "❌ ERROR: MongoDB connection string required"
    echo ""
    echo "Usage: ./load_data_production.sh 'mongodb+srv://...'"
    echo ""
    echo "Example:"
    echo "./load_data_production.sh 'mongodb+srv://reveal_user:password@cluster.mongodb.net/app_database'"
    exit 1
fi

MONGO_URL="$1"

echo "🔗 MongoDB URL: ${MONGO_URL:0:40}..."
echo ""

# Test connection first
echo "📡 Testing MongoDB connection..."
python3 << EOF
from pymongo import MongoClient
import sys

try:
    client = MongoClient('$MONGO_URL', serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✅ MongoDB connection successful!")
    print(f"   Databases: {client.list_database_names()}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    sys.exit(1)
EOF

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Cannot connect to MongoDB. Please check:"
    echo "   1. Connection string is correct"
    echo "   2. Password doesn't have special characters (or is URL encoded)"
    echo "   3. Network access is set to 0.0.0.0/0 in MongoDB Atlas"
    echo "   4. Database user has read/write permissions"
    exit 1
fi

echo ""
echo "=============================================="
echo "📦 Loading Outfit Data"
echo "=============================================="

cd /app/backend

# Update MONGO_URL in environment
export MONGO_URL="$MONGO_URL"

# Load outfits
python3 load_real_outfits.py

if [ $? -eq 0 ]; then
    echo "✅ Outfit data loaded successfully!"
else
    echo "❌ Failed to load outfit data"
    exit 1
fi

echo ""
echo "=============================================="
echo "💄 Loading Beauty Data"
echo "=============================================="

# Load beauty looks
python3 load_beauty_looks.py

if [ $? -eq 0 ]; then
    echo "✅ Beauty data loaded successfully!"
else
    echo "❌ Failed to load beauty data"
    exit 1
fi

echo ""
echo "=============================================="
echo "🎉 DATA LOADING COMPLETE"
echo "=============================================="
echo ""
echo "✅ All data loaded successfully!"
echo ""
echo "📊 Summary:"
echo "   - Outfit data: Loaded"
echo "   - Beauty data: Loaded"
echo ""
echo "🚀 Your REVEAL backend is now fully operational!"
echo ""
