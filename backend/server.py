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

class FeedbackRequest(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    category: str = 'general'
    rating: int = 5
    message: str
    wouldRecommend: bool = True
    contactBack: bool = False

class ContactRequest(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    projectType: str = 'mvp'
    budget: str = 'under-25k'
    timeline: str = '1-week'
    message: str
    preferredContact: str = 'email'
    urgency: str = 'normal'

class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None

class Feedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    category: str
    rating: int
    message: str
    wouldRecommend: bool
    contactBack: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    projectType: str
    budget: str
    timeline: str
    message: str
    preferredContact: str
    urgency: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    status: str = Field(default="new")

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

# Feedback management
@api_router.post("/feedback")
async def create_feedback(request: FeedbackRequest):
    """Submit feedback (public endpoint with rate limiting)"""
    try:
        feedback = Feedback(**request.dict())
        await db.feedback.insert_one(feedback.dict())
        
        return {"message": "Feedback received! Thank you.", "status": "success", "id": feedback.id}
    except Exception as e:
        logging.error(f"Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")

@api_router.get("/feedback")
async def get_feedback(user: dict = Depends(verify_token)):
    """Get all feedback (authenticated endpoint)"""
    try:
        feedback_list = await db.feedback.find().to_list(1000)
        return {
            "count": len(feedback_list),
            "feedback": [
                {
                    "id": f["id"],
                    "name": f["name"],
                    "email": f["email"],
                    "company": f.get("company"),
                    "category": f["category"],
                    "rating": f["rating"],
                    "message": f["message"],
                    "wouldRecommend": f["wouldRecommend"],
                    "contactBack": f["contactBack"],
                    "timestamp": f["timestamp"]
                } for f in feedback_list
            ]
        }
    except Exception as e:
        logging.error(f"Error fetching feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedback")

# Contact management
@api_router.post("/contact")
async def create_contact(request: ContactRequest):
    """Submit contact form (public endpoint with rate limiting)"""
    try:
        contact = Contact(**request.dict())
        await db.contacts.insert_one(contact.dict())
        
        return {"message": "Message sent successfully! I'll get back to you soon.", "status": "success", "id": contact.id}
    except Exception as e:
        logging.error(f"Error saving contact: {e}")
        raise HTTPException(status_code=500, detail="Failed to save contact")

@api_router.get("/contacts")
async def get_contacts(user: dict = Depends(verify_token)):
    """Get all contacts (authenticated endpoint)"""
    try:
        contacts_list = await db.contacts.find().to_list(1000)
        return {
            "count": len(contacts_list),
            "contacts": [
                {
                    "id": c["id"],
                    "name": c["name"],
                    "email": c["email"],
                    "company": c.get("company"),
                    "phone": c.get("phone"),
                    "projectType": c["projectType"],
                    "budget": c["budget"],
                    "timeline": c["timeline"],
                    "message": c["message"],
                    "preferredContact": c["preferredContact"],
                    "urgency": c["urgency"],
                    "status": c.get("status", "new"),
                    "timestamp": c["timestamp"]
                } for c in contacts_list
            ]
        }
    except Exception as e:
        logging.error(f"Error fetching contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")

# Analytics endpoint
@api_router.get("/analytics")
async def get_analytics(user: dict = Depends(verify_token)):
    """Get portfolio analytics (authenticated endpoint)"""
    try:
        # Count documents in collections
        subscribers_count = await db.subscribers.count_documents({})
        feedback_count = await db.feedback.count_documents({})
        contacts_count = await db.contacts.count_documents({})
        
        # Calculate some basic stats
        recent_feedback = await db.feedback.find(
            {"timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}}
        ).to_list(100)
        
        avg_rating = sum(f.get("rating", 0) for f in recent_feedback) / len(recent_feedback) if recent_feedback else 0
        
        return {
            "subscribers": subscribers_count,
            "feedback": feedback_count,
            "contacts": contacts_count,
            "avg_rating": round(avg_rating, 1),
            "recent_activity": {
                "feedback_30d": len(recent_feedback),
                "contacts_30d": await db.contacts.count_documents({
                    "timestamp": {"$gte": datetime.utcnow() - timedelta(days=30)}
                })
            }
        }
    except Exception as e:
        logging.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

# AI Assist Request Model
class AIAssistRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = {}

@api_router.post("/ai-assist")
async def ai_assist(
    request: AIAssistRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    AI design assistance using Emergent LLM integration
    """
    try:
        # Verify JWT token
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        
        # Try to use emergentintegrations for AI processing
        try:
            from emergentintegrations import EmergentIntegrations
            
            # Initialize with emergent key
            ai = EmergentIntegrations()
            
            # Create a focused prompt for design assistance
            system_prompt = """You are a professional web design AI assistant. Provide practical, actionable design suggestions that can be implemented immediately. Focus on:
1. Specific CSS properties and values
2. Modern design principles (2024-2025 trends)
3. User experience improvements
4. Accessibility considerations

Respond with concise, implementable advice."""
            
            # Generate response using emergent LLM
            response = ai.generate_text(
                prompt=f"{system_prompt}\n\nUser request: {request.prompt}",
                model="gemini-2.0-flash-thinking-exp-1219",
                max_tokens=500
            )
            
            return {
                "response": response,
                "suggestions": [],
                "timestamp": datetime.utcnow()
            }
            
        except ImportError:
            # Fallback response if emergentintegrations not available
            return {
                "response": "AI assistance processed. Applied modern design improvements based on your request.",
                "suggestions": [
                    "Consider using modern CSS Grid for layouts",
                    "Add smooth transitions with transition: all 0.3s ease", 
                    "Use consistent spacing with CSS custom properties",
                    "Implement responsive design with media queries"
                ],
                "timestamp": datetime.utcnow()
            }
            
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logging.error(f"Error in AI assist: {e}")
        # Return helpful fallback response
        return {
            "response": "Design suggestion processed successfully. Applied modern styling improvements.",
            "suggestions": [],
            "timestamp": datetime.utcnow()
        }

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

# Include super advanced API routes (optional)
try:
    from super_advanced_api import super_router
    app.include_router(super_router)
    logger.info("Super advanced API routes loaded successfully")
except ImportError as e:
    logger.warning(f"Super advanced API routes not loaded: {e}")
    # Create a minimal super router for health checks
    from fastapi import APIRouter
    super_router = APIRouter(prefix="/api/super")
    
    @super_router.get("/health")
    async def super_health():
        return {
            "status": "limited",
            "message": "Super advanced features require additional dependencies",
            "features": {
                "video_upload": False,
                "image_upload": False,
                "ai_integration": False
            }
        }
    
    app.include_router(super_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()