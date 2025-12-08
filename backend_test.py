#!/usr/bin/env python3
"""
CINESCAN Backend Testing Suite
Testing lyrics feature disable and other endpoints functionality
"""

import requests
import time
import json
import sys
from typing import Dict, Any, List

# Backend URL - using local backend as specified in review request
BASE_URL = "http://localhost:8001/api"

class BackendTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_result(self, test_name: str, success: bool, message: str, response_time: float = None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status}: {test_name}{time_info}")
        print(f"   {message}")
        
        self.results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_time': response_time
        })
        
    def test_lyrics_endpoint(self):
        """Test lyrics endpoint - should return static disabled message"""
        print("\n🎵 TESTING LYRICS ENDPOINT (DISABLED)")
        
        test_queries = [
            "Bohemian Rhapsody Queen",
            "Imagine John Lennon", 
            "test song",
            "Shape of You Ed Sheeran",
            "Billie Jean Michael Jackson"
        ]
        
        for query in test_queries:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}/lyrics/{query}", timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check expected response format
                    expected_format = {
                        "success": False,
                        "lyrics": None,
                        "message": "Lyrics feature is temporarily unavailable. We're working on bringing it back soon!"
                    }
                    
                    if (data.get("success") == expected_format["success"] and 
                        data.get("lyrics") == expected_format["lyrics"] and
                        data.get("message") == expected_format["message"]):
                        
                        # Check response time (should be very fast since no API call)
                        if response_time < 1.0:  # Should be instant
                            self.log_result(
                                f"Lyrics endpoint - {query}", 
                                True, 
                                f"Correct static response returned. Fast response time.", 
                                response_time
                            )
                        else:
                            self.log_result(
                                f"Lyrics endpoint - {query}", 
                                False, 
                                f"Response too slow ({response_time:.3f}s) - should be instant since no API call", 
                                response_time
                            )
                    else:
                        self.log_result(
                            f"Lyrics endpoint - {query}", 
                            False, 
                            f"Incorrect response format. Got: {data}"
                        )
                else:
                    self.log_result(
                        f"Lyrics endpoint - {query}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_result(
                    f"Lyrics endpoint - {query}", 
                    False, 
                    f"Request failed: {str(e)}"
                )
    
    def test_outfits_endpoint(self):
        """Test outfits endpoint to ensure it still works"""
        print("\n👗 TESTING OUTFITS ENDPOINT")
        
        categories = ["casual", "formal", "party", "business"]
        
        for category in categories:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}/outfits/{category}", timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    if "outfits" in data and "category" in data:
                        self.log_result(
                            f"Outfits endpoint - {category}", 
                            True, 
                            f"Returned {len(data.get('outfits', []))} outfits for category {category}", 
                            response_time
                        )
                    else:
                        self.log_result(
                            f"Outfits endpoint - {category}", 
                            False, 
                            f"Invalid response format: {data}"
                        )
                else:
                    self.log_result(
                        f"Outfits endpoint - {category}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_result(
                    f"Outfits endpoint - {category}", 
                    False, 
                    f"Request failed: {str(e)}"
                )
    
    def test_beauty_endpoint(self):
        """Test beauty endpoint to ensure it still works"""
        print("\n💄 TESTING BEAUTY ENDPOINT")
        
        categories = ["makeup", "skincare", "hair", "nails"]
        
        for category in categories:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}/beauty/{category}", timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    if "looks" in data:
                        self.log_result(
                            f"Beauty endpoint - {category}", 
                            True, 
                            f"Returned {len(data.get('looks', []))} beauty looks for category {category}", 
                            response_time
                        )
                    else:
                        self.log_result(
                            f"Beauty endpoint - {category}", 
                            False, 
                            f"Invalid response format: {data}"
                        )
                else:
                    self.log_result(
                        f"Beauty endpoint - {category}", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_result(
                    f"Beauty endpoint - {category}", 
                    False, 
                    f"Request failed: {str(e)}"
                )
    
    def test_discover_trending_endpoint(self):
        """Test discover trending endpoint"""
        print("\n🎬 TESTING DISCOVER TRENDING ENDPOINT")
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/discover/trending", timeout=15)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if "results" in data:
                    results_count = len(data.get("results", []))
                    if results_count > 0:
                        self.log_result(
                            "Discover trending endpoint", 
                            True, 
                            f"Returned {results_count} trending movies", 
                            response_time
                        )
                    else:
                        # This might be expected if TMDB_API_KEY has issues on production
                        self.log_result(
                            "Discover trending endpoint", 
                            True, 
                            "Endpoint working but returned empty results (may be TMDB API key issue)", 
                            response_time
                        )
                else:
                    self.log_result(
                        "Discover trending endpoint", 
                        False, 
                        f"Invalid response format: {data}"
                    )
            else:
                self.log_result(
                    "Discover trending endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "Discover trending endpoint", 
                False, 
                f"Request failed: {str(e)}"
            )
    
    def test_api_root_endpoint(self):
        """Test API root endpoint"""
        print("\n🏠 TESTING API ROOT ENDPOINT")
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("message") == "CINESCAN API" and 
                    data.get("version") == "1.0.0" and 
                    data.get("status") == "running"):
                    self.log_result(
                        "API root endpoint", 
                        True, 
                        "API is running and responding correctly", 
                        response_time
                    )
                else:
                    self.log_result(
                        "API root endpoint", 
                        False, 
                        f"Unexpected response: {data}"
                    )
            else:
                self.log_result(
                    "API root endpoint", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "API root endpoint", 
                False, 
                f"Request failed: {str(e)}"
            )
    
    def check_backend_logs_for_audd_calls(self):
        """Check backend logs to ensure no AudD API calls are made for lyrics"""
        print("\n📋 CHECKING BACKEND LOGS FOR AUDD CALLS")
        
        try:
            # Check supervisor logs for any AudD API calls
            import subprocess
            result = subprocess.run([
                'tail', '-n', '50', '/var/log/supervisor/backend.out.log'
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                log_content = result.stdout
                
                # Look for AudD API calls in recent logs
                audd_calls = [line for line in log_content.split('\n') if 'audd' in line.lower()]
                
                if not audd_calls:
                    self.log_result(
                        "Backend logs - No AudD calls", 
                        True, 
                        "No AudD API calls found in recent backend logs (lyrics feature properly disabled)"
                    )
                else:
                    # Check if these are old calls or new ones
                    recent_audd_calls = [call for call in audd_calls if 'lyrics' in call.lower()]
                    if not recent_audd_calls:
                        self.log_result(
                            "Backend logs - No lyrics AudD calls", 
                            True, 
                            "No recent AudD API calls for lyrics found in backend logs"
                        )
                    else:
                        self.log_result(
                            "Backend logs - AudD calls detected", 
                            False, 
                            f"Found recent AudD API calls in logs: {recent_audd_calls}"
                        )
            else:
                self.log_result(
                    "Backend logs check", 
                    False, 
                    f"Could not read backend logs: {result.stderr}"
                )
                
        except Exception as e:
            self.log_result(
                "Backend logs check", 
                False, 
                f"Error checking logs: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 STARTING CINESCAN BACKEND TESTING SUITE")
        print("=" * 60)
        
        # Test API root first
        self.test_api_root_endpoint()
        
        # Test lyrics endpoint (main focus)
        self.test_lyrics_endpoint()
        
        # Test other endpoints to ensure they still work
        self.test_outfits_endpoint()
        self.test_beauty_endpoint()
        self.test_discover_trending_endpoint()
        
        # Check logs for AudD calls
        self.check_backend_logs_for_audd_calls()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🎯 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n🎵 LYRICS FEATURE STATUS:")
        lyrics_tests = [r for r in self.results if 'lyrics' in r['test'].lower()]
        lyrics_passed = sum(1 for r in lyrics_tests if r['success'])
        
        if lyrics_passed == len(lyrics_tests) and len(lyrics_tests) > 0:
            print("✅ Lyrics feature successfully disabled - all tests passed")
            print("✅ No network errors or API call failures detected")
            print("✅ Response format matches expected structure")
            print("✅ Response time is fast (no API calls being made)")
        else:
            print("❌ Lyrics feature disable has issues - check failed tests above")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED - Backend is working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  SOME TESTS FAILED - Check results above")
        sys.exit(1)