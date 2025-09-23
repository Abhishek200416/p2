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