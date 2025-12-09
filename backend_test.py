#!/usr/bin/env python3
"""
CINESCAN Backend Testing - TMDB Integration Verification
Testing all TMDB-related endpoints for production readiness
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

# Backend URL from frontend/.env
BACKEND_URL = "http://localhost:8001/api"

class TMDBTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_time": f"{response_time:.3f}s"
        }
        self.results.append(result)
        print(f"{status} - {test_name} ({response_time:.3f}s)")
        if details:
            print(f"    Details: {details}")
    
    def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, expected_fields: List[str] = None) -> Dict[str, Any]:
        """Generic endpoint tester"""
        url = f"{BACKEND_URL}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            response_time = time.time() - start_time
            
            # Check status code
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "response_time": response_time
                }
            
            # Parse JSON
            try:
                json_data = response.json()
            except json.JSONDecodeError as e:
                return {
                    "success": False,
                    "error": f"Invalid JSON response: {e}",
                    "response_time": response_time
                }
            
            # Check expected fields
            if expected_fields:
                missing_fields = [field for field in expected_fields if field not in json_data]
                if missing_fields:
                    return {
                        "success": False,
                        "error": f"Missing fields: {missing_fields}",
                        "response_time": response_time,
                        "data": json_data
                    }
            
            return {
                "success": True,
                "data": json_data,
                "response_time": response_time
            }
            
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timeout (>10s)",
                "response_time": time.time() - start_time
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Request error: {e}",
                "response_time": time.time() - start_time
            }
    
    def test_discover_trending(self):
        """Test GET /api/discover/trending"""
        print("\n🎬 Testing TMDB Discover Trending...")
        
        result = self.test_endpoint("/discover/trending", expected_fields=["results"])
        
        if result["success"]:
            data = result["data"]
            results = data.get("results", [])
            
            if len(results) == 0:
                self.log_test("Discover Trending - Response", False, 
                            "No trending movies returned", result["response_time"])
                return
            
            # Check first movie structure
            first_movie = results[0]
            required_fields = ["title", "id", "poster_path", "vote_average"]
            missing_fields = [field for field in required_fields if field not in first_movie]
            
            if missing_fields:
                self.log_test("Discover Trending - Movie Structure", False,
                            f"Missing fields in movie: {missing_fields}", result["response_time"])
            else:
                self.log_test("Discover Trending - Movie Structure", True,
                            f"Found {len(results)} movies with correct structure", result["response_time"])
            
            self.log_test("Discover Trending - Response", True,
                        f"Successfully fetched {len(results)} trending movies", result["response_time"])
        else:
            self.log_test("Discover Trending - Response", False,
                        result["error"], result["response_time"])
    
    def test_discover_popular(self):
        """Test GET /api/discover/popular"""
        print("\n🔥 Testing TMDB Discover Popular...")
        
        result = self.test_endpoint("/discover/popular", expected_fields=["results"])
        
        if result["success"]:
            data = result["data"]
            results = data.get("results", [])
            
            if len(results) == 0:
                self.log_test("Discover Popular - Response", False,
                            "No popular movies returned", result["response_time"])
                return
            
            # Check movie structure
            first_movie = results[0]
            required_fields = ["title", "id", "poster_path", "vote_average"]
            missing_fields = [field for field in required_fields if field not in first_movie]
            
            if missing_fields:
                self.log_test("Discover Popular - Movie Structure", False,
                            f"Missing fields: {missing_fields}", result["response_time"])
            else:
                self.log_test("Discover Popular - Movie Structure", True,
                            f"Found {len(results)} movies with correct structure", result["response_time"])
            
            self.log_test("Discover Popular - Response", True,
                        f"Successfully fetched {len(results)} popular movies", result["response_time"])
        else:
            self.log_test("Discover Popular - Response", False,
                        result["error"], result["response_time"])
    
    def test_discover_upcoming(self):
        """Test GET /api/discover/upcoming"""
        print("\n🚀 Testing TMDB Discover Upcoming...")
        
        result = self.test_endpoint("/discover/upcoming", expected_fields=["results"])
        
        if result["success"]:
            data = result["data"]
            results = data.get("results", [])
            
            if len(results) == 0:
                self.log_test("Discover Upcoming - Response", False,
                            "No upcoming movies returned", result["response_time"])
                return
            
            # Check movie structure
            first_movie = results[0]
            required_fields = ["title", "id", "poster_path", "vote_average"]
            missing_fields = [field for field in required_fields if field not in first_movie]
            
            if missing_fields:
                self.log_test("Discover Upcoming - Movie Structure", False,
                            f"Missing fields: {missing_fields}", result["response_time"])
            else:
                self.log_test("Discover Upcoming - Movie Structure", True,
                            f"Found {len(results)} movies with correct structure", result["response_time"])
            
            self.log_test("Discover Upcoming - Response", True,
                        f"Successfully fetched {len(results)} upcoming movies", result["response_time"])
        else:
            self.log_test("Discover Upcoming - Response", False,
                        result["error"], result["response_time"])
    
    def test_movie_details(self):
        """Test GET /api/movie/{movie_id} with Inception (27205)"""
        print("\n🎭 Testing TMDB Movie Details...")
        
        movie_id = 27205  # Inception
        result = self.test_endpoint(f"/movie/{movie_id}")
        
        if result["success"]:
            data = result["data"]
            
            # Check required fields for movie details
            required_fields = ["title", "overview", "id"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Movie Details - Structure", False,
                            f"Missing fields: {missing_fields}", result["response_time"])
            else:
                # Check for cast and genres (from append_to_response)
                has_cast = "credits" in data and "cast" in data["credits"]
                has_genres = "genres" in data
                
                details = f"Title: {data.get('title')}"
                if has_cast:
                    cast_count = len(data["credits"]["cast"])
                    details += f", Cast: {cast_count} members"
                if has_genres:
                    genre_count = len(data["genres"])
                    details += f", Genres: {genre_count}"
                
                self.log_test("Movie Details - Structure", True, details, result["response_time"])
            
            self.log_test("Movie Details - Response", True,
                        f"Successfully fetched details for movie ID {movie_id}", result["response_time"])
        else:
            self.log_test("Movie Details - Response", False,
                        result["error"], result["response_time"])
    
    def test_search_movies(self):
        """Test GET /api/search/movies?q=Inception"""
        print("\n🔍 Testing TMDB Movie Search...")
        
        query = "Inception"
        result = self.test_endpoint(f"/search/movies?q={query}")
        
        if result["success"]:
            data = result["data"]
            
            if "results" not in data:
                self.log_test("Movie Search - Response Structure", False,
                            "Missing 'results' field", result["response_time"])
                return
            
            results = data["results"]
            
            if len(results) == 0:
                self.log_test("Movie Search - Results", False,
                            f"No results found for '{query}'", result["response_time"])
                return
            
            # Check if Inception is in results
            inception_found = any(movie.get("title", "").lower() == "inception" for movie in results)
            
            if inception_found:
                self.log_test("Movie Search - Accuracy", True,
                            f"Found 'Inception' in {len(results)} results", result["response_time"])
            else:
                # Check first result structure anyway
                first_result = results[0]
                self.log_test("Movie Search - Accuracy", False,
                            f"'Inception' not found. First result: {first_result.get('title', 'Unknown')}", 
                            result["response_time"])
            
            self.log_test("Movie Search - Response", True,
                        f"Successfully searched for '{query}', got {len(results)} results", result["response_time"])
        else:
            self.log_test("Movie Search - Response", False,
                        result["error"], result["response_time"])
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n⚠️  Testing Error Handling...")
        
        # Test invalid movie ID
        result = self.test_endpoint("/movie/999999999")
        if result["success"]:
            # Should return error or empty response for invalid ID
            data = result["data"]
            if data is None or (data and "error" in data):
                self.log_test("Error Handling - Invalid Movie ID", True,
                            "Properly handled invalid movie ID (returned null)", result["response_time"])
            else:
                self.log_test("Error Handling - Invalid Movie ID", False,
                            "Should return error for invalid movie ID", result["response_time"])
        else:
            # HTTP error is also acceptable
            self.log_test("Error Handling - Invalid Movie ID", True,
                        f"Properly returned HTTP error: {result['error']}", result["response_time"])
        
        # Test empty search query
        result = self.test_endpoint("/search/movies?q=")
        if result["success"]:
            data = result["data"]
            if "results" in data and len(data["results"]) == 0:
                self.log_test("Error Handling - Empty Search", True,
                            "Properly handled empty search query", result["response_time"])
            else:
                self.log_test("Error Handling - Empty Search", False,
                            "Should return empty results for empty query", result["response_time"])
        else:
            self.log_test("Error Handling - Empty Search", False,
                        result["error"], result["response_time"])
    
    def test_api_key_validation(self):
        """Test that API key is working (no 401/403 errors)"""
        print("\n🔑 Testing API Key Validation...")
        
        # Test a simple endpoint that requires API key
        result = self.test_endpoint("/discover/trending")
        
        if result["success"]:
            self.log_test("API Key Validation", True,
                        "TMDB API key is working correctly", result["response_time"])
        else:
            if "401" in result["error"] or "403" in result["error"]:
                self.log_test("API Key Validation", False,
                            f"API key issue: {result['error']}", result["response_time"])
            else:
                self.log_test("API Key Validation", True,
                            f"API key OK (other error: {result['error']})", result["response_time"])
    
    def run_all_tests(self):
        """Run all TMDB tests"""
        print("🎬 CINESCAN TMDB INTEGRATION TESTING")
        print("=" * 50)
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 50)
        
        # Run all test methods
        self.test_api_key_validation()
        self.test_discover_trending()
        self.test_discover_popular()
        self.test_discover_upcoming()
        self.test_movie_details()
        self.test_search_movies()
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 50)
        print("🎯 TEST SUMMARY")
        print("=" * 50)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n" + "=" * 50)
        
        # Return results for further processing
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "results": self.results
        }

if __name__ == "__main__":
    tester = TMDBTester()
    results = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if results["failed_tests"] > 0:
        sys.exit(1)
    else:
        print("🎉 ALL TESTS PASSED!")
        sys.exit(0)