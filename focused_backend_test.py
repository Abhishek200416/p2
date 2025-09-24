#!/usr/bin/env python3
"""
Focused Backend API Test Suite for Super Advanced Website Editor
Tests critical APIs that support editing functionality.
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
BASE_URL = f"{BACKEND_URL}/api"
PASSPHRASE = os.environ.get('REACT_APP_OWNER_PASS', 'shipfast')

class FocusedAPITester:
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
    
    def test_login_with_shipfast(self):
        """Test POST /api/login with password 'shipfast' - CRITICAL for edit mode"""
        try:
            payload = {"passphrase": PASSPHRASE}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "message" in data:
                    self.token = data["token"]
                    self.log_test("Login with 'shipfast'", True, 
                                f"✅ JWT token generated successfully: {data['message']}", 
                                {"token_length": len(data["token"])})
                else:
                    self.log_test("Login with 'shipfast'", False, "Missing token or message in response", 
                                {"response": data})
            else:
                self.log_test("Login with 'shipfast'", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Login with 'shipfast'", False, f"Connection error: {str(e)}")
    
    def test_login_wrong_password(self):
        """Test POST /api/login with wrong password - should reject with 401"""
        try:
            payload = {"passphrase": "wrongpassword123"}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 401:
                self.log_test("Login Wrong Password", True, "✅ Correctly rejected invalid password with 401")
            else:
                self.log_test("Login Wrong Password", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Login Wrong Password", False, f"Connection error: {str(e)}")
    
    def test_get_content_public(self):
        """Test GET /api/content - retrieve saved content for editing"""
        try:
            response = requests.get(f"{self.base_url}/content")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get Content Public", True, 
                            "✅ Content retrieval working for editor", 
                            {"content_size": len(str(data)), "has_hero": "hero" in data})
            else:
                self.log_test("Get Content Public", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Get Content Public", False, f"Connection error: {str(e)}")
    
    def test_save_content_with_jwt(self):
        """Test POST /api/save-content with valid JWT - CRITICAL for auto-save"""
        if not self.token:
            self.log_test("Save Content with JWT", False, "No JWT token available for testing")
            return
        
        try:
            # Realistic content for website editor
            content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Super Advanced Website Editor Developer",
                    "description": "Building the next generation of web editing tools with AI-powered features"
                },
                "about": {
                    "description": "Passionate about creating intuitive editing experiences that empower users to build beautiful websites without coding knowledge."
                },
                "freelance": {
                    "available": True,
                    "rate": "$75/hour",
                    "specialties": ["Website Editors", "AI Integration", "Real-time Collaboration"]
                },
                "projects": {
                    "featured": [
                        {
                            "name": "Super Advanced Website Editor",
                            "description": "DeepSeek-like editing experience with right-click context menus, drag-and-drop, and AI assistance",
                            "tech": ["React", "FastAPI", "MongoDB", "AI Integration"],
                            "status": "In Development"
                        }
                    ]
                },
                "skills": ["React", "FastAPI", "MongoDB", "AI Integration", "Real-time Editing", "WebSocket"],
                "experience": [
                    {
                        "company": "Advanced Web Solutions",
                        "position": "Lead Frontend Developer",
                        "duration": "2023-2024",
                        "description": "Developed cutting-edge website editing tools with real-time collaboration features"
                    }
                ],
                "hackathons": [],
                "certs": ["AI Integration Specialist", "Advanced React Developer"],
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
                self.log_test("Save Content with JWT", True, 
                            "✅ Content saved successfully - auto-save backend ready", 
                            {"response": data})
            else:
                self.log_test("Save Content with JWT", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Save Content with JWT", False, f"Connection error: {str(e)}")
    
    def test_save_content_without_jwt(self):
        """Test POST /api/save-content without JWT - should reject with 403"""
        try:
            content = {"hero": {"name": "Unauthorized Test"}}
            response = requests.post(f"{self.base_url}/save-content", json=content)
            
            if response.status_code == 403:
                self.log_test("Save Content without JWT", True, "✅ Correctly rejected unauthenticated save request with 403")
            else:
                self.log_test("Save Content without JWT", False, 
                            f"Expected 403, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Save Content without JWT", False, f"Connection error: {str(e)}")
    
    def test_content_persistence_verification(self):
        """Test that saved content persists correctly - verify auto-save reliability"""
        if not self.token:
            self.log_test("Content Persistence", False, "No JWT token available for testing")
            return
        
        try:
            # Save unique test content
            timestamp = int(time.time())
            test_content = {
                "hero": {
                    "name": f"Test User {timestamp}",
                    "title": "Auto-save Test",
                    "description": f"Testing content persistence at {datetime.now().isoformat()}"
                },
                "about": {"description": "Auto-save reliability test"},
                "freelance": {"available": True},
                "projects": {"featured": []},
                "skills": ["Auto-save Testing"],
                "experience": [],
                "hackathons": [],
                "certs": [],
                "education": {"degree": "Test Degree"},
                "contact": {"email": f"test.{timestamp}@example.com"}
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Save content
            save_response = requests.post(f"{self.base_url}/save-content", json=test_content, headers=headers)
            
            if save_response.status_code != 200:
                self.log_test("Content Persistence", False, "Failed to save test content")
                return
            
            # Retrieve content to verify persistence
            get_response = requests.get(f"{self.base_url}/content")
            
            if get_response.status_code == 200:
                retrieved_content = get_response.json()
                saved_name = test_content["hero"]["name"]
                retrieved_name = retrieved_content.get("hero", {}).get("name")
                
                if retrieved_name == saved_name:
                    self.log_test("Content Persistence", True, 
                                "✅ Content persistence verified - auto-save data integrity confirmed", 
                                {"saved_name": saved_name, "retrieved_name": retrieved_name})
                else:
                    self.log_test("Content Persistence", False, 
                                "Content mismatch - auto-save data integrity issue", 
                                {"saved_name": saved_name, "retrieved_name": retrieved_name})
            else:
                self.log_test("Content Persistence", False, 
                            f"Failed to retrieve content: HTTP {get_response.status_code}")
                
        except Exception as e:
            self.log_test("Content Persistence", False, f"Connection error: {str(e)}")
    
    def test_rapid_saves_simulation(self):
        """Test multiple rapid saves to simulate auto-save behavior"""
        if not self.token:
            self.log_test("Rapid Saves Simulation", False, "No JWT token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            base_content = {
                "hero": {"name": "Rapid Save Test", "title": "Auto-save Simulation"},
                "about": {"description": "Testing rapid saves"},
                "freelance": {"available": True},
                "projects": {"featured": []},
                "skills": ["Rapid Testing"],
                "experience": [],
                "hackathons": [],
                "certs": [],
                "education": {"degree": "Test"},
                "contact": {"email": "rapid@test.com"}
            }
            
            successful_saves = 0
            total_saves = 5
            
            for i in range(total_saves):
                # Modify content slightly for each save
                content = base_content.copy()
                content["hero"]["description"] = f"Auto-save iteration {i+1} at {datetime.now().isoformat()}"
                
                response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
                
                if response.status_code == 200:
                    successful_saves += 1
                
                # Small delay to simulate real auto-save intervals
                time.sleep(0.1)
            
            if successful_saves == total_saves:
                self.log_test("Rapid Saves Simulation", True, 
                            f"✅ All {total_saves} rapid saves successful - auto-save reliability confirmed", 
                            {"successful_saves": successful_saves, "total_saves": total_saves})
            else:
                self.log_test("Rapid Saves Simulation", False, 
                            f"Only {successful_saves}/{total_saves} saves successful - auto-save reliability issue", 
                            {"successful_saves": successful_saves, "total_saves": total_saves})
                
        except Exception as e:
            self.log_test("Rapid Saves Simulation", False, f"Connection error: {str(e)}")
    
    def test_large_content_payload(self):
        """Test saving large content payloads - verify no size limits affecting editor"""
        if not self.token:
            self.log_test("Large Content Payload", False, "No JWT token available for testing")
            return
        
        try:
            # Create large content payload
            large_description = "This is a very long description that simulates a user creating extensive content in the website editor. " * 100
            large_project_list = []
            
            for i in range(20):
                large_project_list.append({
                    "name": f"Project {i+1}",
                    "description": f"Detailed project description {i+1}. " + "This project involves complex requirements and detailed implementation. " * 10,
                    "tech": ["React", "FastAPI", "MongoDB", "AI", "WebSocket", "Redis", "Docker"],
                    "features": [f"Feature {j+1}" for j in range(10)]
                })
            
            large_content = {
                "hero": {
                    "name": "Large Content Test",
                    "title": "Testing Large Payloads",
                    "description": large_description
                },
                "about": {"description": large_description},
                "freelance": {"available": True, "description": large_description},
                "projects": {"featured": large_project_list},
                "skills": [f"Skill {i+1}" for i in range(50)],
                "experience": [
                    {
                        "company": f"Company {i+1}",
                        "position": f"Position {i+1}",
                        "duration": f"2020-202{i+1}",
                        "description": large_description
                    } for i in range(10)
                ],
                "hackathons": [{"name": f"Hackathon {i+1}", "description": large_description} for i in range(10)],
                "certs": [f"Certificate {i+1}" for i in range(20)],
                "education": {"degree": "Computer Science", "description": large_description},
                "contact": {"email": "large@test.com", "description": large_description}
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{self.base_url}/save-content", json=large_content, headers=headers)
            
            content_size = len(json.dumps(large_content))
            
            if response.status_code == 200:
                self.log_test("Large Content Payload", True, 
                            f"✅ Large content payload saved successfully - no size limits detected", 
                            {"content_size_bytes": content_size, "content_size_kb": round(content_size/1024, 2)})
            else:
                self.log_test("Large Content Payload", False, 
                            f"Large content save failed: HTTP {response.status_code}", 
                            {"content_size_bytes": content_size, "response": response.text})
                
        except Exception as e:
            self.log_test("Large Content Payload", False, f"Connection error: {str(e)}")
    
    def test_jwt_token_validation_on_protected_endpoints(self):
        """Test JWT token validation on protected endpoints"""
        if not self.token:
            self.log_test("JWT Token Validation", False, "No JWT token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 200:
                self.log_test("JWT Token Validation", True, "✅ Valid JWT token accepted on protected endpoints")
            else:
                self.log_test("JWT Token Validation", False, 
                            f"Valid JWT token rejected: HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Connection error: {str(e)}")
    
    def test_invalid_jwt_token_rejection(self):
        """Test that invalid JWT tokens are properly rejected"""
        try:
            headers = {"Authorization": "Bearer invalid_jwt_token_here"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 401:
                self.log_test("Invalid JWT Rejection", True, "✅ Invalid JWT token correctly rejected with 401")
            else:
                self.log_test("Invalid JWT Rejection", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Invalid JWT Rejection", False, f"Connection error: {str(e)}")
    
    def run_focused_tests(self):
        """Run focused tests for Super Advanced Website Editor backend support"""
        print("🎯 FOCUSED BACKEND API TESTS FOR SUPER ADVANCED WEBSITE EDITOR")
        print("=" * 80)
        print("Testing critical APIs that support editing functionality:")
        print("• Authentication System (password 'shipfast')")
        print("• Content Management APIs (GET /api/content, POST /api/save-content)")
        print("• Auto-save Backend Support (content persistence & reliability)")
        print("=" * 80)
        
        # PRIORITY 1: Authentication System
        print("\n🔐 PRIORITY 1: AUTHENTICATION SYSTEM")
        print("-" * 50)
        self.test_login_with_shipfast()
        self.test_login_wrong_password()
        self.test_jwt_token_validation_on_protected_endpoints()
        self.test_invalid_jwt_token_rejection()
        
        # PRIORITY 2: Content Management APIs
        print("\n📄 PRIORITY 2: CONTENT MANAGEMENT APIs")
        print("-" * 50)
        self.test_get_content_public()
        self.test_save_content_with_jwt()
        self.test_save_content_without_jwt()
        
        # PRIORITY 3: Auto-save Backend Support
        print("\n💾 PRIORITY 3: AUTO-SAVE BACKEND SUPPORT")
        print("-" * 50)
        self.test_content_persistence_verification()
        self.test_rapid_saves_simulation()
        self.test_large_content_payload()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 FOCUSED TEST SUMMARY - SUPER ADVANCED WEBSITE EDITOR BACKEND")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Critical Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Categorize results by priority
        auth_tests = ["Login with 'shipfast'", "Login Wrong Password", "JWT Token Validation", "Invalid JWT Rejection"]
        content_tests = ["Get Content Public", "Save Content with JWT", "Save Content without JWT"]
        autosave_tests = ["Content Persistence", "Rapid Saves Simulation", "Large Content Payload"]
        
        categories = {
            "🔐 Authentication System": auth_tests,
            "📄 Content Management": content_tests,
            "💾 Auto-save Support": autosave_tests
        }
        
        print(f"\n📋 RESULTS BY PRIORITY:")
        for category, test_names in categories.items():
            category_results = [r for r in self.test_results if r["test"] in test_names]
            if category_results:
                category_passed = sum(1 for r in category_results if r["success"])
                category_total = len(category_results)
                status = "✅ READY" if category_passed == category_total else "❌ ISSUES"
                print(f"  {category}: {category_passed}/{category_total} ({status})")
        
        if failed > 0:
            print("\n🔍 CRITICAL ISSUES FOUND:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
            print("\n⚠️  RECOMMENDATION: Fix these issues before testing frontend edit features")
        else:
            print("\n🎉 ALL CRITICAL BACKEND APIs WORKING!")
            print("✅ Backend is ROCK SOLID and ready to support Super Advanced Website Editor")
        
        return passed, failed

if __name__ == "__main__":
    tester = FocusedAPITester()
    passed, failed = tester.run_focused_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)