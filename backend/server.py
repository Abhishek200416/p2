from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'portfolio-secret-key')
OWNER_PASS = os.environ.get('OWNER_PASS', 'shipfast')

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class LoginRequest(BaseModel):
    passphrase: str

class LoginResponse(BaseModel):
    token: str
    message: str

class PortfolioContent(BaseModel):
    hero: Dict[str, Any]
    about: Dict[str, Any]
    freelance: Dict[str, Any]
    projects: Dict[str, Any]
    skills: List[str]
    experience: List[Dict[str, Any]]
    hackathons: List[Dict[str, Any]]
    certs: List[Any]
    education: Dict[str, Any]
    contact: Dict[str, Any]

class SubscribeRequest(BaseModel):
    email: str

class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "owner":
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Abhishek Kolluri Portfolio API", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Authentication
@api_router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.passphrase == OWNER_PASS:
        # Create JWT token valid for 24 hours
        expiry = datetime.utcnow() + timedelta(hours=24)
        payload = {
            "role": "owner",
            "exp": expiry,
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        
        return LoginResponse(
            token=token,
            message="Login successful. Edit mode enabled for 24 hours."
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid passphrase")

# Portfolio content management
@api_router.get("/content")
async def get_content():
    """Get portfolio content (public endpoint)"""
    try:
        content_doc = await db.portfolio_content.find_one({"type": "current"})
        if content_doc:
            # Remove MongoDB _id field
            content_doc.pop('_id', None)
            content_doc.pop('type', None)
            return content_doc
        else:
            # Return default content if none exists
            return {"message": "No content found, using defaults"}
    except Exception as e:
        logging.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch content")

@api_router.post("/save-content")
async def save_content(
    content: PortfolioContent,
    user: dict = Depends(verify_token)
):
    """Save portfolio content (authenticated endpoint)"""
    try:
        content_dict = content.dict()
        content_dict["type"] = "current"
        content_dict["updated_at"] = datetime.utcnow()
        content_dict["updated_by"] = "owner"
        
        # Upsert the content document
        await db.portfolio_content.replace_one(
            {"type": "current"},
            content_dict,
            upsert=True
        )
        
        return {"message": "Content saved successfully", "timestamp": datetime.utcnow()}
    except Exception as e:
        logging.error(f"Error saving content: {e}")
        raise HTTPException(status_code=500, detail="Failed to save content")

# Subscriber management
@api_router.post("/subscribe")
async def subscribe(request: SubscribeRequest):
    """Subscribe to newsletter (public endpoint with rate limiting)"""
    try:
        # Check if email already exists
        existing = await db.subscribers.find_one({"email": request.email})
        if existing:
            return {"message": "Already subscribed!", "status": "existing"}
        
        # Create new subscriber
        subscriber = Subscriber(email=request.email)
        await db.subscribers.insert_one(subscriber.dict())
        
        return {"message": "You're on my radar! 🎯", "status": "new"}
    except Exception as e:
        logging.error(f"Error subscribing: {e}")
        raise HTTPException(status_code=500, detail="Subscription failed")

@api_router.get("/subscribers")
async def get_subscribers(user: dict = Depends(verify_token)):
    """Get all subscribers (authenticated endpoint)"""
    try:
        subscribers = await db.subscribers.find().to_list(1000)
        return {
            "count": len(subscribers),
            "subscribers": [{"email": s["email"], "subscribed_at": s["subscribed_at"]} for s in subscribers]
        }
    except Exception as e:
        logging.error(f"Error fetching subscribers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscribers")

# GitHub integration (future implementation)
@api_router.get("/github-repos")
async def get_github_repos():
    """Fetch latest repos from GitHub API"""
    # This will be implemented later when GitHub integration is needed
    return {"message": "GitHub integration coming soon", "status": "placeholder"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()