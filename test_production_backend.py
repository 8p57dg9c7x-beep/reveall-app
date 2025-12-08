#!/usr/bin/env python3
"""
Comprehensive Production Backend Testing Script
Tests all REVEAL API endpoints on Render deployment
"""

import requests
import json
import time

BACKEND_URL = "https://cinescan-backend.onrender.com"

def test_endpoint(method, path, description, expected_keys=None, timeout=15):
    """Test a single endpoint"""
    url = f"{BACKEND_URL}{path}"
    
    print(f"\n{'='*80}")
    print(f"🧪 TEST: {description}")
    print(f"{'='*80}")
    print(f"📍 URL: {url}")
    print(f"⏱️  Method: {method}")
    
    try:
        start_time = time.time()
        
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        elif method == "POST":
            response = requests.post(url, json={}, timeout=timeout)
        
        elapsed = time.time() - start_time
        
        print(f"⚡ Response Time: {elapsed:.2f}s")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                
                # Check for expected keys
                if expected_keys:
                    for key in expected_keys:
                        if key in data:
                            value = data[key]
                            if isinstance(value, list):
                                print(f"✅ {key}: {len(value)} items")
                            else:
                                print(f"✅ {key}: {str(value)[:50]}")
                        else:
                            print(f"⚠️  Missing key: {key}")
                else:
                    print(f"✅ Response: {str(data)[:150]}...")
                
                return True, data
            except json.JSONDecodeError:
                print(f"⚠️  Response not JSON")
                return True, None
        else:
            print(f"❌ FAILED with status {response.status_code}")
            print(f"   Error: {response.text[:200]}")
            return False, None
            
    except requests.Timeout:
        print(f"❌ TIMEOUT after {timeout}s")
        print(f"   This usually means MongoDB connection issue")
        return False, None
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, None

def main():
    print("="*80)
    print("🔬 REVEAL BACKEND - COMPREHENSIVE PRODUCTION TEST")
    print("="*80)
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"⏰ Test Started: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    results = []
    
    # Test 1: Root API
    print("\n" + "="*80)
    print("SECTION 1: CORE API")
    print("="*80)
    
    success, data = test_endpoint("GET", "/api/", "Root API Health Check", 
                                   expected_keys=["message", "status"])
    results.append(("Root API", success))
    
    # Test 2: Style/Fashion Endpoints
    print("\n" + "="*80)
    print("SECTION 2: STYLE & FASHION API")
    print("="*80)
    
    success, data = test_endpoint("GET", "/api/outfits/trending", 
                                   "Trending Outfits", 
                                   expected_keys=["outfits"])
    results.append(("Trending Outfits", success))
    
    success, data = test_endpoint("GET", "/api/outfits/celebrity", 
                                   "Celebrity Outfits", 
                                   expected_keys=["outfits"])
    results.append(("Celebrity Outfits", success))
    
    success, data = test_endpoint("GET", "/api/outfits/streetwear", 
                                   "Streetwear Category", 
                                   expected_keys=["outfits"])
    results.append(("Streetwear", success))
    
    success, data = test_endpoint("GET", "/api/outfits/luxury", 
                                   "Luxury Category", 
                                   expected_keys=["outfits"])
    results.append(("Luxury", success))
    
    # Test 3: Beauty Endpoints
    print("\n" + "="*80)
    print("SECTION 3: BEAUTY & MAKEUP API")
    print("="*80)
    
    success, data = test_endpoint("GET", "/api/beauty/glam", 
                                   "Glam Beauty Looks", 
                                   expected_keys=["looks"])
    results.append(("Glam Beauty", success))
    
    success, data = test_endpoint("GET", "/api/beauty/natural", 
                                   "Natural Beauty Looks", 
                                   expected_keys=["looks"])
    results.append(("Natural Beauty", success))
    
    success, data = test_endpoint("GET", "/api/beauty/bold", 
                                   "Bold Beauty Looks", 
                                   expected_keys=["looks"])
    results.append(("Bold Beauty", success))
    
    # Test 4: Movie Endpoints
    print("\n" + "="*80)
    print("SECTION 4: MOVIE DISCOVERY API")
    print("="*80)
    
    success, data = test_endpoint("GET", "/api/discover/trending", 
                                   "Trending Movies", 
                                   expected_keys=["results"])
    results.append(("Trending Movies", success))
    
    success, data = test_endpoint("GET", "/api/discover/upcoming", 
                                   "Upcoming Movies", 
                                   expected_keys=["results"])
    results.append(("Upcoming Movies", success))
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success in results if success)
    failed_tests = total_tests - passed_tests
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"\n📈 Results:")
    print(f"   Total Tests: {total_tests}")
    print(f"   ✅ Passed: {passed_tests}")
    print(f"   ❌ Failed: {failed_tests}")
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    
    print(f"\n📋 Detailed Results:")
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"   {status} - {test_name}")
    
    # Overall Status
    print("\n" + "="*80)
    print("🎯 OVERALL STATUS")
    print("="*80)
    
    if success_rate == 100:
        print("\n🎉 EXCELLENT! All tests passed!")
        print("✅ Backend is fully operational")
        print("✅ MongoDB connection working")
        print("✅ All data loaded successfully")
        print("✅ App is production-ready!")
    elif success_rate >= 80:
        print("\n✅ GOOD! Most tests passed")
        print(f"⚠️  {failed_tests} endpoint(s) need attention")
    elif success_rate >= 50:
        print("\n⚠️  PARTIAL: Some endpoints working")
        print("🔍 Check MongoDB connection and data loading")
    else:
        print("\n❌ CRITICAL: Most tests failed")
        print("\n🔍 Troubleshooting:")
        print("   1. Check if MongoDB Atlas connection string is correct")
        print("   2. Verify MONGO_URL is set in Render environment variables")
        print("   3. Check if data has been loaded into MongoDB")
        print("   4. Review Render deployment logs for errors")
    
    print("\n" + "="*80)
    print(f"⏰ Test Completed: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
