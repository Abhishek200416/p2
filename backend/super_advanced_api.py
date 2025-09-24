from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
import os
import shutil
from pathlib import Path
from datetime import datetime
import json
import asyncio
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

# Initialize security
security = HTTPBearer()

# Create router for super advanced features
super_router = APIRouter(prefix="/api/super")

# Ensure upload directories exist
UPLOAD_DIR = Path("/app/uploads")
VIDEO_DIR = UPLOAD_DIR / "videos"
IMAGE_DIR = UPLOAD_DIR / "images"
for dir_path in [UPLOAD_DIR, VIDEO_DIR, IMAGE_DIR]:
    dir_path.mkdir(exist_ok=True, parents=True)

# Pydantic Models
class VideoUploadResponse(BaseModel):
    id: str
    filename: str
    url: str
    size: int
    duration: Optional[float] = None
    thumbnail: Optional[str] = None

class AIContentRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    type: str = "text"  # text, image_suggestion, layout_recommendation
    element_type: Optional[str] = None

class AIResponse(BaseModel):
    content: str
    suggestions: Optional[List[str]] = None
    confidence: float = 1.0

class LayoutSuggestion(BaseModel):
    layout_type: str
    elements: List[Dict[str, Any]]
    reasoning: str

class CodeGenerationRequest(BaseModel):
    description: str
    element_type: str
    current_styles: Optional[Dict[str, Any]] = None

class DimensionUpdate(BaseModel):
    element_id: str
    x: float
    y: float
    width: float
    height: float
    rotation: Optional[float] = 0

class ElementStyleUpdate(BaseModel):
    element_id: str
    styles: Dict[str, Any]

# AI Chat Session Management
ai_sessions = {}

def get_ai_chat(session_id: str = "default"):
    """Get or create AI chat session"""
    if session_id not in ai_sessions:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        ai_sessions[session_id] = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="""You are an advanced AI assistant specialized in web development and design. 
            You help users create, edit, and improve websites with intelligent suggestions. 
            You can generate CSS, HTML, content, and provide layout recommendations. 
            Always provide practical, actionable suggestions."""
        ).with_model("gemini", "gemini-2.0-flash")
    return ai_sessions[session_id]

