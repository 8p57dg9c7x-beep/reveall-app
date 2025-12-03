#!/usr/bin/env python3
"""
CINESCAN Backend Comprehensive Testing Suite
Tests speed, accuracy, and functionality of movie recognition system
Target: Shazam-level performance (under 3 seconds)
"""

import requests
import time
import json
import base64
from typing import Dict, List, Tuple
import os

# Backend URL
BASE_URL = "http://localhost:8001"
API_BASE = f"{BASE_URL}/api"

class CinescanTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def log_result(self, test_name: str, success: bool, duration: float, details: str = ""):
        """Log test result with timing"""
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
            "duration": f"{duration:.2f}s",
            "details": details,
            "speed_ok": duration < 3.0  # Shazam-level target
        }
        self.results.append(result)
        print(f"{status} | {test_name} | {duration:.2f}s | {details}")
        
    def test_api_health(self):
        """Test basic API health"""
        print("\n🔍 TESTING API HEALTH...")
        start_time = time.time()
        
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}, Version: {data.get('version', 'unknown')}"
                self.log_result("API Health Check", True, duration, details)
                return True
            else:
                self.log_result("API Health Check", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("API Health Check", False, duration, f"Error: {str(e)}")
            return False
    
    def test_movie_search(self, query: str, expected_movie: str = None) -> Tuple[bool, float, Dict]:
        """Test movie search endpoint"""
        start_time = time.time()
        
        try:
            payload = {"query": query}
            response = requests.post(f"{API_BASE}/search", json=payload, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("movie"):
                    movie = data["movie"]
                    title = movie.get("title", "Unknown")
                    year = movie.get("release_date", "")[:4] if movie.get("release_date") else "Unknown"
                    rating = movie.get("vote_average", "N/A")
                    
                    details = f"Found: {title} ({year}) - Rating: {rating}/10"
                    
                    # Check if we found the expected movie (if specified)
                    if expected_movie:
                        success = expected_movie.lower() in title.lower()
                        if not success:
                            details += f" | Expected: {expected_movie}"
                    else:
                        success = True
                        
                    self.log_result(f"Search: {query}", success, duration, details)
                    return success, duration, data
                else:
                    error = data.get("error", "Unknown error")
                    self.log_result(f"Search: {query}", False, duration, f"No results: {error}")
                    return False, duration, data
            else:
                self.log_result(f"Search: {query}", False, duration, f"HTTP {response.status_code}")
                return False, duration, {}
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result(f"Search: {query}", False, duration, f"Error: {str(e)}")
            return False, duration, {}
    
    def test_old_movies_suite(self):
        """Test old/classic movies as requested"""
        print("\n📽️  TEST 1: OLD MOVIES (Classic Films)")
        
        # Old movies as specifically requested
        movies = [
            ("The Godfather", "Godfather"),
            ("Casablanca", "Casablanca"), 
            ("Gone with the Wind", "Gone with the Wind"),
            ("Citizen Kane", "Citizen Kane"),
            ("Psycho", "Psycho"),
            ("Jaws", "Jaws")
        ]
        
        for query, expected in movies:
            self.test_movie_search(query, expected)
            time.sleep(0.5)  # Small delay between requests
    
    def test_anime_recognition_suite(self):
        """Test anime recognition as requested"""
        print("\n🎌 TEST 2: ANIME")
        
        anime_list = [
            "Naruto",
            "Dragon Ball Z",
            "Attack on Titan", 
            "My Hero Academia",
            "Death Note",
            "One Piece",
            "Spirited Away"
        ]
        
        for anime in anime_list:
            success, duration, data = self.test_movie_search(anime)
            # Note: TMDB might not have all anime, so we'll check if we get any results
            time.sleep(0.5)
    
    def test_tv_series_suite(self):
        """Test TV series recognition as requested"""
        print("\n📺 TEST 3: TV SERIES")
        
        series_list = [
            ("Friends", "Friends"),
            ("Breaking Bad", "Breaking Bad"),
            ("Game of Thrones", "Game of Thrones"),
            ("The Office", "Office"),
            ("Stranger Things", "Stranger Things"),
            ("The Sopranos", "Sopranos")
        ]
        
        for query, expected in series_list:
            self.test_movie_search(query, expected)
            time.sleep(0.5)
    
    def test_accuracy_suite(self):
        """Test accuracy with misspellings and partial names"""
        print("\n🎯 TESTING ACCURACY WITH VARIATIONS...")
        
        variations = [
            ("Inceptoin", "Inception"),  # Misspelling
            ("Fight Clbu", "Fight Club"),  # Misspelling
            ("Dark Knight", "Dark Knight"),  # Partial name
            ("Avengers", "Avengers"),  # Common name
            ("Star Wars", "Star Wars")  # Franchise name
        ]
        
        for query, expected in variations:
            self.test_movie_search(query, expected)
            time.sleep(0.5)
    
    def test_image_recognition_endpoint(self):
        """Test image recognition endpoint structure"""
        print("\n📸 TESTING IMAGE RECOGNITION ENDPOINT...")
        start_time = time.time()
        
        try:
            # Create a dummy image file for testing endpoint
            dummy_image_data = b"dummy image data for testing"
            files = {"file": ("test.jpg", dummy_image_data, "image/jpeg")}
            
            response = requests.post(f"{API_BASE}/recognize-image", files=files, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # Check response structure
                has_success = "success" in data
                has_error = "error" in data
                has_movie = "movie" in data
                
                structure_ok = has_success and has_error and has_movie
                details = f"Structure OK: {structure_ok}, Success: {data.get('success', False)}"
                
                self.log_result("Image Recognition Endpoint", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Image Recognition Endpoint", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Image Recognition Endpoint", False, duration, f"Error: {str(e)}")
            return False
    
    def test_audio_recognition_endpoint(self):
        """Test audio recognition endpoint structure"""
        print("\n🎵 TESTING AUDIO RECOGNITION ENDPOINT...")
        start_time = time.time()
        
        try:
            # Create dummy audio data
            dummy_audio = base64.b64encode(b"dummy audio data").decode('utf-8')
            payload = {"audio_base64": dummy_audio}
            
            response = requests.post(f"{API_BASE}/recognize-audio", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # Check response structure
                has_success = "success" in data
                has_error = "error" in data
                has_movie = "movie" in data
                
                structure_ok = has_success and has_error and has_movie
                details = f"Structure OK: {structure_ok}, Success: {data.get('success', False)}"
                
                self.log_result("Audio Recognition Endpoint", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Audio Recognition Endpoint", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Audio Recognition Endpoint", False, duration, f"Error: {str(e)}")
            return False
    
    def test_video_recognition_endpoint(self):
        """Test video recognition endpoint structure"""
        print("\n🎥 TESTING VIDEO RECOGNITION ENDPOINT...")
        start_time = time.time()
        
        try:
            # Create dummy video file
            dummy_video_data = b"dummy video data for testing"
            files = {"file": ("test.mp4", dummy_video_data, "video/mp4")}
            
            response = requests.post(f"{API_BASE}/recognize-video", files=files, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # Check response structure
                has_success = "success" in data
                has_error = "error" in data
                has_movie = "movie" in data
                
                structure_ok = has_success and has_error and has_movie
                details = f"Structure OK: {structure_ok}, Message: {data.get('error', 'N/A')}"
                
                self.log_result("Video Recognition Endpoint", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Video Recognition Endpoint", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Video Recognition Endpoint", False, duration, f"Error: {str(e)}")
            return False
    
    def test_speed_performance(self):
        """Test overall speed performance"""
        print("\n⚡ TESTING SPEED PERFORMANCE...")
        
        # Test multiple quick searches to measure average speed
        quick_tests = ["Inception", "Matrix", "Avengers", "Batman", "Superman"]
        total_time = 0
        successful_tests = 0
        
        for movie in quick_tests:
            start_time = time.time()
            success, duration, _ = self.test_movie_search(movie)
            if success:
                total_time += duration
                successful_tests += 1
        
        if successful_tests > 0:
            avg_speed = total_time / successful_tests
            speed_ok = avg_speed < 3.0
            details = f"Average: {avg_speed:.2f}s, Target: <3.0s, Tests: {successful_tests}/{len(quick_tests)}"
            self.log_result("Average Speed Performance", speed_ok, avg_speed, details)
        else:
            self.log_result("Average Speed Performance", False, 0, "No successful tests")
    
    def run_comprehensive_test(self):
        """Run all tests"""
        print("🎬 CINESCAN COMPREHENSIVE BACKEND TESTING")
        print("=" * 60)
        print("Target: Shazam-level speed and accuracy (<3 seconds)")
        print("=" * 60)
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API is not responding. Stopping tests.")
            return
        
        # Run all test suites
        self.test_movie_recognition_suite()
        self.test_anime_recognition_suite() 
        self.test_tv_series_suite()
        self.test_accuracy_suite()
        self.test_image_recognition_endpoint()
        self.test_audio_recognition_endpoint()
        self.test_video_recognition_endpoint()
        self.test_speed_performance()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🎬 CINESCAN TESTING SUMMARY")
        print("=" * 60)
        
        print(f"Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        
        # Speed analysis
        speed_compliant = sum(1 for r in self.results if r.get("speed_ok", False))
        print(f"⚡ Speed Compliant (<3s): {speed_compliant}/{self.total_tests}")
        
        print("\n📊 DETAILED RESULTS:")
        print("-" * 60)
        for result in self.results:
            speed_indicator = "⚡" if result.get("speed_ok", False) else "🐌"
            print(f"{result['status']} {speed_indicator} | {result['test']} | {result['duration']} | {result['details']}")
        
        print("\n🔍 CRITICAL ANALYSIS:")
        print("-" * 60)
        
        # Analyze failures
        failures = [r for r in self.results if "FAIL" in r["status"]]
        if failures:
            print("❌ FAILED TESTS:")
            for failure in failures:
                print(f"  • {failure['test']}: {failure['details']}")
        
        # Analyze slow tests
        slow_tests = [r for r in self.results if not r.get("speed_ok", True)]
        if slow_tests:
            print("\n🐌 SLOW TESTS (>3s):")
            for slow in slow_tests:
                print(f"  • {slow['test']}: {slow['duration']}")
        
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if self.passed_tests == self.total_tests:
            print("✅ ALL TESTS PASSED - System is fully functional!")
        elif self.passed_tests / self.total_tests >= 0.8:
            print("⚠️  MOSTLY WORKING - Some issues need attention")
        else:
            print("❌ SIGNIFICANT ISSUES - Major problems detected")
        
        if speed_compliant / self.total_tests >= 0.8:
            print("⚡ SPEED TARGET MET - Shazam-level performance achieved!")
        else:
            print("🐌 SPEED ISSUES - Performance below Shazam-level target")

if __name__ == "__main__":
    tester = CinescanTester()
    tester.run_comprehensive_test()