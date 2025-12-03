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
        url = f"https://api.themoviedb.org/3/search/movie"
        params = {
            'api_key': TMDB_API_KEY,
            'query': query,
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
async def recognize_image(request: ImageRecognitionRequest):
    """Recognize movie from an image"""
    try:
        logger.info("Received image recognition request")
        
        # Extract base64 data
        image_base64 = request.image_base64
        if 'base64,' in image_base64:
            image_base64 = image_base64.split('base64,')[1]
        
        # Decode base64 to bytes
        image_content = base64.b64decode(image_base64)
        logger.info(f"Image content size: {len(image_content)} bytes")
        
        detected_texts = recognize_image_with_google_vision(image_content)
        
        if not detected_texts:
            return {
                "success": False,
                "error": "Could not detect any text in the image",
                "movie": None
            }
        
        logger.info(f"Detected texts: {detected_texts[:10]}")
        
        # Try searching with longer text combinations first (more likely to be titles)
        # Sort by length descending - longer text more likely to be movie titles
        sorted_texts = sorted(detected_texts[:15], key=len, reverse=True)
        
        # Filter out very short text (likely just actor names or single words)
        filtered_texts = [text for text in sorted_texts if len(text.strip()) > 2]
        
        logger.info(f"Filtered and sorted texts: {filtered_texts[:10]}")
        
        for text in filtered_texts[:10]:
            movie = search_tmdb_movie(text)
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
async def recognize_audio(request: AudioRecognitionRequest):
    """Recognize movie from audio"""
    try:
        logger.info("Received audio recognition request")
        
        search_query = recognize_audio_with_audd(request.audio_base64)
        
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
async def recognize_video(request: VideoRecognitionRequest):
    """Recognize movie from video"""
    try:
        logger.info("Received video recognition request")
        
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
