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
    """Use Google Vision API to detect text in images"""
    try:
        url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        request_body = {
            "requests": [{
                "image": {"content": image_base64},
                "features": [
                    {"type": "TEXT_DETECTION", "maxResults": 10},
                    {"type": "WEB_DETECTION", "maxResults": 10}
                ]
            }]
        }
        
        response = requests.post(url, json=request_body, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        detected_texts = []
        if 'responses' in result and len(result['responses']) > 0:
            response_data = result['responses'][0]
            
            if 'textAnnotations' in response_data:
                for annotation in response_data['textAnnotations']:
                    detected_texts.append(annotation.get('description', ''))
            
            if 'webDetection' in response_data:
                web_entities = response_data['webDetection'].get('webEntities', [])
                for entity in web_entities:
                    if 'description' in entity:
                        detected_texts.append(entity['description'])
        
        return detected_texts
    except Exception as e:
        logger.error(f"Google Vision error: {e}")
        return []

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
    """Recognize movie from an image"""
    try:
        logger.info(f"Received image: {file.filename}, content_type: {file.content_type}")
        
        # Read the uploaded file
        image_content = await file.read()
        logger.info(f"Image content size: {len(image_content)} bytes")
        
        detected_texts = recognize_image_with_google_vision(image_content)
        
        if not detected_texts:
            return {
                "success": False,
                "error": "Could not detect any text in the image",
                "movie": None
            }
        
        logger.info(f"Detected texts: {detected_texts[:10]}")
        
        # Extract individual words from all detected texts
        all_words = []
        for text in detected_texts[:20]:
            words = text.replace('\n', ' ').split()
            all_words.extend(words)
        
        # Remove duplicates while preserving order
        unique_words = []
        seen = set()
        for word in all_words:
            word_lower = word.lower()
            if word_lower not in seen and len(word) > 2:
                seen.add(word_lower)
                unique_words.append(word)
        
        logger.info(f"Extracted unique words: {unique_words[:20]}")
        
        # Try combinations of 1-3 consecutive words
        search_queries = []
        
        # Add individual words first
        search_queries.extend(unique_words[:15])
        
        # Add 2-word combinations
        for i in range(min(10, len(unique_words) - 1)):
            search_queries.append(f"{unique_words[i]} {unique_words[i+1]}")
        
        # Add 3-word combinations
        for i in range(min(8, len(unique_words) - 2)):
            search_queries.append(f"{unique_words[i]} {unique_words[i+1]} {unique_words[i+2]}")
        
        logger.info(f"Search queries: {search_queries[:15]}")
        
        for query in search_queries[:20]:
            movie = search_tmdb_movie(query)
            if movie:
                logger.info(f"Found movie: {movie.get('title')}")
                return {
                    "success": True,
                    "source": "Vision API + TMDB",
                    "movie": movie
                }
        
        return {
            "success": False,
            "error": f"Could not find movie from detected text. Try a clearer image with the movie title visible.",
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
