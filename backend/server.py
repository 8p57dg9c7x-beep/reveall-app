from fastapi import FastAPI, APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
import base64
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Load API keys
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
AUDD_API_KEY = os.environ.get('AUDD_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
GOOGLE_VISION_API_KEY = os.environ.get('GOOGLE_VISION_API_KEY')

# Create the main app
app = FastAPI(title="CINESCAN API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Pydantic Models
class AudioRecognitionRequest(BaseModel):
    audio_base64: str

class ImageRecognitionRequest(BaseModel):
    image_base64: str

class VideoRecognitionRequest(BaseModel):
    video_base64: str

class SearchRequest(BaseModel):
    query: str

# Helper Functions
def search_tmdb_movie(query: str):
    """Search for a movie in TMDB database"""
    try:
        # Clean up the query - remove newlines and limit length
        clean_query = query.replace('\n', ' ').strip()
        
        # Limit query length to avoid TMDB API errors
        if len(clean_query) > 100:
            # Try to extract key words/title
            words = clean_query.split()
            # Look for common movie title patterns or just use first few words
            clean_query = ' '.join(words[:10])
        
        url = f"https://api.themoviedb.org/3/search/movie"
        params = {
            'api_key': TMDB_API_KEY,
            'query': clean_query,
            'language': 'en-US'
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('results') and len(data['results']) > 0:
            movie = data['results'][0]
            return get_movie_details(movie['id'])
        return None
    except Exception as e:
        logger.error(f"TMDB search error: {e}")
        return None

def get_movie_details(movie_id: int):
    """Get detailed movie information from TMDB"""
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        params = {
            'api_key': TMDB_API_KEY,
            'language': 'en-US',
            'append_to_response': 'credits'
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"TMDB details error: {e}")
        return None

def recognize_image_with_google_vision(image_content: bytes):
    """Use Google Vision API with WEB DETECTION for movie recognition"""
    try:
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        request_body = {
            "requests": [{
                "image": {"content": image_base64},
                "features": [
                    {"type": "WEB_DETECTION", "maxResults": 20},
                    {"type": "TEXT_DETECTION", "maxResults": 10}
                ]
            }]
        }
        
        response = requests.post(url, json=request_body, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        web_entities = []
        detected_texts = []
        best_guess_labels = []
        
        if 'responses' in result and len(result['responses']) > 0:
            response_data = result['responses'][0]
            
            # PRIORITY 1: Web entities (most accurate for movie posters)
            if 'webDetection' in response_data:
                web_data = response_data['webDetection']
                
                # Get best guess labels first
                if 'bestGuessLabels' in web_data:
                    for label in web_data['bestGuessLabels']:
                        if 'label' in label:
                            best_guess_labels.append(label['label'])
                
                # Get web entities
                if 'webEntities' in web_data:
                    for entity in web_data['webEntities']:
                        if 'description' in entity:
                            score = entity.get('score', 0)
                            web_entities.append({
                                'text': entity['description'],
                                'score': score
                            })
            
            # PRIORITY 2: Text detection (fallback)
            if 'textAnnotations' in response_data:
                for annotation in response_data['textAnnotations']:
                    detected_texts.append(annotation.get('description', ''))
        
        return {
            'web_entities': web_entities,
            'best_guess': best_guess_labels,
            'text': detected_texts
        }
    except Exception as e:
        logger.error(f"Google Vision error: {e}")
        return {'web_entities': [], 'best_guess': [], 'text': []}

def recognize_audio_with_audd(audio_base64: str):
    """Use AudD API to recognize audio"""
    try:
        if 'base64,' in audio_base64:
            audio_base64 = audio_base64.split('base64,')[1]
        
        url = "https://api.audd.io/"
        data = {
            'api_token': AUDD_API_KEY,
            'audio': audio_base64,
            'return': 'apple_music,spotify'
        }
        
        response = requests.post(url, data=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        if result.get('status') == 'success' and result.get('result'):
            song_info = result['result']
            search_query = f"{song_info.get('title', '')} {song_info.get('artist', '')}"
            return search_query
        
        return None
    except Exception as e:
        logger.error(f"AudD error: {e}")
        return None

# API Endpoints
@api_router.get("/")
async def root():
    return {
        "message": "CINESCAN API",
        "version": "1.0.0",
        "status": "running"
    }

@api_router.post("/recognize-image")
async def recognize_image(file: UploadFile = File(...)):
    """Recognize movie from an image using web detection"""
    try:
        logger.info(f"Received image: {file.filename}, content_type: {file.content_type}")
        
        # Read the uploaded file
        image_content = await file.read()
        logger.info(f"Image content size: {len(image_content)} bytes")
        
        vision_result = recognize_image_with_google_vision(image_content)
        web_entities = vision_result.get('web_entities', [])
        best_guess = vision_result.get('best_guess', [])
        detected_texts = vision_result.get('text', [])
        
        logger.info(f"Web entities: {web_entities[:5]}")
        logger.info(f"Best guess: {best_guess}")
        
        # STRATEGY 1: Try best guess labels first (most accurate for posters)
        if best_guess:
            for guess in best_guess[:3]:
                logger.info(f"Trying best guess: '{guess}'")
                movie = search_tmdb_movie(guess)
                if movie:
                    logger.info(f"✅ FOUND via best guess: '{movie.get('title')}'")
                    return {
                        "success": True,
                        "source": "Google Web Detection (Best Guess)",
                        "movie": movie
                    }
        
        # STRATEGY 2: Try web entities with SMART filtering
        if web_entities:
            # Collect all potential movie matches with scoring
            movie_candidates = []
            
            for entity in web_entities[:20]:
                query = entity['text']
                logger.info(f"Checking web entity: '{query}' (score: {entity['score']})")
                movie = search_tmdb_movie(query)
                
                if movie:
                    movie_title = movie.get('title', '')
                    query_lower = query.lower()
                    title_lower = movie_title.lower()
                    
                    # Calculate match score
                    match_score = 0
                    
                    # EXACT title match gets highest score
                    if query_lower == title_lower:
                        match_score = 1000
                        logger.info(f"  → EXACT match: '{movie_title}'")
                    # Query contains full title
                    elif title_lower in query_lower:
                        match_score = 500
                        logger.info(f"  → Query contains title: '{movie_title}'")
                    # Title contains full query
                    elif query_lower in title_lower:
                        match_score = 400
                        logger.info(f"  → Title contains query: '{movie_title}'")
                    # Partial match
                    else:
                        # Likely an actor/director name, give low score
                        match_score = entity['score']
                        logger.info(f"  → Weak match (likely actor): '{movie_title}'")
                    
                    movie_candidates.append({
                        'movie': movie,
                        'query': query,
                        'match_score': match_score,
                        'entity_score': entity['score']
                    })
            
            # Sort by match_score (prioritizes exact matches), then by entity_score
            if movie_candidates:
                movie_candidates.sort(key=lambda x: (x['match_score'], x['entity_score']), reverse=True)
                best_match = movie_candidates[0]
                
                logger.info(f"✅ BEST MATCH: '{best_match['movie'].get('title')}' (match_score: {best_match['match_score']}, entity_score: {best_match['entity_score']})")
                
                return {
                    "success": True,
                    "source": "Google Web Detection",
                    "movie": best_match['movie']
                }
        
        # STRATEGY 3: Fall back to text detection (old method)
        if detected_texts and len(detected_texts) > 0:
            logger.info("Falling back to text detection")
            
            # Get all text, extract words
            all_text = detected_texts[0] if detected_texts else ""
            words = all_text.replace('\n', ' ').split()
            
            # Skip common non-movie words
            skip_words = {'the', 'a', 'and', 'of', 'in', 'to', 'for', 'starring', 'presents', 'from', 'directed', 'by', 'pictures', 'films', 'entertainment', 'studios', 'production'}
            
            # Try 2-3 word combinations
            for i in range(min(20, len(words) - 1)):
                if words[i].lower() not in skip_words:
                    # Try 2-word combo
                    query = f"{words[i]} {words[i+1]}"
                    movie = search_tmdb_movie(query)
                    if movie:
                        logger.info(f"✅ FOUND via text: '{movie.get('title')}'")
                        return {
                            "success": True,
                            "source": "Text Detection",
                            "movie": movie
                        }
                    
                    # Try 3-word combo
                    if i < len(words) - 2:
                        query = f"{words[i]} {words[i+1]} {words[i+2]}"
                        movie = search_tmdb_movie(query)
                        if movie:
                            logger.info(f"✅ FOUND via text: '{movie.get('title')}'")
                            return {
                                "success": True,
                                "source": "Text Detection",
                                "movie": movie
                            }
        
        return {
            "success": False,
            "error": "Could not identify movie. Try a clearer poster image.",
            "movie": None
        }
        
    except Exception as e:
        logger.error(f"Image recognition error: {e}")
        return {
            "success": False,
            "error": str(e),
            "movie": None
        }

@api_router.post("/recognize-audio")
async def recognize_audio(file: UploadFile = File(...)):
    """Recognize movie from audio"""
    try:
        logger.info(f"Received audio: {file.filename}, content_type: {file.content_type}")
        
        # Read audio file and convert to base64
        audio_content = await file.read()
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        search_query = recognize_audio_with_audd(audio_base64)
        
        if not search_query:
            return {
                "success": False,
                "error": "Could not recognize audio",
                "movie": None
            }
        
        logger.info(f"Detected audio query: {search_query}")
        movie = search_tmdb_movie(search_query)
        
        if movie:
            logger.info(f"Found movie: {movie.get('title')}")
            return {
                "success": True,
                "source": "AudD + TMDB",
                "movie": movie
            }
        
        return {
            "success": False,
            "error": f"Could not find movie from audio",
            "movie": None
        }
        
    except Exception as e:
        logger.error(f"Audio recognition error: {e}")
        return {
            "success": False,
            "error": str(e),
            "movie": None
        }

@api_router.post("/recognize-video")
async def recognize_video(file: UploadFile = File(...)):
    """Recognize movie from video"""
    try:
        logger.info(f"Received video: {file.filename}, content_type: {file.content_type}")
        
        return {
            "success": False,
            "error": "Video recognition coming soon. Use image or audio instead.",
            "movie": None
        }
        
    except Exception as e:
        logger.error(f"Video recognition error: {e}")
        return {
            "success": False,
            "error": str(e),
            "movie": None
        }

@api_router.post("/search")
async def search_movie(request: SearchRequest):
    """Search for a movie by name"""
    try:
        logger.info(f"Searching for: {request.query}")
        
        movie = search_tmdb_movie(request.query)
        
        if movie:
            return {
                "success": True,
                "source": "TMDB Search",
                "movie": movie
            }
        
        return {
            "success": False,
            "error": f"Could not find movie: {request.query}",
            "movie": None
        }
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        return {
            "success": False,
            "error": str(e),
            "movie": None
        }

# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