# Video Management Endpoints
@super_router.post("/video/upload", response_model=VideoUploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Upload a video file with advanced processing"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        filename = f"{file_id}{file_extension}"
        file_path = VIDEO_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = file_path.stat().st_size
        
        # Generate video URL (relative to serve from backend)
        video_url = f"/api/super/video/serve/{filename}"
        
        return VideoUploadResponse(
            id=file_id,
            filename=filename,
            url=video_url,
            size=file_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@super_router.get("/video/serve/{filename}")
async def serve_video(filename: str):
    """Serve uploaded video files"""
    from fastapi.responses import FileResponse
    
    file_path = VIDEO_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@super_router.delete("/video/{video_id}")
async def delete_video(video_id: str):
    """Delete a video file"""
    try:
        # Find and delete video file
        for video_file in VIDEO_DIR.glob(f"{video_id}.*"):
            video_file.unlink()
            return {"message": "Video deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Video not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@super_router.get("/video/list")
async def list_videos():
    """List all uploaded videos"""
    try:
        videos = []
        for video_file in VIDEO_DIR.glob("*.*"):
            if video_file.is_file():
                file_id = video_file.stem
                videos.append({
                    "id": file_id,
                    "filename": video_file.name,
                    "url": f"/api/super/video/serve/{video_file.name}",
                    "size": video_file.stat().st_size,
                    "created": datetime.fromtimestamp(video_file.stat().st_ctime).isoformat()
                })
        
        return {"videos": videos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"List failed: {str(e)}")

# AI-Powered Content Generation
@super_router.post("/ai/generate-content", response_model=AIResponse)
async def generate_content(request: AIContentRequest):
    """Generate AI-powered content suggestions"""
    try:
        ai_chat = get_ai_chat("content_generation")
        
        # Customize prompt based on content type
        if request.type == "text":
            prompt = f"""Generate engaging, professional content for: {request.prompt}
            Context: {request.context or 'Website content'}
            
            Provide clean, web-ready content without markdown formatting."""
            
        elif request.type == "image_suggestion":
            prompt = f"""Suggest 3 professional image concepts for: {request.prompt}
            Context: {request.context or 'Website imagery'}
            
            Provide specific, actionable image suggestions that would work well for web design."""
            
        elif request.type == "layout_recommendation":
            prompt = f"""Recommend a modern, professional layout structure for: {request.prompt}
            Context: {request.context or 'Website section'}
            
            Provide specific layout suggestions with modern design principles."""
        
        else:
            prompt = request.prompt
        
        # Get AI response
        user_message = UserMessage(text=prompt)
        response = await ai_chat.send_message(user_message)
        
        return AIResponse(
            content=response,
            confidence=0.9
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@super_router.post("/ai/improve-content")
async def improve_content(request: AIContentRequest):
    """Improve existing content with AI suggestions"""
    try:
        ai_chat = get_ai_chat("content_improvement")
        
        prompt = f"""Improve this content: {request.prompt}
        
        Make it more engaging, professional, and web-optimized. 
        Maintain the original intent but enhance clarity, flow, and impact.
        Provide the improved version without explanation unless specifically asked."""
        
        user_message = UserMessage(text=prompt)
        response = await ai_chat.send_message(user_message)
        
        return {"improved_content": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content improvement failed: {str(e)}")

@super_router.post("/ai/generate-css")
async def generate_css(request: CodeGenerationRequest):
    """Generate CSS code based on description"""
    try:
        ai_chat = get_ai_chat("css_generation")
        
        current_styles_text = ""
        if request.current_styles:
            current_styles_text = f"Current styles: {json.dumps(request.current_styles, indent=2)}"
        
        prompt = f"""Generate modern, responsive CSS for: {request.description}
        Element type: {request.element_type}
        {current_styles_text}
        
        Provide clean, modern CSS using best practices. Include hover effects and transitions where appropriate.
        Return only the CSS code without explanation."""
        
        user_message = UserMessage(text=prompt)
        response = await ai_chat.send_message(user_message)
        
        return {"css_code": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSS generation failed: {str(e)}")

# Advanced Layout Management
@super_router.post("/layout/suggest")
async def suggest_layout(request: AIContentRequest):
    """AI-powered layout suggestions"""
    try:
        ai_chat = get_ai_chat("layout_suggestions")
        
        prompt = f"""Analyze this content and suggest an optimal layout: {request.prompt}
        Context: {request.context or 'Modern website'}
        
        Suggest:
        1. Overall layout structure
        2. Element positioning
        3. Visual hierarchy
        4. Responsive considerations
        5. User experience improvements
        
        Provide practical, implementable suggestions."""
        
        user_message = UserMessage(text=prompt)
        response = await ai_chat.send_message(user_message)
        
        return {"layout_suggestions": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Layout suggestion failed: {str(e)}")

# Real-time Dimension Tracking
@super_router.post("/dimensions/update")
async def update_dimensions(update: DimensionUpdate):
    """Update element dimensions in real-time"""
    try:
        # Store dimension updates (in production, you'd save to database)
        dimension_data = {
            "element_id": update.element_id,
            "x": update.x,
            "y": update.y,
            "width": update.width,
            "height": update.height,
            "rotation": update.rotation,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Here you would typically save to database
        # For now, return confirmation
        return {
            "status": "updated",
            "element_id": update.element_id,
            "dimensions": dimension_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dimension update failed: {str(e)}")

@super_router.post("/styles/update")
async def update_element_styles(update: ElementStyleUpdate):
    """Update element styles with AI optimization"""
    try:
        # Process style updates
        processed_styles = update.styles
        
        # Optional: AI-enhance the styles
        if len(update.styles) > 3:  # Only for complex style updates
            ai_chat = get_ai_chat("style_optimization")
            
            prompt = f"""Optimize these CSS styles for better visual design:
            {json.dumps(update.styles, indent=2)}
            
            Improve the styles while maintaining the original intent. 
            Add complementary properties for better visual appeal.
            Return optimized CSS properties as JSON."""
            
            try:
                user_message = UserMessage(text=prompt)
                ai_response = await ai_chat.send_message(user_message)
                # Parse AI response if it returns valid JSON
                # For now, use original styles
            except:
                pass  # Fall back to original styles
        
        return {
            "status": "updated",
            "element_id": update.element_id,
            "styles": processed_styles
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Style update failed: {str(e)}")

# Image Management
@super_router.post("/image/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        filename = f"{file_id}{file_extension}"
        file_path = IMAGE_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = file_path.stat().st_size
        
        # Generate image URL
        image_url = f"/api/super/image/serve/{filename}"
        
        return {
            "id": file_id,
            "filename": filename,
            "url": image_url,
            "size": file_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@super_router.get("/image/serve/{filename}")
async def serve_image(filename: str):
    """Serve uploaded image files"""
    from fastapi.responses import FileResponse
    
    file_path = IMAGE_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",  # Will be auto-detected
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@super_router.delete("/image/{image_id}")
async def delete_image(image_id: str):
    """Delete an image file"""
    try:
        # Find and delete image file
        for image_file in IMAGE_DIR.glob(f"{image_id}.*"):
            image_file.unlink()
            return {"message": "Image deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

# Advanced Analytics
@super_router.get("/analytics/advanced")
async def get_advanced_analytics():
    """Get advanced analytics for the website editor"""
    try:
        # Count uploaded media
        video_count = len(list(VIDEO_DIR.glob("*.*")))
        image_count = len(list(IMAGE_DIR.glob("*.*")))
        
        # Calculate storage usage
        video_size = sum(f.stat().st_size for f in VIDEO_DIR.glob("*.*") if f.is_file())
        image_size = sum(f.stat().st_size for f in IMAGE_DIR.glob("*.*") if f.is_file())
        
        return {
            "media": {
                "videos": video_count,
                "images": image_count,
                "total_size_mb": round((video_size + image_size) / (1024 * 1024), 2)
            },
            "ai_sessions": len(ai_sessions),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

# Health check for super features
@super_router.get("/health")
async def super_health_check():
    """Health check for super advanced features"""
    try:
        # Test AI connection
        ai_available = False
        try:
            test_chat = get_ai_chat("health_check")
            test_message = UserMessage(text="Hello, are you working?")
            await test_chat.send_message(test_message)
            ai_available = True
        except:
            pass
        
        return {
            "status": "healthy",
            "features": {
                "video_upload": VIDEO_DIR.exists(),
                "image_upload": IMAGE_DIR.exists(),
                "ai_integration": ai_available
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}