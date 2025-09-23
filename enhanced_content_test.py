#!/usr/bin/env python3
"""
Enhanced Portfolio Content Structure Test
Tests the backend's ability to handle enhanced content structure with GitHub integration,
professional images, certificates, and advanced features.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001/api"
PASSPHRASE = "shipfast"

def test_enhanced_content_structure():
    """Test backend with enhanced content structure"""
    print("🧪 Testing Enhanced Content Structure")
    print("=" * 50)
    
    # First, get authentication token
    login_response = requests.post(f"{BASE_URL}/login", json={"passphrase": PASSPHRASE})
    if login_response.status_code != 200:
        print("❌ Failed to authenticate")
        return False
    
    token = login_response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Enhanced content structure with new features
    enhanced_content = {
        "hero": {
            "name": "Abhishek Kolluri",
            "title": "Full Stack Developer & AI Enthusiast",
            "description": "Building the future with code, one shipfast project at a time",
            "tagline": "Ship Fast, Build Better",
            "background_animation": "particles",
            "cta_buttons": [
                {"text": "View Projects", "link": "#projects"},
                {"text": "Contact Me", "link": "#contact"}
            ]
        },
        "about": {
            "description": "Passionate full-stack developer with expertise in modern web technologies and AI integration",
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            "skills_highlight": ["React", "FastAPI", "AI/ML", "Cloud Architecture"],
            "philosophy": "Ship fast, iterate faster, build better"
        },
        "freelance": {
            "available": True,
            "rate": "$75/hour",
            "specialties": ["Full Stack Development", "AI Integration", "MVP Development"],
            "response_time": "24 hours",
            "min_project_size": "$2000"
        },
        "projects": {
            "featured": [
                {
                    "id": "portfolio-2024",
                    "name": "Enhanced Portfolio",
                    "description": "Modern portfolio with GitHub integration and PWA support",
                    "tech": ["React", "FastAPI", "MongoDB", "PWA"],
                    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                    "github_url": "https://github.com/abhishek/portfolio",
                    "live_url": "https://abhishek-portfolio.com",
                    "status": "completed",
                    "year": 2024,
                    "category": "web-development"
                },
                {
                    "id": "ai-chatbot",
                    "name": "AI Customer Support Bot",
                    "description": "Intelligent chatbot with natural language processing",
                    "tech": ["Python", "OpenAI", "FastAPI", "React"],
                    "image": "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600",
                    "github_url": "https://github.com/abhishek/ai-chatbot",
                    "status": "completed",
                    "year": 2024,
                    "category": "ai-ml"
                }
            ],
            "github_integration": {
                "enabled": True,
                "username": "abhishek-kolluri",
                "auto_sync": True,
                "last_sync": "2024-01-15T10:30:00Z",
                "featured_repos": ["portfolio", "ai-chatbot", "shipfast-template"]
            }
        },
        "skills": [
            "JavaScript", "Python", "React", "FastAPI", "Node.js", 
            "MongoDB", "PostgreSQL", "AWS", "Docker", "AI/ML", "OpenAI"
        ],
        "experience": [
            {
                "id": "senior-dev-2024",
                "company": "TechCorp Solutions",
                "position": "Senior Full Stack Developer",
                "duration": "2022 - Present",
                "description": "Led development of enterprise web applications and AI integrations",
                "achievements": [
                    "Reduced deployment time by 60% using CI/CD pipelines",
                    "Built AI-powered analytics dashboard serving 10k+ users",
                    "Mentored 5 junior developers"
                ],
                "tech": ["React", "Python", "AWS", "Docker"]
            }
        ],
        "hackathons": [
            {
                "id": "ai-hack-2024",
                "name": "AI Innovation Hackathon 2024",
                "position": "1st Place",
                "project": "ShipFast AI Assistant",
                "description": "AI-powered development assistant for rapid prototyping",
                "tech": ["OpenAI", "React", "FastAPI"],
                "date": "2024-01-10",
                "prize": "$10,000"
            }
        ],
        "certs": [
            {
                "id": "aws-certified-2024",
                "name": "AWS Certified Solutions Architect",
                "issuer": "Amazon Web Services",
                "date": "2024-01-01",
                "image": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
                "credential_url": "https://aws.amazon.com/certification/verify/ABC123",
                "skills": ["Cloud Architecture", "AWS Services", "DevOps"]
            },
            {
                "id": "openai-certified-2024",
                "name": "OpenAI API Specialist",
                "issuer": "OpenAI",
                "date": "2023-12-15",
                "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
                "skills": ["AI Integration", "Prompt Engineering", "GPT Models"]
            }
        ],
        "education": {
            "degree": "Bachelor of Technology in Computer Science",
            "university": "Indian Institute of Technology",
            "year": "2020",
            "gpa": "8.5/10",
            "relevant_courses": ["Data Structures", "Machine Learning", "Web Development"]
        },
        "contact": {
            "email": "abhishek.kolluri@example.com",
            "linkedin": "https://linkedin.com/in/abhishek-kolluri",
            "github": "https://github.com/abhishek-kolluri",
            "twitter": "https://twitter.com/abhishek_dev",
            "location": "Hyderabad, India",
            "timezone": "IST (UTC+5:30)",
            "preferred_contact": "email"
        },
        "feedback_form": {
            "enabled": True,
            "fields": ["name", "email", "message", "project_type"],
            "notification_email": "abhishek.kolluri@example.com"
        },
        "pwa_config": {
            "enabled": True,
            "app_name": "Abhishek Kolluri Portfolio",
            "theme_color": "#8B5CF6",
            "background_color": "#1F2937",
            "display": "standalone"
        },
        "analytics": {
            "google_analytics": "GA-XXXXXXXXX",
            "track_events": ["project_view", "contact_form", "resume_download"]
        }
    }
    
    try:
        # Test saving enhanced content
        save_response = requests.post(f"{BASE_URL}/save-content", json=enhanced_content, headers=headers)
        
        if save_response.status_code == 200:
            print("✅ Enhanced content saved successfully")
            
            # Test retrieving enhanced content
            get_response = requests.get(f"{BASE_URL}/content")
            
            if get_response.status_code == 200:
                retrieved_content = get_response.json()
                
                # Verify key enhanced features
                checks = [
                    ("GitHub Integration", "projects" in retrieved_content and "github_integration" in retrieved_content.get("projects", {})),
                    ("Professional Images", "image" in retrieved_content.get("about", {}) and len(retrieved_content.get("certs", [])) > 0),
                    ("Enhanced Projects", len(retrieved_content.get("projects", {}).get("featured", [])) > 0),
                    ("Certificate Images", any("image" in cert for cert in retrieved_content.get("certs", []))),
                    ("PWA Config", "pwa_config" in retrieved_content),
                    ("Feedback Form", "feedback_form" in retrieved_content),
                    ("Analytics Config", "analytics" in retrieved_content)
                ]
                
                all_passed = True
                for check_name, check_result in checks:
                    if check_result:
                        print(f"✅ {check_name}: Present")
                    else:
                        print(f"❌ {check_name}: Missing")
                        all_passed = False
                
                if all_passed:
                    print("\n🎉 All enhanced features successfully handled by backend!")
                    return True
                else:
                    print("\n⚠️  Some enhanced features may not be properly stored")
                    return False
            else:
                print(f"❌ Failed to retrieve content: HTTP {get_response.status_code}")
                return False
        else:
            print(f"❌ Failed to save enhanced content: HTTP {save_response.status_code}")
            print(f"Response: {save_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing enhanced content: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_enhanced_content_structure()
    exit(0 if success else 1)