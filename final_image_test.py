#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE IMAGE RECOGNITION TESTING
USER REQUEST: Test image recognition with 10 different movie posters
SUCCESS CRITERIA: 7+ correct identifications, <5s response time
"""

import requests
import time
import urllib.request

def test_comprehensive_image_recognition():
    """
    COMPREHENSIVE IMAGE RECOGNITION TESTING - USER PRIORITY REQUEST
    Test with 10 different movie posters/screenshots as specifically requested
    SUCCESS CRITERIA: 7+ correct identifications, <5s response time
    """
    print("🎯 COMPREHENSIVE IMAGE RECOGNITION TESTING - USER PRIORITY")
    print("📋 USER REQUEST: Test with 10 different movie posters/screenshots")
    print("🎯 SUCCESS CRITERIA: 7+ correct identifications, <5s response time")
    print("=" * 80)
    
    # 10 different movie posters - using smaller, more reliable URLs
    test_images = [
        {
            "name": "inception_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
            "expected": "Inception",
            "type": "Poster with clear title"
        },
        {
            "name": "matrix_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
            "expected": "The Matrix",
            "type": "Poster with clear title"
        },
        {
            "name": "titanic_poster.jpg", 
            "url": "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
            "expected": "Titanic",
            "type": "Poster with clear title"
        },
        {
            "name": "dark_knight_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
            "expected": "The Dark Knight",
            "type": "Poster with clear title"
        },
        {
            "name": "forrest_gump_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
            "expected": "Forrest Gump",
            "type": "Poster with clear title"
        },
        {
            "name": "pulp_fiction_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
            "expected": "Pulp Fiction",
            "type": "Poster with clear title"
        },
        {
            "name": "fight_club_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg",
            "expected": "Fight Club",
            "type": "Poster with clear title"
        },
        {
            "name": "goodfellas_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
            "expected": "Goodfellas",
            "type": "Poster with clear title"
        },
        {
            "name": "shawshank_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
            "expected": "The Shawshank Redemption",
            "type": "Poster with clear title"
        },
        {
            "name": "godfather_poster.jpg",
            "url": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
            "expected": "The Godfather",
            "type": "Poster with clear title"
        }
    ]
    
    results = []
    correct_count = 0
    total_tested = 0
    
    print(f"📥 Testing {len(test_images)} movie posters...")
    print()
    
    for i, img in enumerate(test_images, 1):
        print(f"🎬 TEST {i}/10: {img['name']}")
        print(f"Expected: {img['expected']}")
        print(f"Type: {img['type']}")
        
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
                    "detected_text": "Download failed",
                    "result": f"HTTP {img_response.status_code}",
                    "correct": "NO",
                    "score": 0,
                    "time": 0,
                    "error": f"Download failed: HTTP {img_response.status_code}"
                })
                total_tested += 1
                continue
            
            print(f"  ✅ Downloaded ({len(img_response.content)} bytes)")
            
            # Send to image recognition endpoint using multipart/form-data
            print("  🔍 Sending to recognition API...")
            files = {'file': (img['name'], img_response.content, 'image/jpeg')}
            
            response = requests.post(
                "https://bugfix-champs.preview.emergentagent.com/api/recognize-image",
                files=files,
                timeout=30  # Longer timeout for image processing
            )
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                detected_text = "Google Vision processed"
                result_movie = "None"
                correct = "NO"
                score = 0
                
                if data.get('success'):
                    movie = data.get('movie', {})
                    result_movie = movie.get('title', 'Unknown')
                    score = movie.get('popularity', 0)
                    
                    # Check if correct (flexible matching)
                    expected_lower = img['expected'].lower()
                    result_lower = result_movie.lower()
                    
                    # Flexible matching logic
                    if expected_lower in result_lower or result_lower in expected_lower:
                        correct = "YES"
                        correct_count += 1
                    elif "shawshank" in expected_lower and "shawshank" in result_lower:
                        correct = "YES"
                        correct_count += 1
                    elif "godfather" in expected_lower and "godfather" in result_lower:
                        correct = "YES"
                        correct_count += 1
                    elif "dark knight" in expected_lower and "dark knight" in result_lower:
                        correct = "YES"
                        correct_count += 1
                    elif "fight club" in expected_lower and "fight club" in result_lower:
                        correct = "YES"
                        correct_count += 1
                    elif "pulp fiction" in expected_lower and "pulp fiction" in result_lower:
                        correct = "YES"
                        correct_count += 1
                    
                    print(f"  🎯 RESULT: {result_movie}")
                    print(f"  ✅ Correct: {correct}")
                    print(f"  ⭐ Score: {score}")
                    print(f"  ⏱️  Time: {duration:.2f}s")
                    
                else:
                    result_movie = f"ERROR: {data.get('error', 'Unknown error')}"
                    print(f"  ❌ Recognition failed: {data.get('error', 'Unknown error')}")
                    print(f"  ⏱️  Time: {duration:.2f}s")
                
                results.append({
                    "image": img['name'],
                    "expected": img['expected'],
                    "detected_text": detected_text,
                    "result": result_movie,
                    "correct": correct,
                    "score": score,
                    "time": duration
                })
                
            else:
                print(f"  ❌ HTTP Error: {response.status_code}")
                results.append({
                    "image": img['name'],
                    "expected": img['expected'],
                    "detected_text": "HTTP Error",
                    "result": f"HTTP {response.status_code}",
                    "correct": "NO",
                    "score": 0,
                    "time": duration
                })
            
            total_tested += 1
            
        except Exception as e:
            duration = time.time() - start_time
            print(f"  ❌ Exception: {e}")
            results.append({
                "image": img['name'],
                "expected": img['expected'],
                "detected_text": "Exception",
                "result": f"ERROR: {str(e)}",
                "correct": "NO",
                "score": 0,
                "time": duration
            })
            total_tested += 1
        
        print()  # Add spacing between tests
        time.sleep(2)  # Brief pause between tests to avoid overwhelming the API
    
    # Generate comprehensive summary as requested
    print("=" * 80)
    print("📊 COMPREHENSIVE IMAGE RECOGNITION TEST RESULTS")
    print("=" * 80)
    
    # Detailed results for each image as requested
    print("\nDETAILED RESULTS:")
    for result in results:
        print(f"""
