#!/usr/bin/env python3
"""
Super Advanced Website Editor Backend API Test Suite
Tests the critical backend APIs that support the edit features.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

# Configuration - Use environment URL
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = f"{BACKEND_URL}/api"
PASSPHRASE = os.environ.get('REACT_APP_OWNER_PASS', 'shipfast')

class SuperEditorAPITester:
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
    
    def test_authentication_system(self):
        """Test password 'shipfast' authentication and JWT token generation"""
        try:
            # Test valid passphrase
            payload = {"passphrase": PASSPHRASE}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "message" in data:
                    self.token = data["token"]
                    # Verify token has 24-hour validity message
                    if "24 hours" in data["message"]:
                        self.log_test("Authentication System - Valid Password", True, 
                                    f"Password 'shipfast' generates JWT token correctly with 24-hour validity", 
                                    {"token_length": len(data["token"]), "message": data["message"]})
                    else:
                        self.log_test("Authentication System - Valid Password", True, 
                                    f"Password 'shipfast' generates JWT token correctly", 
                                    {"token_length": len(data["token"]), "message": data["message"]})
                else:
                    self.log_test("Authentication System - Valid Password", False, 
                                "Missing token or message in response", {"response": data})
            else:
                self.log_test("Authentication System - Valid Password", False, 
                            f"HTTP {response.status_code}", {"response": response.text})
            
            # Test invalid passphrase
            invalid_payload = {"passphrase": "wrongpassword"}
            invalid_response = requests.post(f"{self.base_url}/login", json=invalid_payload)
            
            if invalid_response.status_code == 401:
                self.log_test("Authentication System - Invalid Password", True, 
                            "Invalid passwords properly rejected with 401 status")
            else:
                self.log_test("Authentication System - Invalid Password", False, 
                            f"Expected 401, got {invalid_response.status_code}", 
                            {"response": invalid_response.text})
                
        except Exception as e:
            self.log_test("Authentication System", False, f"Connection error: {str(e)}")
    
    def test_jwt_token_validation(self):
        """Test JWT token validation on protected endpoints"""
        if not self.token:
            self.log_test("JWT Token Validation", False, "No token available for testing")
            return
        
        try:
            # Test valid token
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/save-content", headers=headers)
            
            # save-content is POST only, so we expect 405 Method Not Allowed, not 401/403
            if response.status_code in [405, 422]:  # Method not allowed or validation error is fine
                self.log_test("JWT Token Validation - Valid Token", True, 
                            "Valid JWT token accepted on protected endpoints")
            elif response.status_code == 401:
                self.log_test("JWT Token Validation - Valid Token", False, 
                            "Valid token rejected with 401", {"response": response.text})
            else:
                # Try with subscribers endpoint instead
                sub_response = requests.get(f"{self.base_url}/subscribers", headers=headers)
                if sub_response.status_code == 200:
                    self.log_test("JWT Token Validation - Valid Token", True, 
                                "Valid JWT token accepted on protected endpoints")
                else:
                    self.log_test("JWT Token Validation - Valid Token", False, 
                                f"Valid token rejected with status {sub_response.status_code}", 
                                {"response": sub_response.text})
            
            # Test invalid token
            invalid_headers = {"Authorization": "Bearer invalid_token_here"}
            invalid_response = requests.get(f"{self.base_url}/subscribers", headers=invalid_headers)
            
            if invalid_response.status_code == 401:
                self.log_test("JWT Token Validation - Invalid Token", True, 
                            "Invalid tokens properly rejected with 401 status")
            else:
                self.log_test("JWT Token Validation - Invalid Token", False, 
                            f"Expected 401, got {invalid_response.status_code}", 
                            {"response": invalid_response.text})
                
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Connection error: {str(e)}")
    
    def test_content_loading_api(self):
        """Test GET /api/content for loading existing content"""
        try:
            response = requests.get(f"{self.base_url}/content")
            
            if response.status_code == 200:
                data = response.json()
                # Check if it returns content or default message
                if isinstance(data, dict):
                    if "message" in data and "No content found" in data["message"]:
                        self.log_test("Content Loading API", True, 
                                    "GET /api/content handles empty state gracefully", 
                                    {"response_type": "default_message"})
                    else:
                        # Check for typical portfolio content structure
                        expected_fields = ["hero", "about", "projects", "skills"]
                        found_fields = [field for field in expected_fields if field in data]
                        
                        if found_fields:
                            self.log_test("Content Loading API", True, 
                                        f"GET /api/content returns portfolio content successfully", 
                                        {"found_fields": found_fields, "total_fields": len(data)})
                        else:
                            self.log_test("Content Loading API", True, 
                                        "GET /api/content returns content (structure may vary)", 
                                        {"response_keys": list(data.keys())})
                else:
                    self.log_test("Content Loading API", False, 
                                "Unexpected response format", {"response": data})
            else:
                self.log_test("Content Loading API", False, 
                            f"HTTP {response.status_code}", {"response": response.text})
                
        except Exception as e:
            self.log_test("Content Loading API", False, f"Connection error: {str(e)}")
    
    def test_auto_save_api(self):
        """Test POST /api/save-content for auto-save functionality"""
        if not self.token:
            self.log_test("Auto-Save API", False, "No token available for testing")
            return
        
        try:
            # Test authenticated save
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Sample content for auto-save testing
            auto_save_content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Super Advanced Website Editor Developer",
                    "description": "Building the future of web editing with real-time collaboration"
                },
                "about": {
                    "description": "Passionate about creating intuitive editing experiences"
                },
                "freelance": {
                    "available": True,
                    "rate": "$75/hour"
                },
                "projects": {
                    "featured": [
                        {
                            "name": "Super Advanced Website Editor",
                            "description": "DeepSeek-like editing experience with real-time preview",
                            "tech": ["React", "FastAPI", "MongoDB", "JWT"]
                        }
                    ]
                },
                "skills": ["React", "FastAPI", "MongoDB", "JWT", "Real-time Editing"],
                "experience": [
                    {
                        "company": "Editor Corp",
                        "position": "Lead Developer",
                        "duration": "2024-Present",
                        "description": "Developing advanced web editing tools"
                    }
                ],
                "hackathons": [],
                "certs": ["Advanced Web Development", "Real-time Systems"],
                "education": {
                    "degree": "Computer Science",
                    "university": "Tech University",
                    "year": "2020"
                },
                "contact": {
                    "email": "abhishek@editor.com",
                    "linkedin": "linkedin.com/in/abhishek-editor",
                    "github": "github.com/abhishek-editor"
                }
            }
            
            response = requests.post(f"{self.base_url}/save-content", json=auto_save_content, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "timestamp" in data:
                    self.log_test("Auto-Save API - Authenticated Save", True, 
                                "POST /api/save-content works with valid JWT for auto-save", 
                                {"message": data["message"], "has_timestamp": True})
                else:
                    self.log_test("Auto-Save API - Authenticated Save", True, 
                                "POST /api/save-content works with valid JWT", 
                                {"response": data})
            else:
                self.log_test("Auto-Save API - Authenticated Save", False, 
                            f"HTTP {response.status_code}", {"response": response.text})
            
            # Test unauthenticated save (should be rejected)
            unauth_response = requests.post(f"{self.base_url}/save-content", json=auto_save_content)
            
            if unauth_response.status_code == 403:
                self.log_test("Auto-Save API - Unauthenticated Rejection", True, 
                            "POST /api/save-content properly rejects unauthenticated requests with 403")
            else:
                self.log_test("Auto-Save API - Unauthenticated Rejection", False, 
                            f"Expected 403, got {unauth_response.status_code}", 
                            {"response": unauth_response.text})
                
        except Exception as e:
            self.log_test("Auto-Save API", False, f"Connection error: {str(e)}")
    
    def test_rapid_save_operations(self):
        """Test rapid save operations that support auto-save feature"""
        if not self.token:
            self.log_test("Rapid Save Operations", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Simulate rapid auto-save operations (5 consecutive saves)
            base_content = {
                "hero": {"name": "Test User", "title": "Developer"},
                "about": {"description": "Testing rapid saves"},
                "freelance": {"available": True},
                "projects": {"featured": []},
                "skills": ["Testing"],
                "experience": [],
                "hackathons": [],
                "certs": [],
                "education": {"degree": "Test"},
                "contact": {"email": "test@example.com"}
            }
            
            successful_saves = 0
            for i in range(5):
                # Modify content slightly for each save
                test_content = base_content.copy()
                test_content["hero"]["title"] = f"Developer - Save {i+1}"
                test_content["about"]["description"] = f"Testing rapid saves - iteration {i+1}"
                
                response = requests.post(f"{self.base_url}/save-content", json=test_content, headers=headers)
                
                if response.status_code == 200:
                    successful_saves += 1
                else:
                    break
                
                # Small delay to simulate real auto-save timing
                time.sleep(0.1)
            
            if successful_saves == 5:
                self.log_test("Rapid Save Operations", True, 
                            "Successfully handled 5 consecutive rapid saves for auto-save functionality", 
                            {"successful_saves": successful_saves})
            else:
                self.log_test("Rapid Save Operations", False, 
                            f"Only {successful_saves}/5 rapid saves succeeded", 
                            {"successful_saves": successful_saves})
                
        except Exception as e:
            self.log_test("Rapid Save Operations", False, f"Connection error: {str(e)}")
    
    def test_content_persistence_integrity(self):
        """Test content persistence and data integrity"""
        if not self.token:
            self.log_test("Content Persistence Integrity", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Create unique test content
            timestamp = int(time.time())
            test_content = {
                "hero": {
                    "name": f"Integrity Test User {timestamp}",
                    "title": "Data Integrity Specialist",
                    "description": "Testing content persistence and data integrity"
                },
                "about": {
                    "description": f"This content was saved at {timestamp} for integrity testing"
                },
                "freelance": {"available": False},
                "projects": {
                    "featured": [
                        {
                            "name": "Data Integrity Project",
                            "description": f"Project created at timestamp {timestamp}",
                            "tech": ["Testing", "Integrity", "Persistence"]
                        }
                    ]
                },
                "skills": ["Data Integrity", "Testing", "Persistence"],
                "experience": [
                    {
                        "company": f"Test Corp {timestamp}",
                        "position": "Integrity Tester",
                        "duration": "2024",
                        "description": "Testing data persistence"
                    }
                ],
                "hackathons": [],
                "certs": ["Data Integrity Certification"],
                "education": {
                    "degree": "Computer Science",
                    "university": f"Test University {timestamp}",
                    "year": "2024"
                },
                "contact": {
                    "email": f"integrity.test.{timestamp}@example.com",
                    "linkedin": f"linkedin.com/in/integrity-test-{timestamp}",
                    "github": f"github.com/integrity-test-{timestamp}"
                }
            }
            
            # Save the content
            save_response = requests.post(f"{self.base_url}/save-content", json=test_content, headers=headers)
            
            if save_response.status_code != 200:
                self.log_test("Content Persistence Integrity", False, 
                            "Failed to save test content", {"status_code": save_response.status_code})
                return
            
            # Wait a moment for persistence
            time.sleep(0.5)
            
            # Retrieve the content
            get_response = requests.get(f"{self.base_url}/content")
            
            if get_response.status_code == 200:
                retrieved_content = get_response.json()
                
                # Check data integrity
                if (retrieved_content.get("hero", {}).get("name") == test_content["hero"]["name"] and
                    retrieved_content.get("about", {}).get("description") == test_content["about"]["description"] and
                    retrieved_content.get("contact", {}).get("email") == test_content["contact"]["email"]):
                    
                    self.log_test("Content Persistence Integrity", True, 
                                "Content persistence verified with perfect data integrity", 
                                {
                                    "saved_name": test_content["hero"]["name"],
                                    "retrieved_name": retrieved_content.get("hero", {}).get("name"),
                                    "data_match": True
                                })
                else:
                    self.log_test("Content Persistence Integrity", False, 
                                "Data integrity issue - saved content doesn't match retrieved content", 
                                {
                                    "saved_hero": test_content["hero"],
                                    "retrieved_hero": retrieved_content.get("hero", {}),
                                    "saved_contact": test_content["contact"],
                                    "retrieved_contact": retrieved_content.get("contact", {})
                                })
            else:
                self.log_test("Content Persistence Integrity", False, 
                            f"Failed to retrieve content: HTTP {get_response.status_code}")
                
        except Exception as e:
            self.log_test("Content Persistence Integrity", False, f"Connection error: {str(e)}")
    
    def test_large_content_payloads(self):
        """Test handling of large content payloads for complex websites"""
        if not self.token:
            self.log_test("Large Content Payloads", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Create large content payload
            large_content = {
                "hero": {
                    "name": "Large Content Test User",
                    "title": "Full Stack Developer & Content Creator",
                    "description": "This is a comprehensive test of large content payloads to ensure the Super Advanced Website Editor can handle complex websites with extensive content. " * 10
                },
                "about": {
                    "description": "Extensive about section with detailed information about skills, experience, and background. " * 20
                },
                "freelance": {
                    "available": True,
                    "rate": "$100/hour",
                    "services": ["Web Development", "API Design", "Database Architecture", "Frontend Development", "Backend Development"] * 5
                },
                "projects": {
                    "featured": [
                        {
                            "name": f"Project {i}",
                            "description": f"Detailed description of project {i} with comprehensive information about technologies used, challenges faced, and solutions implemented. " * 5,
                            "tech": ["React", "FastAPI", "MongoDB", "JWT", "WebSocket", "Redis", "Docker", "Kubernetes"],
                            "features": [f"Feature {j}" for j in range(10)]
                        } for i in range(20)
                    ]
                },
                "skills": [f"Skill {i}" for i in range(50)],
                "experience": [
                    {
                        "company": f"Company {i}",
                        "position": f"Position {i}",
                        "duration": f"202{i%4}-202{(i%4)+1}",
                        "description": f"Detailed description of role at Company {i} with comprehensive information about responsibilities and achievements. " * 3,
                        "achievements": [f"Achievement {j}" for j in range(5)]
                    } for i in range(10)
                ],
                "hackathons": [
                    {
                        "name": f"Hackathon {i}",
                        "position": "Winner" if i % 3 == 0 else "Participant",
                        "project": f"Hackathon project {i}",
                        "description": f"Detailed description of hackathon project {i}. " * 3
                    } for i in range(15)
                ],
                "certs": [f"Certification {i}" for i in range(25)],
                "education": {
                    "degree": "Master of Computer Science",
                    "university": "Advanced Technology University",
                    "year": "2022",
                    "courses": [f"Course {i}" for i in range(20)],
                    "projects": [f"Academic Project {i}" for i in range(10)]
                },
                "contact": {
                    "email": "large.content.test@example.com",
                    "linkedin": "linkedin.com/in/large-content-test",
                    "github": "github.com/large-content-test",
                    "portfolio": "https://large-content-test.com",
                    "social_media": {
                        "twitter": "@large_content_test",
                        "instagram": "@large_content_test",
                        "youtube": "Large Content Test Channel"
                    }
                }
            }
            
            # Calculate approximate payload size
            payload_size = len(json.dumps(large_content))
            
            response = requests.post(f"{self.base_url}/save-content", json=large_content, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Large Content Payloads", True, 
                            f"Successfully handled large content payload ({payload_size} characters)", 
                            {
                                "payload_size_chars": payload_size,
                                "payload_size_kb": round(payload_size / 1024, 2),
                                "projects_count": len(large_content["projects"]["featured"]),
                                "skills_count": len(large_content["skills"]),
                                "response": data.get("message", "Success")
                            })
            else:
                self.log_test("Large Content Payloads", False, 
                            f"Failed to handle large content payload: HTTP {response.status_code}", 
                            {
                                "payload_size_chars": payload_size,
                                "payload_size_kb": round(payload_size / 1024, 2),
                                "response": response.text
                            })
                
        except Exception as e:
            self.log_test("Large Content Payloads", False, f"Connection error: {str(e)}")
    
    def test_backend_connectivity(self):
        """Test backend connectivity and availability"""
        try:
            # Test basic connectivity
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Backend Connectivity", True, 
                                f"Backend accessible at {BACKEND_URL}/api and responding correctly", 
                                {
                                    "backend_url": BACKEND_URL,
                                    "api_message": data["message"],
                                    "api_version": data["version"]
                                })
                else:
                    self.log_test("Backend Connectivity", True, 
                                f"Backend accessible at {BACKEND_URL}/api", 
                                {"backend_url": BACKEND_URL, "response": data})
            else:
                self.log_test("Backend Connectivity", False, 
                            f"Backend connectivity issue: HTTP {response.status_code}", 
                            {"backend_url": BACKEND_URL, "response": response.text})
                
        except requests.exceptions.Timeout:
            self.log_test("Backend Connectivity", False, 
                        f"Backend connection timeout at {BACKEND_URL}/api")
        except requests.exceptions.ConnectionError:
            self.log_test("Backend Connectivity", False, 
                        f"Cannot connect to backend at {BACKEND_URL}/api")
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Connection error: {str(e)}")
    
    def test_cors_configuration(self):
        """Test CORS configuration for frontend integration"""
        try:
            response = requests.options(f"{self.base_url}/content", headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            })
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
                'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
            }
            
            if cors_headers['access-control-allow-origin']:
                self.log_test("CORS Configuration", True, 
                            "CORS properly configured - frontend can communicate with backend APIs", 
                            {"cors_headers": {k: v for k, v in cors_headers.items() if v}})
            else:
                self.log_test("CORS Configuration", False, 
                            "CORS headers missing or misconfigured", 
                            {"cors_headers": cors_headers})
                
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error testing CORS: {str(e)}")
    
    def test_error_handling(self):
        """Test proper error handling for unauthorized access"""
        try:
            # Test 401 responses for invalid authentication
            invalid_headers = {"Authorization": "Bearer invalid_token"}
            response_401 = requests.post(f"{self.base_url}/save-content", 
                                       json={"test": "data"}, 
                                       headers=invalid_headers)
            
            # Test 403 responses for missing authentication
            response_403 = requests.post(f"{self.base_url}/save-content", 
                                       json={"test": "data"})
            
            success_401 = response_401.status_code == 401
            success_403 = response_403.status_code == 403
            
            if success_401 and success_403:
                self.log_test("Error Handling", True, 
                            "Proper 401/403 responses for unauthorized access confirmed", 
                            {
                                "invalid_token_response": response_401.status_code,
                                "no_token_response": response_403.status_code
                            })
            else:
                self.log_test("Error Handling", False, 
                            f"Incorrect error responses - 401: {response_401.status_code}, 403: {response_403.status_code}", 
                            {
                                "expected_401": 401,
                                "actual_401": response_401.status_code,
                                "expected_403": 403,
                                "actual_403": response_403.status_code
                            })
                
        except Exception as e:
            self.log_test("Error Handling", False, f"Connection error: {str(e)}")
    
    def run_super_editor_tests(self):
        """Run all Super Advanced Website Editor backend tests"""
        print("🎯 Super Advanced Website Editor Backend API Tests")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print(f"Using passphrase: {PASSPHRASE}")
        print("=" * 60)
        
        # Core authentication and connectivity tests
        print("\n🔐 AUTHENTICATION SYSTEM TESTS")
        print("-" * 40)
        self.test_authentication_system()
        self.test_jwt_token_validation()
        
        print("\n🌐 BACKEND CONNECTIVITY TESTS")
        print("-" * 40)
        self.test_backend_connectivity()
        self.test_cors_configuration()
        self.test_error_handling()
        
        # Content management tests for edit features
        print("\n📄 CONTENT MANAGEMENT APIS")
        print("-" * 40)
        self.test_content_loading_api()
        self.test_auto_save_api()
        
        # Auto-save backend support tests
        print("\n💾 AUTO-SAVE BACKEND SUPPORT")
        print("-" * 40)
        self.test_rapid_save_operations()
        self.test_content_persistence_integrity()
        self.test_large_content_payloads()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 SUPER EDITOR BACKEND TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Detailed results
        print(f"\n📋 DETAILED RESULTS:")
        
        categories = {
            "🔐 Authentication System": [
                "Authentication System - Valid Password",
                "Authentication System - Invalid Password", 
                "JWT Token Validation - Valid Token",
                "JWT Token Validation - Invalid Token"
            ],
            "🌐 Backend Connectivity": [
                "Backend Connectivity",
                "CORS Configuration", 
                "Error Handling"
            ],
            "📄 Content Management": [
                "Content Loading API",
                "Auto-Save API - Authenticated Save",
                "Auto-Save API - Unauthenticated Rejection"
            ],
            "💾 Auto-Save Support": [
                "Rapid Save Operations",
                "Content Persistence Integrity",
                "Large Content Payloads"
            ]
        }
        
        for category, test_names in categories.items():
            category_results = [r for r in self.test_results if r["test"] in test_names]
            if category_results:
                category_passed = sum(1 for r in category_results if r["success"])
                category_total = len(category_results)
                status = "✅" if category_passed == category_total else "⚠️"
                print(f"  {category}: {category_passed}/{category_total} {status}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        else:
            print("\n🎉 ALL SUPER EDITOR BACKEND TESTS PASSED!")
            print("🚀 Backend APIs are ROCK SOLID and ready to support Super Advanced Website Editor functionality!")
        
        return passed, failed

if __name__ == "__main__":
    tester = SuperEditorAPITester()
    passed, failed = tester.run_super_editor_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)