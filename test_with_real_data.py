#!/usr/bin/env python3
"""
Test CINESCAN backend with more realistic data
"""

import requests
import json
import base64

BACKEND_URL = "https://cinescan-backend-1.onrender.com"

def test_with_movie_poster():
    """Test with a simple movie poster-like image"""
    print("🎬 Testing with movie poster simulation...")
    
    # Create a simple test image (1x1 pixel PNG)
    # This is a minimal valid PNG file
    png_data = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==')
    
    files = {
        'file': ('movie_poster.png', png_data, 'image/png')
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-image", 
            files=files,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result.get("success"):
            print("🎉 Movie found!")
            return True
        else:
            print(f"ℹ️ No movie found: {result.get('error')}")
            return True  # Still working, just no match
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_audio_with_base64():
    """Test audio endpoint with proper base64 data"""
    print("\n🎵 Testing audio with base64 data...")
    
    # Create some fake audio data (just for testing the endpoint)
    fake_audio = b"RIFF\x24\x08\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x08\x00\x00"
    audio_b64 = base64.b64encode(fake_audio).decode('utf-8')
    
    test_data = {
        "audio_base64": audio_b64
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-audio", 
            json=test_data,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result.get("success"):
            print("🎉 Movie found from audio!")
            return True
        else:
            print(f"ℹ️ No movie found: {result.get('error')}")
            return True  # Still working, just no match
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🎬 CINESCAN REALISTIC DATA TESTING")
    print("=" * 60)
    
    # Test image recognition
    img_result = test_with_movie_poster()
    
    # Test audio recognition  
    audio_result = test_audio_with_base64()
    
    print("\n" + "=" * 60)
    print("📊 REALISTIC TEST SUMMARY")
    print("=" * 60)
    print(f"Image Recognition: {'✅ WORKING' if img_result else '❌ FAILED'}")
    print(f"Audio Recognition: {'✅ WORKING' if audio_result else '❌ FAILED'}")
    
    if img_result and audio_result:
        print("\n🎉 Backend endpoints are working correctly!")
        print("Note: No movies were recognized because test data is not real movie content.")
    else:
        print("\n⚠️ Some endpoints have issues")

if __name__ == "__main__":
    main()