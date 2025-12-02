#!/usr/bin/env python3
"""
CINESCAN Backend API Testing Script v2
Tests the deployed backend API endpoints for movie recognition functionality
"""

import requests
import json
import os
from pathlib import Path

# Backend URL from frontend .env file
BACKEND_URL = "https://cinescan-backend-1.onrender.com"

def test_basic_connectivity():
    """Test basic connectivity to the backend"""
    print("🔍 Testing basic connectivity...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/", timeout=10)
        print(f"✅ Basic connectivity: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Basic connectivity failed: {e}")
        return False

def test_recognize_image():
    """Test POST /api/recognize-image endpoint"""
    print("\n🖼️ Testing image recognition endpoint...")
    
    # Create a mock image file for testing
    files = {
        'file': ('test_poster.jpg', b'fake_image_data', 'image/jpeg')
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-image", 
            files=files,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("❌ Endpoint not found - /api/recognize-image not implemented")
            return False
        elif response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {json.dumps(result, indent=2)}")
            
            # Check if endpoint is working (success field exists)
            if "success" in result:
                if result["success"] and result.get("movie"):
                    # Movie found - check format
                    movie = result["movie"]
                    required_fields = ["id", "title", "release_date", "vote_average", "poster_path", "overview", "genres"]
                    missing_fields = [field for field in required_fields if field not in movie]
                    
                    if missing_fields:
                        print(f"⚠️ Missing fields in movie object: {missing_fields}")
                        return False
                    else:
                        print("✅ Response format matches expected structure")
                        return True
                else:
                    # No movie found but endpoint is working
                    print(f"✅ Endpoint working but no movie found: {result.get('error', 'Unknown error')}")
                    return True
            else:
                print("❌ Response format doesn't match expected structure")
                return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Image recognition test failed: {e}")
        return False

def test_recognize_audio():
    """Test POST /api/recognize-audio endpoint"""
    print("\n🎵 Testing audio recognition endpoint...")
    
    # Create mock audio data for testing
    test_data = {
        "audio_base64": "dGVzdF9hdWRpb19kYXRh"  # base64 encoded "test_audio_data"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-audio", 
            json=test_data,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("❌ Endpoint not found - /api/recognize-audio not implemented")
            return False
        elif response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {json.dumps(result, indent=2)}")
            
            # Check if endpoint is working (success field exists)
            if "success" in result:
                if result["success"] and result.get("movie"):
                    # Movie found - check format
                    movie = result["movie"]
                    required_fields = ["id", "title", "release_date", "vote_average", "poster_path", "overview", "genres"]
                    missing_fields = [field for field in required_fields if field not in movie]
                    
                    if missing_fields:
                        print(f"⚠️ Missing fields in movie object: {missing_fields}")
                        return False
                    else:
                        print("✅ Response format matches expected structure")
                        return True
                else:
                    # No movie found but endpoint is working
                    print(f"✅ Endpoint working but no movie found: {result.get('error', 'Unknown error')}")
                    return True
            else:
                print("❌ Response format doesn't match expected structure")
                return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Audio recognition test failed: {e}")
        return False

def test_recognize_video():
    """Test POST /api/recognize-video endpoint"""
    print("\n🎬 Testing video recognition endpoint...")
    
    # Create mock video file for testing
    files = {
        'file': ('test_video.mp4', b'fake_video_data', 'video/mp4')
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/recognize-video", 
            files=files,
            timeout=30
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("❌ Endpoint not found - /api/recognize-video not implemented")
            return False
        elif response.status_code == 200:
            result = response.json()
            print(f"✅ Response: {json.dumps(result, indent=2)}")
            
            # Check if endpoint is working (success field exists)
            if "success" in result:
                if result["success"] and result.get("movie"):
                    # Movie found - check format
                    movie = result["movie"]
                    required_fields = ["id", "title", "release_date", "vote_average", "poster_path", "overview", "genres"]
                    missing_fields = [field for field in required_fields if field not in movie]
                    
                    if missing_fields:
                        print(f"⚠️ Missing fields in movie object: {missing_fields}")
                        return False
                    else:
                        print("✅ Response format matches expected structure")
                        return True
                else:
                    # No movie found but endpoint is working
                    print(f"✅ Endpoint working but no movie found: {result.get('error', 'Unknown error')}")
                    return True
            else:
                print("❌ Response format doesn't match expected structure")
                return False
        elif response.status_code == 500:
            print(f"❌ Server error (500) - likely issue with video processing")
            print(f"Response: {response.text}")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Video recognition test failed: {e}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("🎬 CINESCAN BACKEND API TESTING v2")
    print("=" * 60)
    print(f"Testing Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    results = {}
    
    # Test basic connectivity
    results['connectivity'] = test_basic_connectivity()
    
    # Test movie recognition endpoints
    results['recognize_image'] = test_recognize_image()
    results['recognize_audio'] = test_recognize_audio()
    results['recognize_video'] = test_recognize_video()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
    elif passed_tests >= 3:
        print("✅ Most tests passed - backend is mostly functional")
    else:
        print("⚠️ Multiple tests failed - check implementation")
    
    return results

if __name__ == "__main__":
    main()