#!/usr/bin/env python3
"""
CINESCAN Real Movie Recognition Test
Tests with actual movie poster images to verify recognition functionality
"""

import requests
import json
import base64
from io import BytesIO

BACKEND_URL = "https://cinescan-backend-1.onrender.com"

def download_and_encode_image(url):
    """Download an image and encode it to base64"""
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            return base64.b64encode(response.content).decode('utf-8')
        else:
            print(f"Failed to download image: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def test_with_real_movie_poster():
    """Test image recognition with a real movie poster"""
    print("🎬 Testing with real movie poster...")
    
    # Use a simple, publicly available movie poster URL
    # This is a small poster image from a movie database
    poster_url = "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"  # Fight Club poster
    
    print(f"Downloading poster from: {poster_url}")
    image_data = download_and_encode_image(poster_url)
    
    if not image_data:
        print("❌ Failed to download poster image")
        return False
    
    print("✅ Image downloaded and encoded")
    
    # Test with file upload format
    try:
        # Convert base64 back to bytes for file upload
        image_bytes = base64.b64decode(image_data)
        files = {
            'file': ('fight_club_poster.jpg', image_bytes, 'image/jpeg')
        }
        
        print("Sending image to recognition API...")
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-image",
            files=files,
            timeout=60  # Longer timeout for real processing
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            if result.get("success"):
                print("🎉 SUCCESS: Movie recognized!")
                movie = result.get("movie")
                if movie:
                    print(f"Movie Title: {movie.get('title', 'N/A')}")
                    print(f"Movie ID: {movie.get('id', 'N/A')}")
                    print(f"Overview: {movie.get('overview', 'N/A')[:100]}...")
                return True
            else:
                print(f"⚠️ No movie found: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_with_simple_image():
    """Test with a very simple, clear movie poster"""
    print("\n🎭 Testing with another movie poster...")
    
    # Try Matrix poster
    poster_url = "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"  # The Matrix
    
    print(f"Downloading Matrix poster from: {poster_url}")
    image_data = download_and_encode_image(poster_url)
    
    if not image_data:
        print("❌ Failed to download Matrix poster")
        return False
    
    print("✅ Matrix poster downloaded and encoded")
    
    try:
        image_bytes = base64.b64decode(image_data)
        files = {
            'file': ('matrix_poster.jpg', image_bytes, 'image/jpeg')
        }
        
        print("Sending Matrix poster to recognition API...")
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-image",
            files=files,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            if result.get("success"):
                print("🎉 SUCCESS: Matrix recognized!")
                movie = result.get("movie")
                if movie:
                    print(f"Movie Title: {movie.get('title', 'N/A')}")
                    print(f"Movie ID: {movie.get('id', 'N/A')}")
                return True
            else:
                print(f"⚠️ Matrix not recognized: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Matrix test failed: {e}")
        return False

def main():
    """Run real movie recognition tests"""
    print("=" * 60)
    print("🎬 CINESCAN REAL MOVIE RECOGNITION TEST")
    print("=" * 60)
    print(f"Testing Backend: {BACKEND_URL}")
    print("=" * 60)
    
    results = []
    
    # Test with Fight Club poster
    results.append(test_with_real_movie_poster())
    
    # Test with Matrix poster
    results.append(test_with_simple_image())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 REAL MOVIE TEST SUMMARY")
    print("=" * 60)
    
    successful_tests = sum(results)
    total_tests = len(results)
    
    print(f"Successful recognitions: {successful_tests}/{total_tests}")
    
    if successful_tests > 0:
        print("✅ Movie recognition is working!")
    else:
        print("❌ Movie recognition is not working with real posters")
        print("   This could explain why users 'can't find any movies'")
    
    return successful_tests > 0

if __name__ == "__main__":
    main()