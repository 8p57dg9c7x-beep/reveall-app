#!/usr/bin/env python3
import requests
import json

RENDER_URL = "https://cinescan-backend.onrender.com"

def test_endpoint(url, description=""):
    try:
        print(f"\n🔍 {description}")
        print(f"   URL: {url}")
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                # Show compact preview
                if isinstance(data, dict):
                    if 'outfits' in data:
                        print(f"   ✅ Found {len(data['outfits'])} outfits")
                    elif 'looks' in data:
                        print(f"   ✅ Found {len(data['looks'])} beauty looks")
                    elif 'results' in data:
                        print(f"   ✅ Found {len(data['results'])} results")
                    else:
                        print(f"   ✅ Response: {str(data)[:100]}...")
                return True
            except:
                print(f"   ✅ Response received")
                return True
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ FAILED: {str(e)}")
        return False

print("=" * 80)
print("🔬 RENDER BACKEND DIAGNOSIS - NEW URL")
print("=" * 80)

results = []

# Test critical REVEAL endpoints
print("\n" + "=" * 80)
print("TEST 1: Core API")
print("=" * 80)
results.append(test_endpoint(f"{RENDER_URL}/api/", "Root API"))

print("\n" + "=" * 80)
print("TEST 2: Style/Fashion Endpoints")
print("=" * 80)
results.append(test_endpoint(f"{RENDER_URL}/api/outfits/trending", "Trending Outfits"))
results.append(test_endpoint(f"{RENDER_URL}/api/outfits/celebrity", "Celebrity Outfits"))
results.append(test_endpoint(f"{RENDER_URL}/api/outfits/streetwear", "Streetwear"))

print("\n" + "=" * 80)
print("TEST 3: Beauty Endpoints")
print("=" * 80)
results.append(test_endpoint(f"{RENDER_URL}/api/beauty/glam", "Glam Beauty"))
results.append(test_endpoint(f"{RENDER_URL}/api/beauty/natural", "Natural Beauty"))

print("\n" + "=" * 80)
print("TEST 4: Movie Endpoints")
print("=" * 80)
results.append(test_endpoint(f"{RENDER_URL}/api/discover/trending", "Trending Movies"))

print("\n" + "=" * 80)
print("📊 SUMMARY")
print("=" * 80)
passed = sum(results)
total = len(results)
print(f"\n✅ Passed: {passed}/{total}")
print(f"📈 Success Rate: {(passed/total)*100:.1f}%")

if passed == total:
    print("\n🎉 ALL TESTS PASSED! Backend is fully operational!")
else:
    print(f"\n⚠️  {total-passed} endpoint(s) need attention")
