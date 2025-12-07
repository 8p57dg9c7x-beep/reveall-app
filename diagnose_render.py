#!/usr/bin/env python3
"""
Comprehensive Render deployment diagnosis script
"""

import requests
import json

RENDER_URL = "https://cinescan-backend-1.onrender.com"

def test_endpoint(url, method="GET", description=""):
    """Test an endpoint and return results"""
    try:
        print(f"\n🔍 Testing: {description}")
        print(f"   URL: {url}")
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        else:
            response = requests.post(url, timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
                return True, data
            except:
                print(f"   Response: {response.text[:200]}")
                return True, response.text
        else:
            print(f"   Error: {response.text[:200]}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False, None

def main():
    print("=" * 80)
    print("🔬 RENDER DEPLOYMENT DIAGNOSIS")
    print("=" * 80)
    
    results = {}
    
    # Test 1: Root API endpoint
    print("\n" + "=" * 80)
    print("TEST 1: Root API Endpoint")
    print("=" * 80)
    success, data = test_endpoint(f"{RENDER_URL}/api/", description="Root API")
    results['root'] = success
    
    # Test 2: Movie recognition endpoints (from original CINESCAN)
    print("\n" + "=" * 80)
    print("TEST 2: Movie Recognition Endpoints")
    print("=" * 80)
    
    # Test search endpoint
    success, data = test_endpoint(
        f"{RENDER_URL}/api/search?query=Inception", 
        description="Movie Search (Inception)"
    )
    results['movie_search'] = success
    
    # Test 3: Style/Outfit endpoints (REVEAL app features)
    print("\n" + "=" * 80)
    print("TEST 3: Style/Outfit Endpoints (REVEAL Features)")
    print("=" * 80)
    
    endpoints = [
        ("/api/outfits/trending", "Trending Outfits"),
        ("/api/outfits/celebrity", "Celebrity Outfits"),
        ("/api/outfits/streetwear", "Streetwear Category"),
        ("/api/outfits/luxury", "Luxury Category"),
        ("/api/outfits/minimal", "Minimal Category"),
    ]
    
    for endpoint, desc in endpoints:
        success, data = test_endpoint(f"{RENDER_URL}{endpoint}", description=desc)
        results[endpoint] = success
        
        # If endpoint works but returns empty, check data
        if success and data:
            if isinstance(data, dict) and 'outfits' in data:
                outfit_count = len(data.get('outfits', []))
                if outfit_count == 0:
                    print(f"   ⚠️  WARNING: Endpoint works but returned 0 outfits")
                    print(f"   💡 This suggests MongoDB is connected but database is EMPTY")
                else:
                    print(f"   ✅ SUCCESS: Found {outfit_count} outfits")
    
    # Test 4: Beauty endpoints
    print("\n" + "=" * 80)
    print("TEST 4: Beauty Endpoints (REVEAL Features)")
    print("=" * 80)
    
    beauty_endpoints = [
        ("/api/beauty/glam", "Glam Beauty Category"),
        ("/api/beauty/natural", "Natural Beauty Category"),
        ("/api/beauty/bold", "Bold Beauty Category"),
    ]
    
    for endpoint, desc in beauty_endpoints:
        success, data = test_endpoint(f"{RENDER_URL}{endpoint}", description=desc)
        results[endpoint] = success
        
        # Check for empty data
        if success and data:
            if isinstance(data, dict) and 'looks' in data:
                look_count = len(data.get('looks', []))
                if look_count == 0:
                    print(f"   ⚠️  WARNING: Endpoint works but returned 0 looks")
                    print(f"   💡 This suggests MongoDB is connected but database is EMPTY")
                else:
                    print(f"   ✅ SUCCESS: Found {look_count} looks")
    
    # Test 5: Other REVEAL endpoints
    print("\n" + "=" * 80)
    print("TEST 5: Other REVEAL Endpoints")
    print("=" * 80)
    
    other_endpoints = [
        ("/api/movies/trending", "Trending Movies"),
        ("/api/movies/coming-soon", "Coming Soon Movies"),
        ("/api/lyrics/shape%20of%20you", "Lyrics API"),
    ]
    
    for endpoint, desc in other_endpoints:
        success, data = test_endpoint(f"{RENDER_URL}{endpoint}", description=desc)
        results[endpoint] = success
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 DIAGNOSIS SUMMARY")
    print("=" * 80)
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\n" + "=" * 80)
    print("🎯 DIAGNOSIS RESULTS")
    print("=" * 80)
    
    if passed_tests == 0:
        print("\n❌ CRITICAL: Backend is completely down or unreachable")
        print("   Possible causes:")
        print("   - Render service is not running")
        print("   - Wrong URL or deployment failed")
        print("   - Firewall/network issues")
    
    elif results.get('root') and results.get('movie_search'):
        print("\n✅ GOOD: Core backend is running (movie recognition works)")
        
        outfit_endpoints_exist = any(results.get(k) for k in results if '/outfits/' in str(k))
        beauty_endpoints_exist = any(results.get(k) for k in results if '/beauty/' in str(k))
        
        if not outfit_endpoints_exist and not beauty_endpoints_exist:
            print("\n❌ PROBLEM IDENTIFIED: Style & Beauty routes are MISSING")
            print("   Root Cause: OLD VERSION of code deployed on Render")
            print("   Solution: Redeploy the latest code to Render")
            print("\n   Steps to fix:")
            print("   1. Push latest code to GitHub repository")
            print("   2. Trigger new deployment on Render")
            print("   3. Wait for deployment to complete")
            print("   4. Run this diagnosis script again")
        
        elif outfit_endpoints_exist and beauty_endpoints_exist:
            print("\n✅ GREAT: All API routes exist!")
            print("\n⚠️  CHECK: If routes return empty data...")
            print("   Root Cause: MongoDB database is EMPTY on Render")
            print("   Solution: Load data into Render's MongoDB")
            print("\n   Steps to fix:")
            print("   1. Get MongoDB connection string from Render")
            print("   2. Update MONGO_URL in data loading scripts")
            print("   3. Run: python load_real_outfits.py")
            print("   4. Run: python load_beauty_looks.py")
            print("   5. Verify data is loaded")
    
    else:
        print("\n⚠️  PARTIAL: Backend partially working")
        print("   Some endpoints work, others don't")
        print("   This suggests deployment issues or code inconsistencies")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
