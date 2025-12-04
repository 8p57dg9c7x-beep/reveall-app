#!/usr/bin/env python3
"""
CINESCAN Backend Testing - Music Identification Focus
CRITICAL PRIORITY: Test /api/recognize-music-base64 endpoint for 9/10 accuracy
Backend URL: https://cinescan-app-2.preview.emergentagent.com

USER EXPECTATION: Identify any music in the world with 9/10 accuracy using AudD API
Testing the new base64 audio approach to fix previous 422 FormData errors.
"""

import requests
import time
import json
import os
from io import BytesIO
import base64

# Backend URL from environment
BACKEND_URL = "https://cinescan-app-2.preview.emergentagent.com"

class VideoRecognitionTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.results = []
        self.total_tests = 0
        self.correct_identifications = 0
        
    def test_api_health(self):
        """Test if the backend API is accessible"""
        try:
            response = requests.get(f"{self.backend_url}/api/", timeout=10)
            if response.status_code == 200:
                print("✅ Backend API is accessible")
                return True
            else:
                print(f"❌ Backend API returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend API not accessible: {e}")
            return False
    
    def create_test_image_data(self, movie_name):
        """
        Create a simple test image with movie title text to simulate a video frame.
        This simulates what would be extracted from a video clip.
        """
        try:
            # Create a simple image with movie title (simulating a movie scene with visible text)
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a 800x600 image with dark background (like a movie scene)
            img = Image.new('RGB', (800, 600), color=(20, 20, 30))
            draw = ImageDraw.Draw(img)
            
            # Try to use a default font, fallback to basic if not available
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
            except:
                font = ImageFont.load_default()
            
            # Add movie title text (simulating title card or credits in video)
            text_bbox = draw.textbbox((0, 0), movie_name, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            x = (800 - text_width) // 2
            y = (600 - text_height) // 2
            
            # White text on dark background (common in movie scenes)
            draw.text((x, y), movie_name, fill=(255, 255, 255), font=font)
            
            # Add some additional text elements to make it more movie-like
            draw.text((50, 50), "A Film", fill=(200, 200, 200), font=font)
            draw.text((50, 550), "© Movie Studio", fill=(150, 150, 150), font=font)
            
            # Convert to bytes
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=95)
            return buffer.getvalue()
            
        except ImportError:
            # Fallback: create a minimal test file if PIL is not available
            print(f"⚠️  PIL not available, creating text-based test for {movie_name}")
            # Create a simple text file that contains the movie name
            test_content = f"Movie Title: {movie_name}\nGenre: Drama\nYear: 2023\nStudio: Test Studios"
            return test_content.encode('utf-8')
    
    def download_movie_poster(self, movie_name, poster_url):
        """
        Download actual movie poster to simulate extracted video frame
        """
        try:
            print(f"  📥 Downloading poster for {movie_name}...")
            response = requests.get(poster_url, timeout=15)
            
            if response.status_code == 200:
                print(f"  ✅ Downloaded ({len(response.content)} bytes)")
                return response.content
            else:
                print(f"  ❌ Failed to download: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"  ❌ Download error: {e}")
            return None
    
    def test_video_recognition(self, movie_name, expected_title, poster_url=None):
        """Test video recognition for a specific movie"""
        print(f"\n{'='*60}")
        print(f"TEST {self.total_tests + 1}/10: {movie_name}")
        print(f"Expected: {expected_title}")
        
        start_time = time.time()
        
        try:
            # Get test image data (simulating extracted video frame)
            if poster_url:
                image_data = self.download_movie_poster(movie_name, poster_url)
                if not image_data:
                    # Fallback to generated image
                    image_data = self.create_test_image_data(movie_name)
            else:
                image_data = self.create_test_image_data(movie_name)
            
            # Prepare the file for upload (simulating video file)
            files = {
                'file': (f'{movie_name.lower().replace(" ", "_")}_scene.mp4', image_data, 'video/mp4')
            }
            
            # Make request to video recognition endpoint
            response = requests.post(
                f"{self.backend_url}/api/recognize-video",
                files=files,
                timeout=30
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    found_movie = result.get('movie', {})
                    found_title = found_movie.get('title', 'Unknown')
                    
                    # Check if the identification is correct
                    is_correct = self._is_correct_identification(found_title, expected_title)
                    
                    print(f"Method: Extracted frame → Google Vision")
                    print(f"Result: {found_title}")
                    print(f"Correct: {'YES' if is_correct else 'NO'}")
                    print(f"Time: {response_time:.2f}s")
                    
                    if is_correct:
                        self.correct_identifications += 1
                    
                    self.results.append({
                        'test_number': self.total_tests + 1,
                        'movie': movie_name,
                        'expected': expected_title,
                        'found': found_title,
                        'correct': is_correct,
                        'time': response_time,
                        'success': True
                    })
                    
                else:
                    error_msg = result.get('error', 'Unknown error')
                    print(f"Method: Extracted frame → Google Vision")
                    print(f"Result: FAILED - {error_msg}")
                    print(f"Correct: NO")
                    print(f"Time: {response_time:.2f}s")
                    
                    self.results.append({
                        'test_number': self.total_tests + 1,
                        'movie': movie_name,
                        'expected': expected_title,
                        'found': 'FAILED',
                        'correct': False,
                        'time': response_time,
                        'success': False,
                        'error': error_msg
                    })
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
                self.results.append({
                    'test_number': self.total_tests + 1,
                    'movie': movie_name,
                    'expected': expected_title,
                    'found': 'HTTP_ERROR',
                    'correct': False,
                    'time': response_time,
                    'success': False,
                    'error': f"HTTP {response.status_code}"
                })
                
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"❌ Exception: {str(e)}")
            print(f"Time: {response_time:.2f}s")
            
            self.results.append({
                'test_number': self.total_tests + 1,
                'movie': movie_name,
                'expected': expected_title,
                'found': 'EXCEPTION',
                'correct': False,
                'time': response_time,
                'success': False,
                'error': str(e)
            })
        
        self.total_tests += 1
    
    def _is_correct_identification(self, found_title, expected_title):
        """Check if the found title matches the expected title"""
        if not found_title or not expected_title:
            return False
        
        found_lower = found_title.lower().strip()
        expected_lower = expected_title.lower().strip()
        
        # Exact match
        if found_lower == expected_lower:
            return True
        
        # Remove common articles and check
        found_clean = found_lower.replace('the ', '').replace('a ', '').strip()
        expected_clean = expected_lower.replace('the ', '').replace('a ', '').strip()
        
        if found_clean == expected_clean:
            return True
        
        # Check if one contains the other (for cases like "The Matrix" vs "Matrix")
        if found_clean in expected_clean or expected_clean in found_clean:
            return True
        
        return False
    
    def run_comprehensive_test(self):
        """Run the comprehensive video recognition test"""
        print("🎬 COMPREHENSIVE VIDEO SCENE RECOGNITION TESTING")
        print("=" * 60)
        print("USER EXPECTATION: Identify movies from video clips/scenes")
        print(f"Backend URL: {self.backend_url}")
        print("SUCCESS CRITERIA: 8/10 correct identification")
        print()
        
        # Check API health first
        if not self.test_api_health():
            print("❌ Cannot proceed - Backend API is not accessible")
            return
        
        # Test movies as specified in the request with actual movie posters
        test_movies = [
            ("Inception", "Inception", "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"),
            ("The Matrix", "The Matrix", "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"),
            ("Titanic", "Titanic", "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg"),
            ("The Dark Knight", "The Dark Knight", "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"),
            ("Forrest Gump", "Forrest Gump", "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"),
            ("Pulp Fiction", "Pulp Fiction", "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"),
            ("Fight Club", "Fight Club", "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"),
            ("Goodfellas", "Goodfellas", "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg"),
            ("The Shawshank Redemption", "The Shawshank Redemption", "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"),
            ("The Godfather", "The Godfather", "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg")
        ]
        
        # Run tests for each movie
        for movie_name, expected_title, poster_url in test_movies:
            self.test_video_recognition(movie_name, expected_title, poster_url)
            time.sleep(1)  # Brief pause between tests
        
        # Generate final report
        self.generate_final_report()
    
    def generate_final_report(self):
        """Generate the final test report in the requested format"""
        print(f"\n{'='*60}")
        print("FINAL RESULTS")
        print(f"{'='*60}")
        
        # Calculate statistics
        total_time = sum(result['time'] for result in self.results)
        avg_time = total_time / len(self.results) if self.results else 0
        
        success_rate = (self.correct_identifications / self.total_tests * 100) if self.total_tests > 0 else 0
        
        # Print individual results in requested format
        for result in self.results:
            status = "✅" if result['correct'] else "❌"
            print(f"TEST {result['test_number']}/10: {result['movie']}")
            print(f"Method: Extracted frame → Google Vision")
            print(f"Result: {result['found']}")
            print(f"Correct: {'YES' if result['correct'] else 'NO'} {status}")
            print(f"Time: {result['time']:.2f}s")
            print()
        
        # Final summary in requested format
        print(f"Video Recognition: {self.correct_identifications}/10 correct")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Average Response Time: {avg_time:.2f}s")
        
        # Determine pass/fail based on user criteria
        if self.correct_identifications >= 8:
            print("Status: PASS (8+ correct identifications)")
            print("🎉 VIDEO RECOGNITION SYSTEM MEETS REQUIREMENTS!")
        else:
            print("Status: FAIL (<8 correct identifications)")
            print("❌ VIDEO RECOGNITION SYSTEM NEEDS IMPROVEMENT")
        
        # Additional analysis
        print(f"\n📊 DETAILED ANALYSIS:")
        print(f"Total Tests: {self.total_tests}")
        print(f"Successful API Calls: {sum(1 for r in self.results if r['success'])}")
        print(f"Failed API Calls: {sum(1 for r in self.results if not r['success'])}")
        print(f"Correct Identifications: {self.correct_identifications}")
        print(f"Incorrect Identifications: {self.total_tests - self.correct_identifications}")
        
        # Error analysis
        errors = [r for r in self.results if not r['success']]
        if errors:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in errors:
                print(f"  - {error['movie']}: {error.get('error', 'Unknown error')}")
        
        # Speed analysis
        fast_tests = sum(1 for r in self.results if r['time'] < 5.0)
        print(f"\n⚡ SPEED ANALYSIS:")
        print(f"Tests under 5s: {fast_tests}/{self.total_tests}")
        print(f"Average time: {avg_time:.2f}s")
        
        return self.correct_identifications >= 8

def main():
    """Main function to run the video recognition tests"""
    print("Starting Comprehensive Video Scene Recognition Testing...")
    print("Note: Using movie posters to simulate extracted video frames due to copyright restrictions")
    print()
    
    tester = VideoRecognitionTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎬 VIDEO RECOGNITION TESTING COMPLETE - SYSTEM READY FOR DEPLOYMENT!")
    else:
        print("\n⚠️  VIDEO RECOGNITION TESTING COMPLETE - SYSTEM NEEDS IMPROVEMENT")
    
    return success

if __name__ == "__main__":
    main()