Image: {result['image']}
Expected: {result['expected']}
Detected Text: {result['detected_text']}
Result: {result['result']}
Correct: {result['correct']}
Score: {result['score']}
Time: {result['time']:.2f}s
""")
    
    # Final summary as requested
    wrong_count = sum(1 for r in results if r['correct'] == 'NO' and 'ERROR' not in r['result'])
    error_count = sum(1 for r in results if 'ERROR' in r['result'] or 'HTTP' in r['result'])
    pass_rate = (correct_count / total_tested * 100) if total_tested > 0 else 0
    
    print("FINAL SUMMARY:")
    print(f"Total Tested: {total_tested}")
    print(f"Correct: {correct_count}")
    print(f"Wrong: {wrong_count}")
    print(f"Errors: {error_count}")
    print(f"Pass Rate: {pass_rate:.1f}%")
    
    # Determine PASS/FAIL based on user criteria (7+ correct out of 10)
    if correct_count >= 7:
        status = "PASS"
        print(f"Status: ✅ {status}")
    else:
        status = "FAIL"
        print(f"Status: ❌ {status}")
    
    # Performance analysis
    successful_times = [r['time'] for r in results if 'ERROR' not in r['result']]
    if successful_times:
        avg_time = sum(successful_times) / len(successful_times)
        print(f"Average Response Time: {avg_time:.2f}s")
        if avg_time < 5.0:
            print("✅ Speed requirement met (< 5 seconds)")
        else:
            print("⚠️ Speed requirement not met (>= 5 seconds)")
    
    return {
        "total_tested": total_tested,
        "correct": correct_count,
        "wrong": wrong_count,
        "errors": error_count,
        "pass_rate": pass_rate,
        "status": status,
        "results": results
    }

if __name__ == "__main__":
    test_comprehensive_image_recognition()