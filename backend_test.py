#!/usr/bin/env python3
"""
Portfolio Backend API Test Suite
Tests all backend functionality including authentication, content management, and subscriptions.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8001/api"
PASSPHRASE = "shipfast"

class PortfolioAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_root_endpoint(self):
        """Test GET /api/ root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Root Endpoint", True, "Root endpoint working correctly", 
                                {"response": data})
                else:
                    self.log_test("Root Endpoint", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
    
    def test_cors_headers(self):
        """Test CORS headers for frontend integration"""
        try:
            response = requests.options(f"{self.base_url}/", headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            })
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            }
            
            if cors_headers['access-control-allow-origin']:
                self.log_test("CORS Headers", True, "CORS headers present", 
                            {"headers": cors_headers})
            else:
                self.log_test("CORS Headers", False, "CORS headers missing", 
                            {"headers": cors_headers})
        except Exception as e:
            self.log_test("CORS Headers", False, f"Error testing CORS: {str(e)}")
    
    def test_login_valid_passphrase(self):
        """Test POST /api/login with valid passphrase"""
        try:
            payload = {"passphrase": PASSPHRASE}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "message" in data:
                    self.token = data["token"]
                    self.log_test("Login Valid Passphrase", True, "Login successful with valid passphrase", 
                                {"message": data["message"]})
                else:
                    self.log_test("Login Valid Passphrase", False, "Missing token or message in response", 
                                {"response": data})
            else:
                self.log_test("Login Valid Passphrase", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Login Valid Passphrase", False, f"Connection error: {str(e)}")
    
    def test_login_invalid_passphrase(self):
        """Test POST /api/login with invalid passphrase"""
        try:
            payload = {"passphrase": "wrongpassword"}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 401:
                self.log_test("Login Invalid Passphrase", True, "Correctly rejected invalid passphrase")
            else:
                self.log_test("Login Invalid Passphrase", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Login Invalid Passphrase", False, f"Connection error: {str(e)}")
    
    def test_jwt_token_validation(self):
        """Test JWT token validation on protected endpoints"""
        if not self.token:
            self.log_test("JWT Token Validation", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 200:
                self.log_test("JWT Token Validation", True, "Valid token accepted")
            else:
                self.log_test("JWT Token Validation", False, 
                            f"Valid token rejected with status {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Connection error: {str(e)}")
    
    def test_invalid_token(self):
        """Test protected endpoint with invalid token"""
        try:
            headers = {"Authorization": "Bearer invalid_token_here"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 401:
                self.log_test("Invalid Token Rejection", True, "Invalid token correctly rejected")
            else:
                self.log_test("Invalid Token Rejection", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Invalid Token Rejection", False, f"Connection error: {str(e)}")
    
    def test_get_content_public(self):
        """Test GET /api/content (public endpoint)"""
        try:
            response = requests.get(f"{self.base_url}/content")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get Content Public", True, "Content endpoint accessible", 
                            {"has_data": len(data) > 0})
            else:
                self.log_test("Get Content Public", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Content Public", False, f"Connection error: {str(e)}")
    
    def test_save_content_authenticated(self):
        """Test POST /api/save-content (authenticated endpoint)"""
        if not self.token:
            self.log_test("Save Content Authenticated", False, "No token available for testing")
            return
        
        try:
            # Sample portfolio content
            content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Full Stack Developer",
                    "description": "Building amazing web applications"
                },
                "about": {
                    "description": "Passionate developer with expertise in modern web technologies"
                },
                "freelance": {
                    "available": True,
                    "rate": "$50/hour"
                },
                "projects": {
                    "featured": [
                        {
                            "name": "Portfolio Website",
                            "description": "Personal portfolio built with React and FastAPI",
                            "tech": ["React", "FastAPI", "MongoDB"]
                        }
                    ]
                },
                "skills": ["Python", "JavaScript", "React", "FastAPI", "MongoDB"],
                "experience": [
                    {
                        "company": "Tech Corp",
                        "position": "Senior Developer",
                        "duration": "2022-2024",
                        "description": "Led development of web applications"
                    }
                ],
                "hackathons": [
                    {
                        "name": "TechHack 2024",
                        "position": "Winner",
                        "project": "AI-powered portfolio generator"
                    }
                ],
                "certs": [
                    "AWS Certified Developer",
                    "Google Cloud Professional"
                ],
                "education": {
                    "degree": "Computer Science",
                    "university": "Tech University",
                    "year": "2020"
                },
                "contact": {
                    "email": "abhishek@example.com",
                    "linkedin": "linkedin.com/in/abhishek",
                    "github": "github.com/abhishek"
                }
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Save Content Authenticated", True, "Content saved successfully", 
                            {"response": data})
            else:
                self.log_test("Save Content Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Save Content Authenticated", False, f"Connection error: {str(e)}")
    
    def test_save_content_unauthenticated(self):
        """Test POST /api/save-content without authentication"""
        try:
            content = {"hero": {"name": "Test"}}
            response = requests.post(f"{self.base_url}/save-content", json=content)
            
            if response.status_code == 403:
                self.log_test("Save Content Unauthenticated", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Save Content Unauthenticated", False, 
                            f"Expected 403, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Save Content Unauthenticated", False, f"Connection error: {str(e)}")
    
    def test_subscribe_valid_email(self):
        """Test POST /api/subscribe with valid email"""
        try:
            # Use timestamp to ensure unique email
            timestamp = int(time.time())
            email = f"john.doe.{timestamp}@example.com"
            payload = {"email": email}
            
            response = requests.post(f"{self.base_url}/subscribe", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Subscribe Valid Email", True, "Subscription successful", 
                                {"email": email, "response": data})
                else:
                    self.log_test("Subscribe Valid Email", False, "Missing expected fields", 
                                {"response": data})
            else:
                self.log_test("Subscribe Valid Email", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Subscribe Valid Email", False, f"Connection error: {str(e)}")
    
    def test_subscribe_duplicate_email(self):
        """Test POST /api/subscribe with duplicate email"""
        try:
            # Use a fixed email for duplicate testing
            email = "duplicate.test@example.com"
            payload = {"email": email}
            
            # First subscription
            response1 = requests.post(f"{self.base_url}/subscribe", json=payload)
            
            # Second subscription (duplicate)
            response2 = requests.post(f"{self.base_url}/subscribe", json=payload)
            
            if response2.status_code == 200:
                data = response2.json()
                if data.get("status") == "existing":
                    self.log_test("Subscribe Duplicate Email", True, "Duplicate email handled correctly", 
                                {"response": data})
                else:
                    self.log_test("Subscribe Duplicate Email", False, "Duplicate not detected", 
                                {"response": data})
            else:
                self.log_test("Subscribe Duplicate Email", False, f"HTTP {response2.status_code}", 
                            {"response": response2.text})
        except Exception as e:
            self.log_test("Subscribe Duplicate Email", False, f"Connection error: {str(e)}")
    
    def test_get_subscribers_authenticated(self):
        """Test GET /api/subscribers (authenticated)"""
        if not self.token:
            self.log_test("Get Subscribers Authenticated", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "count" in data and "subscribers" in data:
                    self.log_test("Get Subscribers Authenticated", True, 
                                f"Retrieved {data['count']} subscribers", 
                                {"count": data["count"]})
                else:
                    self.log_test("Get Subscribers Authenticated", False, "Missing expected fields", 
                                {"response": data})
            else:
                self.log_test("Get Subscribers Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Subscribers Authenticated", False, f"Connection error: {str(e)}")
    
    def test_get_subscribers_unauthenticated(self):
        """Test GET /api/subscribers without authentication"""
        try:
            response = requests.get(f"{self.base_url}/subscribers")
            
            if response.status_code == 403:
                self.log_test("Get Subscribers Unauthenticated", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test("Get Subscribers Unauthenticated", False, 
                            f"Expected 403, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Subscribers Unauthenticated", False, f"Connection error: {str(e)}")
    
    def test_content_persistence(self):
        """Test content persistence in MongoDB"""
        if not self.token:
            self.log_test("Content Persistence", False, "No token available for testing")
            return
        
        try:
            # Save content first
            test_content = {
                "hero": {"name": "Test User", "title": "Test Title"},
                "about": {"description": "Test description"},
                "freelance": {"available": False},
                "projects": {"featured": []},
                "skills": ["Testing"],
                "experience": [],
                "hackathons": [],
                "certs": [],
                "education": {"degree": "Test Degree"},
                "contact": {"email": "test@example.com"}
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Save content
            save_response = requests.post(f"{self.base_url}/save-content", json=test_content, headers=headers)
            
            if save_response.status_code != 200:
                self.log_test("Content Persistence", False, "Failed to save content for persistence test")
                return
            
            # Retrieve content
            get_response = requests.get(f"{self.base_url}/content")
            
            if get_response.status_code == 200:
                retrieved_content = get_response.json()
                if retrieved_content.get("hero", {}).get("name") == "Test User":
                    self.log_test("Content Persistence", True, "Content persisted correctly in MongoDB")
                else:
                    self.log_test("Content Persistence", False, "Retrieved content doesn't match saved content", 
                                {"saved": test_content["hero"], "retrieved": retrieved_content.get("hero", {})})
            else:
                self.log_test("Content Persistence", False, f"Failed to retrieve content: HTTP {get_response.status_code}")
                
        except Exception as e:
            self.log_test("Content Persistence", False, f"Connection error: {str(e)}")

    # NEW ENHANCED FEATURES TESTING
    
    def test_submit_feedback_general(self):
        """Test POST /api/feedback with general feedback"""
        try:
            timestamp = int(time.time())
            feedback_data = {
                "name": f"Sarah Johnson {timestamp}",
                "email": f"sarah.johnson.{timestamp}@techcorp.com",
                "company": "TechCorp Solutions",
                "category": "general",
                "rating": 5,
                "message": "Excellent portfolio! Very impressed with the clean design and comprehensive project showcase. The technical skills section is particularly well-organized.",
                "wouldRecommend": True,
                "contactBack": True
            }
            
            response = requests.post(f"{self.base_url}/feedback", json=feedback_data)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data and "id" in data:
                    self.log_test("Submit Feedback General", True, "General feedback submitted successfully", 
                                {"response": data, "feedback_id": data.get("id")})
                else:
                    self.log_test("Submit Feedback General", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Submit Feedback General", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Feedback General", False, f"Connection error: {str(e)}")

    def test_submit_feedback_project(self):
        """Test POST /api/feedback with project-specific feedback"""
        try:
            timestamp = int(time.time())
            feedback_data = {
                "name": f"Michael Chen {timestamp}",
                "email": f"michael.chen.{timestamp}@startup.io",
                "company": "StartupIO",
                "category": "project",
                "rating": 4,
                "message": "The e-commerce project caught my attention. Great use of React and FastAPI. Would love to discuss potential collaboration on similar projects.",
                "wouldRecommend": True,
                "contactBack": True
            }
            
            response = requests.post(f"{self.base_url}/feedback", json=feedback_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    self.log_test("Submit Feedback Project", True, "Project feedback submitted successfully", 
                                {"response": data})
                else:
                    self.log_test("Submit Feedback Project", False, "Unexpected response status", 
                                {"response": data})
            else:
                self.log_test("Submit Feedback Project", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Feedback Project", False, f"Connection error: {str(e)}")

    def test_submit_feedback_hiring(self):
        """Test POST /api/feedback with hiring-related feedback"""
        try:
            timestamp = int(time.time())
            feedback_data = {
                "name": f"Jennifer Rodriguez {timestamp}",
                "email": f"jennifer.rodriguez.{timestamp}@bigtech.com",
                "company": "BigTech Corp",
                "category": "hiring",
                "rating": 5,
                "message": "We're impressed with your full-stack capabilities. Your portfolio demonstrates strong technical skills and project management experience. We'd like to discuss potential opportunities.",
                "wouldRecommend": True,
                "contactBack": True
            }
            
            response = requests.post(f"{self.base_url}/feedback", json=feedback_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Submit Feedback Hiring", True, "Hiring feedback submitted successfully", 
                            {"response": data})
            else:
                self.log_test("Submit Feedback Hiring", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Feedback Hiring", False, f"Connection error: {str(e)}")

    def test_get_feedback_authenticated(self):
        """Test GET /api/feedback (authenticated)"""
        if not self.token:
            self.log_test("Get Feedback Authenticated", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/feedback", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "count" in data and "feedback" in data:
                    feedback_list = data["feedback"]
                    # Verify feedback structure
                    if feedback_list and len(feedback_list) > 0:
                        sample_feedback = feedback_list[0]
                        required_fields = ["id", "name", "email", "category", "rating", "message", "wouldRecommend", "contactBack", "timestamp"]
                        missing_fields = [field for field in required_fields if field not in sample_feedback]
                        
                        if not missing_fields:
                            self.log_test("Get Feedback Authenticated", True, 
                                        f"Retrieved {data['count']} feedback entries with correct structure", 
                                        {"count": data["count"], "sample_fields": list(sample_feedback.keys())})
                        else:
                            self.log_test("Get Feedback Authenticated", False, 
                                        f"Missing fields in feedback structure: {missing_fields}", 
                                        {"missing_fields": missing_fields})
                    else:
                        self.log_test("Get Feedback Authenticated", True, 
                                    "Feedback endpoint working, no feedback entries yet", 
                                    {"count": data["count"]})
                else:
                    self.log_test("Get Feedback Authenticated", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Get Feedback Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Feedback Authenticated", False, f"Connection error: {str(e)}")

    def test_submit_contact_mvp_project(self):
        """Test POST /api/contact with MVP project inquiry"""
        try:
            timestamp = int(time.time())
            contact_data = {
                "name": f"David Kim {timestamp}",
                "email": f"david.kim.{timestamp}@innovate.com",
                "company": "Innovate Solutions",
                "phone": "+1-555-0123",
                "projectType": "mvp",
                "budget": "25k-50k",
                "timeline": "2-months",
                "message": "We need to build an MVP for our fintech startup. Looking for a full-stack developer with React and Python experience. The project involves user authentication, payment processing, and dashboard analytics.",
                "preferredContact": "email",
                "urgency": "high"
            }
            
            response = requests.post(f"{self.base_url}/contact", json=contact_data)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data and "id" in data:
                    self.log_test("Submit Contact MVP Project", True, "MVP project inquiry submitted successfully", 
                                {"response": data, "contact_id": data.get("id")})
                else:
                    self.log_test("Submit Contact MVP Project", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Submit Contact MVP Project", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Contact MVP Project", False, f"Connection error: {str(e)}")

    def test_submit_contact_webapp_project(self):
        """Test POST /api/contact with web application project"""
        try:
            timestamp = int(time.time())
            contact_data = {
                "name": f"Lisa Wang {timestamp}",
                "email": f"lisa.wang.{timestamp}@ecommerce.co",
                "company": "E-Commerce Co",
                "phone": "+1-555-0456",
                "projectType": "webapp",
                "budget": "50k-100k",
                "timeline": "3-months",
                "message": "We need a comprehensive e-commerce platform with inventory management, order processing, and customer analytics. Looking for someone with experience in scalable web applications.",
                "preferredContact": "phone",
                "urgency": "normal"
            }
            
            response = requests.post(f"{self.base_url}/contact", json=contact_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Submit Contact WebApp Project", True, "Web application project inquiry submitted successfully", 
                            {"response": data})
            else:
                self.log_test("Submit Contact WebApp Project", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Contact WebApp Project", False, f"Connection error: {str(e)}")

    def test_submit_contact_ai_integration(self):
        """Test POST /api/contact with AI integration project"""
        try:
            timestamp = int(time.time())
            contact_data = {
                "name": f"Robert Taylor {timestamp}",
                "email": f"robert.taylor.{timestamp}@aitech.com",
                "company": "AI Tech Solutions",
                "projectType": "ai-integration",
                "budget": "100k+",
                "timeline": "6-months",
                "message": "We're looking to integrate AI capabilities into our existing platform. Need expertise in machine learning APIs, natural language processing, and data analytics integration.",
                "preferredContact": "email",
                "urgency": "low"
            }
            
            response = requests.post(f"{self.base_url}/contact", json=contact_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Submit Contact AI Integration", True, "AI integration project inquiry submitted successfully", 
                            {"response": data})
            else:
                self.log_test("Submit Contact AI Integration", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Submit Contact AI Integration", False, f"Connection error: {str(e)}")

    def test_get_contacts_authenticated(self):
        """Test GET /api/contacts (authenticated)"""
        if not self.token:
            self.log_test("Get Contacts Authenticated", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/contacts", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "count" in data and "contacts" in data:
                    contacts_list = data["contacts"]
                    # Verify contact structure
                    if contacts_list and len(contacts_list) > 0:
                        sample_contact = contacts_list[0]
                        required_fields = ["id", "name", "email", "projectType", "budget", "timeline", "message", "preferredContact", "urgency", "status", "timestamp"]
                        missing_fields = [field for field in required_fields if field not in sample_contact]
                        
                        if not missing_fields:
                            self.log_test("Get Contacts Authenticated", True, 
                                        f"Retrieved {data['count']} contact entries with correct structure", 
                                        {"count": data["count"], "sample_fields": list(sample_contact.keys())})
                        else:
                            self.log_test("Get Contacts Authenticated", False, 
                                        f"Missing fields in contact structure: {missing_fields}", 
                                        {"missing_fields": missing_fields})
                    else:
                        self.log_test("Get Contacts Authenticated", True, 
                                    "Contacts endpoint working, no contact entries yet", 
                                    {"count": data["count"]})
                else:
                    self.log_test("Get Contacts Authenticated", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Get Contacts Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Contacts Authenticated", False, f"Connection error: {str(e)}")

    def test_analytics_authenticated(self):
        """Test GET /api/analytics (authenticated)"""
        if not self.token:
            self.log_test("Analytics Authenticated", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/analytics", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["subscribers", "feedback", "contacts", "avg_rating", "recent_activity"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Verify recent_activity structure
                    recent_activity = data.get("recent_activity", {})
                    activity_fields = ["feedback_30d", "contacts_30d"]
                    missing_activity_fields = [field for field in activity_fields if field not in recent_activity]
                    
                    if not missing_activity_fields:
                        self.log_test("Analytics Authenticated", True, 
                                    "Analytics endpoint working with comprehensive data", 
                                    {
                                        "subscribers": data["subscribers"],
                                        "feedback": data["feedback"],
                                        "contacts": data["contacts"],
                                        "avg_rating": data["avg_rating"],
                                        "recent_activity": recent_activity
                                    })
                    else:
                        self.log_test("Analytics Authenticated", False, 
                                    f"Missing fields in recent_activity: {missing_activity_fields}", 
                                    {"missing_activity_fields": missing_activity_fields})
                else:
                    self.log_test("Analytics Authenticated", False, 
                                f"Missing fields in analytics response: {missing_fields}", 
                                {"missing_fields": missing_fields})
            else:
                self.log_test("Analytics Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Analytics Authenticated", False, f"Connection error: {str(e)}")

    def test_feedback_data_validation(self):
        """Test feedback endpoint with various rating values"""
        try:
            # Test with different rating values
            test_cases = [
                {"rating": 1, "category": "improvement", "expected": True},
                {"rating": 3, "category": "collaboration", "expected": True},
                {"rating": 5, "category": "hiring", "expected": True}
            ]
            
            for i, test_case in enumerate(test_cases):
                timestamp = int(time.time()) + i
                feedback_data = {
                    "name": f"Test User {timestamp}",
                    "email": f"test.user.{timestamp}@example.com",
                    "category": test_case["category"],
                    "rating": test_case["rating"],
                    "message": f"Test feedback with rating {test_case['rating']}",
                    "wouldRecommend": test_case["rating"] >= 3,
                    "contactBack": False
                }
                
                response = requests.post(f"{self.base_url}/feedback", json=feedback_data)
                
                if response.status_code == 200 and test_case["expected"]:
                    continue
                else:
                    self.log_test("Feedback Data Validation", False, 
                                f"Failed for rating {test_case['rating']}", 
                                {"test_case": test_case, "status_code": response.status_code})
                    return
            
            self.log_test("Feedback Data Validation", True, "All rating values and categories accepted correctly")
            
        except Exception as e:
            self.log_test("Feedback Data Validation", False, f"Connection error: {str(e)}")

    def test_contact_data_validation(self):
        """Test contact endpoint with various project types and budgets"""
        try:
            # Test with different project types and budgets
            test_cases = [
                {"projectType": "mobile", "budget": "under-25k", "timeline": "1-week"},
                {"projectType": "automation", "budget": "25k-50k", "timeline": "1-month"},
                {"projectType": "custom", "budget": "50k-100k", "timeline": "3-months"}
            ]
            
            for i, test_case in enumerate(test_cases):
                timestamp = int(time.time()) + i + 100
                contact_data = {
                    "name": f"Test Contact {timestamp}",
                    "email": f"test.contact.{timestamp}@example.com",
                    "projectType": test_case["projectType"],
                    "budget": test_case["budget"],
                    "timeline": test_case["timeline"],
                    "message": f"Test contact for {test_case['projectType']} project",
                    "preferredContact": "email",
                    "urgency": "normal"
                }
                
                response = requests.post(f"{self.base_url}/contact", json=contact_data)
                
                if response.status_code != 200:
                    self.log_test("Contact Data Validation", False, 
                                f"Failed for project type {test_case['projectType']}", 
                                {"test_case": test_case, "status_code": response.status_code})
                    return
            
            self.log_test("Contact Data Validation", True, "All project types, budgets, and timelines accepted correctly")
            
        except Exception as e:
            self.log_test("Contact Data Validation", False, f"Connection error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Portfolio Backend API Tests")
        print("=" * 50)
        
        # Basic health checks
        self.test_root_endpoint()
        self.test_cors_headers()
        
        # Authentication tests
        self.test_login_valid_passphrase()
        self.test_login_invalid_passphrase()
        self.test_jwt_token_validation()
        self.test_invalid_token()
        
        # Content management tests
        self.test_get_content_public()
        self.test_save_content_authenticated()
        self.test_save_content_unauthenticated()
        self.test_content_persistence()
        
        # Subscriber management tests
        self.test_subscribe_valid_email()
        self.test_subscribe_duplicate_email()
        self.test_get_subscribers_authenticated()
        self.test_get_subscribers_unauthenticated()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = PortfolioAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)