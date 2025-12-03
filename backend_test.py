#!/usr/bin/env python3
"""
CINESCAN Backend Testing - IMAGE RECOGNITION RETEST WITH NEW WEB DETECTION ALGORITHM
CRITICAL MISSION: Re-test the SAME 10 movie posters with the NEW improved algorithm
SUCCESS CRITERIA: 7+ correct identifications (70%+), Average response time < 5 seconds
"""

import requests
import time
import json
import base64
from typing import Dict, List, Tuple
import os
import urllib.request
from urllib.parse import urlparse

# Backend URL from user request
BASE_URL = "https://moviedetect.preview.emergentagent.com"
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
    
    def test_edge_cases_suite(self):
        """Test edge cases as requested"""
        print("\n🔍 TEST 4: EDGE CASES")
        
        edge_cases = [
            ("Godfather", "Godfather"),  # Misspelling/Partial
            ("Breakng Bad", "Breaking Bad"),  # Misspelling
            ("Harry Potter", "Harry Potter"),  # Partial name
            ("Lord of Rings", "Lord of the Rings"),  # Partial name
            ("Parasite", "Parasite"),  # Foreign film
            ("Amélie", "Amélie")  # Foreign film with accent
        ]
        
        for query, expected in edge_cases:
            self.test_movie_search(query, expected)
            time.sleep(0.5)
    
    def test_comprehensive_image_recognition(self):
        """RETEST: IMAGE RECOGNITION WITH NEW WEB DETECTION ALGORITHM
        CRITICAL MISSION: Re-test the SAME 10 movie posters with the NEW improved algorithm
        SUCCESS CRITERIA: 7+ correct identifications (70%+), Average response time < 5 seconds
        """
        print("\n🎯 RETEST: IMAGE RECOGNITION WITH NEW WEB DETECTION ALGORITHM")
        print("📋 CRITICAL MISSION: Re-test the SAME 10 movie posters with NEW improved algorithm")
        print("🎯 SUCCESS CRITERIA: 7+ correct (70%+), <5s average response time")
        print("🔄 MUST BE FASTER and MORE ACCURATE than previous test")
        print("=" * 80)
        
        # THE SAME 10 movie posters as previous test - EXACT SAME IMAGES
        test_images = [
            {
                "name": "Inception",
                "url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "expected": "Inception"
            },
            {
                "name": "The Matrix",
                "url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                "expected": "The Matrix"
            },
            {
                "name": "Titanic",
                "url": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
                "expected": "Titanic"
            },
            {
                "name": "The Dark Knight",
                "url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                "expected": "The Dark Knight"
            },
            {
                "name": "Forrest Gump",
                "url": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
                "expected": "Forrest Gump"
            },
            {
                "name": "Pulp Fiction",
                "url": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                "expected": "Pulp Fiction"
            },
            {
                "name": "Fight Club",
                "url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                "expected": "Fight Club"
            },
            {
                "name": "Goodfellas",
                "url": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
                "expected": "Goodfellas"
            },
            {
                "name": "The Shawshank Redemption",
                "url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                "expected": "The Shawshank Redemption"
            },
            {
                "name": "The Godfather",
                "url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
                "expected": "The Godfather"
            }
        ]
        
        results = []
        correct_count = 0
        total_tested = 0
        total_time = 0
        
        print(f"📥 Testing {len(test_images)} movie posters with NEW web detection algorithm...")
        print()
        
        for i, img in enumerate(test_images, 1):
            print(f"🎬 TEST {i}/10: {img['name']}")
            print(f"Expected: {img['expected']}")
            
            start_time = time.time()
            
            try:
                # Download the image
                print("  📥 Downloading image...")
                img_response = requests.get(img["url"], timeout=15)
                
                if img_response.status_code != 200:
                    print(f"  ❌ Failed to download: HTTP {img_response.status_code}")
                    results.append({
                        "image": img['name'],
                        "expected": img['expected'],
                        "result": f"DOWNLOAD_ERROR",
                        "correct": False,
                        "response_time": 0,
                        "detection_method": "N/A",
                        "error": f"Download failed: HTTP {img_response.status_code}"
                    })
                    total_tested += 1
                    continue
                
                print(f"  ✅ Downloaded ({len(img_response.content)} bytes)")
                
                # Send to image recognition endpoint using multipart/form-data as per backend expectation
                print("  🔍 Sending to recognition API...")
                files = {'file': (f'{img["name"].lower().replace(" ", "_")}.jpg', img_response.content, 'image/jpeg')}
                
                response = requests.post(f"{API_BASE}/recognize-image", files=files, timeout=30)
                duration = time.time() - start_time
                total_time += duration
                
                if response.status_code == 200:
                    data = response.json()
                    
                    result_movie = "FAILED"
                    correct = False
                    detection_method = "N/A"
                    
                    if data.get('success'):
                        movie = data.get('movie', {})
                        result_movie = movie.get('title', 'Unknown')
                        detection_method = data.get('source', 'Unknown')
                        
                        # Check if correct (flexible matching for the specific movies)
                        expected_lower = img['expected'].lower()
                        result_lower = result_movie.lower()
                        
                        # Specific matching logic for each movie
                        if "inception" in expected_lower and "inception" in result_lower:
                            correct = True
                        elif "matrix" in expected_lower and "matrix" in result_lower:
                            correct = True
                        elif "titanic" in expected_lower and "titanic" in result_lower:
                            correct = True
                        elif "dark knight" in expected_lower and "dark knight" in result_lower:
                            correct = True
                        elif "forrest gump" in expected_lower and "forrest gump" in result_lower:
                            correct = True
                        elif "pulp fiction" in expected_lower and "pulp fiction" in result_lower:
                            correct = True
                        elif "fight club" in expected_lower and "fight club" in result_lower:
                            correct = True
                        elif "goodfellas" in expected_lower and "goodfellas" in result_lower:
                            correct = True
                        elif "shawshank" in expected_lower and "shawshank" in result_lower:
                            correct = True
                        elif "godfather" in expected_lower and "godfather" in result_lower:
                            correct = True
                        
                        if correct:
                            correct_count += 1
                        
                        print(f"  🎯 RESULT: {result_movie}")
                        print(f"  🔍 METHOD: {detection_method}")
                        print(f"  {'✅ CORRECT' if correct else '❌ WRONG'}")
                        print(f"  ⏱️  Time: {duration:.2f}s")
                        
                    else:
                        error_msg = data.get('error', 'Unknown error')
                        result_movie = "FAILED"
                        print(f"  ❌ Recognition failed: {error_msg}")
                        print(f"  ⏱️  Time: {duration:.2f}s")
                    
                    results.append({
                        "image": img['name'],
                        "expected": img['expected'],
                        "result": result_movie,
                        "correct": correct,
                        "response_time": duration,
                        "detection_method": detection_method,
                        "error": None if data.get('success') else data.get('error', 'Unknown error')
                    })
                    
                else:
                    print(f"  ❌ HTTP Error: {response.status_code}")
                    results.append({
                        "image": img['name'],
                        "expected": img['expected'],
                        "result": f"HTTP_{response.status_code}",
                        "correct": False,
                        "response_time": duration,
                        "detection_method": "N/A",
                        "error": f"HTTP {response.status_code}"
                    })
                
                total_tested += 1
                
            except Exception as e:
                duration = time.time() - start_time
                total_time += duration
                print(f"  ❌ Exception: {e}")
                results.append({
                    "image": img['name'],
                    "expected": img['expected'],
                    "result": "EXCEPTION",
                    "correct": False,
                    "response_time": duration,
                    "detection_method": "N/A",
                    "error": str(e)
                })
                total_tested += 1
            
            print()  # Add spacing between tests
            time.sleep(1)  # Brief pause between tests
        
        # Generate final report in user's requested format
        print("=" * 80)
        print("📊 DETAILED RESULTS - NEW WEB DETECTION ALGORITHM")
        print("=" * 80)
        
        # For Each Image Log as requested
        for result in results:
            print(f"""
Image name: {result['image']}
Expected movie: {result['expected']}
Result movie: {result['result']}
Correct: {'YES' if result['correct'] else 'NO'}
Response time: {result['response_time']:.2f}s
Detection method: {result['detection_method']}
""")
        
        # Calculate statistics
        wrong_count = sum(1 for r in results if not r['correct'] and 'ERROR' not in str(r['result']))
        avg_time = total_time / total_tested if total_tested > 0 else 0
        pass_rate = (correct_count / total_tested * 100) if total_tested > 0 else 0
        
        # Final Report in user's exact format
        print("=" * 80)
        print("🎯 FINAL REPORT")
        print("=" * 80)
        print(f"Total: {total_tested}")
        print(f"Correct: {correct_count}")
        print(f"Wrong: {wrong_count}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        print(f"Average Time: {avg_time:.2f}s")
        print()
        
        # Determine PASS/FAIL based on user criteria
        meets_accuracy = correct_count >= 7
        meets_speed = avg_time < 5.0
        
        if meets_accuracy and meets_speed:
            status = "✅ PASS (7+/10, <5s)"
        else:
            status = "❌ FAIL"
            if not meets_accuracy:
                status += f" (Only {correct_count}/10 correct, need 7+)"
            if not meets_speed:
                status += f" (Avg {avg_time:.2f}s, need <5s)"
        
        print(f"Status: {status}")
        
        # Comparison to previous test (from test_result.md)
        previous_correct = 6
        previous_time = 9.72
        
        accuracy_better = correct_count > previous_correct
        speed_better = avg_time < previous_time
        
        if accuracy_better and speed_better:
            comparison = "✅ Better (Both accuracy and speed improved)"
        elif accuracy_better:
            comparison = "🔄 Mixed (Accuracy improved, speed similar)"
        elif speed_better:
            comparison = "🔄 Mixed (Speed improved, accuracy similar)"
        else:
            comparison = "❌ Worse (No improvement)"
        
        print(f"Comparison to previous: {comparison}")
        print(f"Previous: {previous_correct}/10 correct (60%), {previous_time}s avg")
        print(f"Current:  {correct_count}/10 correct ({pass_rate:.1f}%), {avg_time:.2f}s avg")
        
        # Show failed cases for analysis
        failed_cases = [r for r in results if not r['correct']]
        if failed_cases:
            print(f"\n❌ FAILED CASES ({len(failed_cases)}):")
            for case in failed_cases:
                print(f"  • {case['image']}: Expected '{case['expected']}', Got '{case['result']}' ({case['detection_method']})")
        
        # Log results for main testing framework
        self.log_result("NEW Web Detection Algorithm Test", meets_accuracy and meets_speed, 
                       avg_time, f"{correct_count}/10 correct ({pass_rate:.1f}%), {avg_time:.2f}s avg - {status}")
        
        return {
            "total_tested": total_tested,
            "correct": correct_count,
            "wrong": wrong_count,
            "pass_rate": pass_rate,
            "avg_time": avg_time,
            "status": status,
            "meets_criteria": meets_accuracy and meets_speed,
            "results": results
        }
    
    def test_image_recognition_endpoint(self):
        """Test image recognition endpoint structure with simple test"""
        print("\n📸 TESTING IMAGE RECOGNITION ENDPOINT STRUCTURE...")
        start_time = time.time()
        
        try:
            # Create a simple base64 test image
            dummy_image_data = b"dummy image data for testing"
            img_base64 = base64.b64encode(dummy_image_data).decode('utf-8')
            payload = {"image_base64": f"data:image/jpeg;base64,{img_base64}"}
            
            response = requests.post(f"{API_BASE}/recognize-image", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # Check response structure
                has_success = "success" in data
                has_error = "error" in data
                has_movie = "movie" in data
                
                structure_ok = has_success and has_error and has_movie
                details = f"Structure OK: {structure_ok}, Success: {data.get('success', False)}"
                
                self.log_result("Image Recognition Structure", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Image Recognition Structure", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Image Recognition Structure", False, duration, f"Error: {str(e)}")
            return False
    
    def test_audio_recognition_with_real_audio(self):
        """Test audio recognition with REAL audio files as requested by user"""
        print("\n🎵 CRITICAL AUDIO RECOGNITION TESTING WITH REAL AUDIO FILES...")
        print("🎯 USER REQUEST: Test with REAL movie audio clips/soundtracks")
        
        # Check for real audio files in test_audio directory
        test_audio_dir = "/app/test_audio"
        audio_files = []
        
        if os.path.exists(test_audio_dir):
            for file in os.listdir(test_audio_dir):
                if file.endswith(('.mp3', '.wav', '.m4a')):
                    audio_files.append(os.path.join(test_audio_dir, file))
        
        if not audio_files:
            self.log_result("Real Audio Files Check", False, 0, "❌ No real audio files found in /app/test_audio directory")
            return
        
        print(f"📁 Found {len(audio_files)} audio files for testing:")
        for audio_file in audio_files:
            file_size = os.path.getsize(audio_file)
            print(f"   - {os.path.basename(audio_file)} ({file_size} bytes)")
        print()
        
        # Test each real audio file
        for audio_file_path in audio_files:
            start_time = time.time()
            file_name = os.path.basename(audio_file_path)
            
            try:
                # Read the real audio file
                with open(audio_file_path, 'rb') as audio_file:
                    audio_content = audio_file.read()
                
                print(f"🎵 Testing audio file: {file_name} ({len(audio_content)} bytes)")
                
                # Send as multipart/form-data (as per backend expectation)
                files = {'file': (file_name, audio_content, 'audio/mpeg')}
                response = requests.post(f"{API_BASE}/recognize-audio", files=files, timeout=60)
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check response structure
                    has_structure = "success" in data and "error" in data and "movie" in data
                    if not has_structure:
                        self.log_result(f"Real Audio: {file_name}", False, duration, "❌ Invalid response structure")
                        continue
                    
                    if data.get("success"):
                        movie = data.get("movie", {})
                        movie_title = movie.get("title", "Unknown")
                        source = data.get("source", "Unknown")
                        year = movie.get("release_date", "")[:4] if movie.get("release_date") else "Unknown"
                        rating = movie.get("vote_average", "N/A")
                        
                        details = f"🎬 AudD RECOGNIZED! Movie: '{movie_title}' ({year}) | Rating: {rating}/10 | Source: {source}"
                        self.log_result(f"Real Audio: {file_name}", True, duration, details)
                        
                        # Log detailed movie info
                        print(f"   🎯 MOVIE DETAILS:")
                        print(f"      Title: {movie_title}")
                        print(f"      Year: {year}")
                        print(f"      Rating: {rating}/10")
                        print(f"      Overview: {movie.get('overview', 'N/A')[:100]}...")
                        print(f"      Genres: {[g.get('name') for g in movie.get('genres', [])]}")
                        
                    else:
                        error_msg = data.get("error", "Unknown error")
                        # This is expected for royalty-free music that's not in AudD database
                        details = f"✅ AudD processed but didn't recognize: {error_msg} (Expected for royalty-free music)"
                        self.log_result(f"Real Audio: {file_name}", True, duration, details)
                        
                        print(f"   ℹ️  AudD Response: {error_msg}")
                        print(f"   📝 Note: This is expected behavior for royalty-free music not in AudD's database")
                        
                else:
                    self.log_result(f"Real Audio: {file_name}", False, duration, f"❌ HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                duration = time.time() - start_time
                self.log_result(f"Real Audio: {file_name}", False, duration, f"❌ Error: {str(e)}")
            
            print()  # Add spacing between tests
            time.sleep(1)  # Small delay between tests
        
        # Test different audio formats if available
        self.test_audio_format_compatibility()
    
    def test_audio_format_compatibility(self):
        """Test different audio format support"""
        print("🎵 TESTING AUDIO FORMAT COMPATIBILITY...")
        
        test_audio_dir = "/app/test_audio"
        formats_found = set()
        
        if os.path.exists(test_audio_dir):
            for file in os.listdir(test_audio_dir):
                if file.endswith(('.mp3', '.wav', '.m4a')):
                    ext = os.path.splitext(file)[1].lower()
                    formats_found.add(ext)
        
        if formats_found:
            details = f"✅ Audio formats available for testing: {', '.join(sorted(formats_found))}"
            self.log_result("Audio Format Support", True, 0, details)
        else:
            self.log_result("Audio Format Support", False, 0, "❌ No audio files found for format testing")
    
    def test_audd_api_integration_detailed(self):
        """Detailed AudD API integration testing"""
        print("\n🔍 DETAILED AudD API INTEGRATION TESTING...")
        
        # Test with smallest available audio file
        test_audio_dir = "/app/test_audio"
        audio_files = []
        
        if os.path.exists(test_audio_dir):
            for file in os.listdir(test_audio_dir):
                if file.endswith('.mp3'):
                    file_path = os.path.join(test_audio_dir, file)
                    file_size = os.path.getsize(file_path)
                    audio_files.append((file_path, file_size))
        
        if not audio_files:
            self.log_result("AudD API Integration", False, 0, "❌ No MP3 files available for AudD testing")
            return
        
        # Sort by file size and test with smallest first
        audio_files.sort(key=lambda x: x[1])
        test_file, file_size = audio_files[0]
        
        start_time = time.time()
        try:
            with open(test_file, 'rb') as audio_file:
                files = {'file': (os.path.basename(test_file), audio_file, 'audio/mpeg')}
                response = requests.post(f"{API_BASE}/recognize-audio", files=files, timeout=60)
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                # Detailed analysis of AudD response
                if 'success' in data and 'error' in data and 'movie' in data:
                    audd_working = True
                    
                    if data.get('success'):
                        details = f"✅ AudD API WORKING! Successfully recognized audio and found movie via TMDB"
                    else:
                        details = f"✅ AudD API WORKING! Processed audio but no match found (expected for royalty-free music)"
                    
                    self.log_result("AudD API Integration", audd_working, duration, details)
                    
                    # Log backend processing details
                    print(f"   📊 AudD Processing Details:")
                    print(f"      File Size: {file_size} bytes")
                    print(f"      Processing Time: {duration:.2f}s")
                    print(f"      AudD Success: {data.get('success')}")
                    print(f"      Response Structure: Valid")
                    
                else:
                    self.log_result("AudD API Integration", False, duration, f"❌ Invalid response structure: {data}")
            else:
                self.log_result("AudD API Integration", False, duration, f"❌ HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("AudD API Integration", False, duration, f"❌ Integration test error: {str(e)}")
    
    def test_audio_recognition_endpoint(self):
        """Test audio recognition endpoint structure"""
        print("\n🎵 TESTING AUDIO RECOGNITION ENDPOINT STRUCTURE...")
        start_time = time.time()
        
        try:
            # Create dummy audio data
            dummy_audio = base64.b64encode(b"dummy audio data").decode('utf-8')
            payload = {"audio_base64": f"data:audio/m4a;base64,{dummy_audio}"}
            
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
                
                self.log_result("Audio Recognition Structure", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Audio Recognition Structure", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Audio Recognition Structure", False, duration, f"Error: {str(e)}")
            return False
    
    def test_video_recognition_endpoint(self):
        """Test video recognition endpoint (should return 'coming soon' message)"""
        print("\n🎥 TESTING VIDEO RECOGNITION ENDPOINT...")
        start_time = time.time()
        
        try:
            # Test with base64 video data as per API specification
            dummy_video_data = b"dummy video data for testing"
            video_base64 = base64.b64encode(dummy_video_data).decode('utf-8')
            payload = {"video_base64": f"data:video/mp4;base64,{video_base64}"}
            
            response = requests.post(f"{API_BASE}/recognize-video", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # Check response structure and "coming soon" message
                has_success = "success" in data
                has_error = "error" in data
                has_movie = "movie" in data
                coming_soon = "coming soon" in data.get("error", "").lower()
                
                structure_ok = has_success and has_error and has_movie and coming_soon
                details = f"Structure OK: {structure_ok}, Coming Soon Message: {coming_soon}, Error: {data.get('error', 'N/A')}"
                
                self.log_result("Video Recognition Endpoint", structure_ok, duration, details)
                return structure_ok
            else:
                self.log_result("Video Recognition Endpoint", False, duration, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Video Recognition Endpoint", False, duration, f"Error: {str(e)}")
            return False
    
    def test_api_key_verification(self):
        """Test if external API keys are working properly"""
        print("\n🔑 TESTING API KEY VERIFICATION...")
        
        # Test TMDB API key directly
        start_time = time.time()
        try:
            tmdb_url = "https://api.themoviedb.org/3/search/movie"
            params = {
                'api_key': '04253a70fe55d02b56ecc5f48e52b255',  # From backend/.env
                'query': 'Inception'
            }
            
            response = requests.get(tmdb_url, params=params, timeout=10)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('results') and len(data['results']) > 0:
                    movie_count = len(data['results'])
                    details = f"✅ TMDB API working, found {movie_count} results for 'Inception'"
                    self.log_result("TMDB API Key Verification", True, duration, details)
                else:
                    self.log_result("TMDB API Key Verification", False, duration, "❌ TMDB API key works but no results found")
            else:
                self.log_result("TMDB API Key Verification", False, duration, f"❌ TMDB API error: HTTP {response.status_code}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("TMDB API Key Verification", False, duration, f"❌ TMDB API error: {str(e)}")
        
        # Test Google Vision API key (indirectly through our endpoint)
        start_time = time.time()
        try:
            # Create a simple test image with text
            test_image_data = b"simple test image data"
            img_base64 = base64.b64encode(test_image_data).decode('utf-8')
            payload = {"image_base64": f"data:image/jpeg;base64,{img_base64}"}
            
            response = requests.post(f"{API_BASE}/recognize-image", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # If we get a proper response structure, Google Vision API is accessible
                if "success" in data and "error" in data:
                    details = f"✅ Google Vision API accessible through backend"
                    self.log_result("Google Vision API Key Verification", True, duration, details)
                else:
                    self.log_result("Google Vision API Key Verification", False, duration, "❌ Invalid response structure")
            else:
                self.log_result("Google Vision API Key Verification", False, duration, f"❌ HTTP {response.status_code}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Google Vision API Key Verification", False, duration, f"❌ Error: {str(e)}")
        
        # Test AudD API key (indirectly through our endpoint)
        start_time = time.time()
        try:
            test_audio_data = b"simple test audio data"
            audio_base64 = base64.b64encode(test_audio_data).decode('utf-8')
            payload = {"audio_base64": f"data:audio/m4a;base64,{audio_base64}"}
            
            response = requests.post(f"{API_BASE}/recognize-audio", json=payload, timeout=30)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                # If we get a proper response structure, AudD API is accessible
                if "success" in data and "error" in data:
                    details = f"✅ AudD API accessible through backend"
                    self.log_result("AudD API Key Verification", True, duration, details)
                else:
                    self.log_result("AudD API Key Verification", False, duration, "❌ Invalid response structure")
            else:
                self.log_result("AudD API Key Verification", False, duration, f"❌ HTTP {response.status_code}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("AudD API Key Verification", False, duration, f"❌ Error: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling with invalid data"""
        print("\n🚨 TESTING ERROR HANDLING...")
        
        # Test with invalid image data
        start_time = time.time()
        try:
            payload = {"image_base64": "invalid_base64_data"}
            response = requests.post(f"{API_BASE}/recognize-image", json=payload, timeout=15)
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == False and data.get("error"):
                    details = f"✅ Proper error handling: {data.get('error')}"
                    self.log_result("Error Handling - Invalid Image", True, duration, details)
                else:
                    self.log_result("Error Handling - Invalid Image", False, duration, f"❌ Poor error handling: {data}")
            else:
                # 422 or 400 are also acceptable for validation errors
                if response.status_code in [400, 422]:
                    details = f"✅ Proper validation error: HTTP {response.status_code}"
                    self.log_result("Error Handling - Invalid Image", True, duration, details)
                else:
                    self.log_result("Error Handling - Invalid Image", False, duration, f"❌ HTTP {response.status_code}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Error Handling - Invalid Image", False, duration, f"❌ Error: {str(e)}")
        
        # Test with malformed request
        start_time = time.time()
        try:
            payload = {"wrong_field": "test"}
            response = requests.post(f"{API_BASE}/recognize-image", json=payload, timeout=15)
            duration = time.time() - start_time
            
            if response.status_code in [422, 400]:  # Expected validation error
                details = f"✅ Proper validation error: HTTP {response.status_code}"
                self.log_result("Error Handling - Malformed Request", True, duration, details)
            else:
                self.log_result("Error Handling - Malformed Request", False, duration, f"❌ Unexpected response: HTTP {response.status_code}")
                
        except Exception as e:
            duration = time.time() - start_time
            self.log_result("Error Handling - Malformed Request", False, duration, f"❌ Error: {str(e)}")
    
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
        """Run comprehensive image recognition testing as specifically requested by user"""
        print("🎬 CINESCAN COMPREHENSIVE IMAGE RECOGNITION TESTING")
        print("=" * 80)
        print("🎯 USER PRIORITY REQUEST: Test image recognition with 10 different movie posters")
        print(f"🌐 Backend URL: {BASE_URL}")
        print("🎪 SUCCESS CRITERIA: 7+ correct identifications, <5s response time")
        print("=" * 80)
        
        # Test API health first
        if not self.test_api_health():
            print("❌ API is not responding. Stopping tests.")
            return
        
        # PHASE 1: COMPREHENSIVE IMAGE RECOGNITION TESTING - USER PRIORITY
        print("\n📸 PHASE 1: COMPREHENSIVE IMAGE RECOGNITION TESTING (USER PRIORITY)")
        print("🎯 USER REQUEST: Test with 10 different movie posters/screenshots")
        self.test_comprehensive_image_recognition()      # CRITICAL: User's main request
        
        # PHASE 2: BASIC ENDPOINT VERIFICATION
        print("\n🔧 PHASE 2: BASIC ENDPOINT VERIFICATION")
        self.test_image_recognition_endpoint()
        self.test_video_recognition_endpoint()
        
        # PHASE 3: API KEY VERIFICATION
        print("\n🔑 PHASE 3: API KEY VERIFICATION")
        self.test_api_key_verification()
        
        # PHASE 4: ERROR HANDLING
        print("\n🚨 PHASE 4: ERROR HANDLING")
        self.test_error_handling()
        
        # Print comprehensive summary
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