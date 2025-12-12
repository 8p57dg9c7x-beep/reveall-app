#!/usr/bin/env python3
"""
Simple Image Recognition Test - Debug the API issues
"""

import requests
import time
import urllib.request

# Test with a simple movie poster
def test_simple_image():
    print("🎬 SIMPLE IMAGE RECOGNITION TEST")
    print("=" * 50)
    
    # Use a smaller, simpler image
    test_url = "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg"  # Smaller Inception poster
    
    try:
        print("📥 Downloading test image...")
        img_response = requests.get(test_url, timeout=10)
        print(f"✅ Downloaded {len(img_response.content)} bytes")
        
        print("🔍 Testing image recognition...")
        start_time = time.time()
        
        # Send as multipart/form-data (correct format)
        files = {'file': ('inception.jpg', img_response.content, 'image/jpeg')}
        response = requests.post(
            "https://reveal-ux-fix.preview.emergentagent.com/api/recognize-image",
            files=files,
            timeout=30  # Longer timeout
        )
        
        duration = time.time() - start_time
        
        print(f"⏱️  Response time: {duration:.2f}s")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('success')}")
            if data.get('success'):
                movie = data.get('movie', {})
                print(f"🎬 Found movie: {movie.get('title', 'Unknown')}")
                print(f"⭐ Score: {movie.get('popularity', 0)}")
                print(f"📅 Year: {movie.get('release_date', 'Unknown')[:4] if movie.get('release_date') else 'Unknown'}")
            else:
                print(f"❌ Error: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_simple_image()