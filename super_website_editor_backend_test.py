#!/usr/bin/env python3
"""
Super Website Editor Backend API Test Suite
Tests all critical backend APIs that support the Super Website Editor functionality.
Focus on authentication, content loading, content saving, and auto-save features.
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

class SuperWebsiteEditorAPITester:
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
    
    def test_backend_connectivity(self):
        """Test backend server connectivity"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.log_test("Backend Connectivity", True, f"Backend accessible at {self.base_url}", 
                                {"response": data})
                else:
                    self.log_test("Backend Connectivity", False, "Missing expected fields in response", 
                                {"response": data})
            else:
                self.log_test("Backend Connectivity", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Connection error: {str(e)}")
    
    def test_authentication_system(self):
        """Test POST /api/login with password 'shipfast'"""
        try:
            payload = {"passphrase": PASSPHRASE}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "message" in data:
                    self.token = data["token"]
                    self.log_test("Authentication System", True, "Password 'shipfast' authentication working perfectly", 
                                {"message": data["message"], "token_length": len(data["token"])})
                else:
                    self.log_test("Authentication System", False, "Missing token or message in response", 
                                {"response": data})
            else:
                self.log_test("Authentication System", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Authentication System", False, f"Connection error: {str(e)}")
    
    def test_invalid_password_rejection(self):
        """Test authentication with invalid password"""
        try:
            payload = {"passphrase": "wrongpassword"}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 401:
                self.log_test("Invalid Password Rejection", True, "Invalid password properly rejected with 401")
            else:
                self.log_test("Invalid Password Rejection", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Invalid Password Rejection", False, f"Connection error: {str(e)}")
    
    def test_jwt_token_validation(self):
        """Test JWT token validation on protected endpoints"""
        if not self.token:
            self.log_test("JWT Token Validation", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 200:
                self.log_test("JWT Token Validation", True, "JWT token validation working on protected endpoints")
            else:
                self.log_test("JWT Token Validation", False, 
                            f"Valid token rejected with status {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Connection error: {str(e)}")
    
    def test_content_loading_api(self):
        """Test GET /api/content for loading portfolio content"""
        try:
            response = requests.get(f"{self.base_url}/content")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Content Loading API", True, "GET /api/content loading content successfully", 
                            {"has_data": len(data) > 0, "content_keys": list(data.keys()) if isinstance(data, dict) else []})
            else:
                self.log_test("Content Loading API", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Loading API", False, f"Connection error: {str(e)}")
    
    def test_content_saving_authenticated(self):
        """Test POST /api/save-content with authentication for auto-save"""
        if not self.token:
            self.log_test("Content Saving Authenticated", False, "No token available for testing")
            return
        
        try:
            # Sample content for Super Website Editor
            content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Super Website Editor Developer",
                    "description": "Building amazing editable web experiences"
                },
                "about": {
                    "description": "Passionate developer creating advanced website editing tools"
                },
                "freelance": {
                    "available": True,
                    "rate": "$75/hour"
                },
                "projects": {
                    "featured": [
                        {
                            "name": "Super Website Editor",
                            "description": "Advanced DeepSeek-like website editor with real-time editing",
                            "tech": ["React", "FastAPI", "MongoDB", "AI Integration"]
                        }
                    ]
                },
                "skills": ["React", "FastAPI", "MongoDB", "AI Integration", "Real-time Editing"],
                "experience": [
                    {
                        "company": "Super Editor Corp",
                        "position": "Lead Developer",
                        "duration": "2024-Present",
                        "description": "Developing advanced website editing tools"
                    }
                ],
                "hackathons": [
                    {
                        "name": "EditorHack 2024",
                        "position": "Winner",
                        "project": "Real-time collaborative website editor"
                    }
                ],
                "certs": [
                    "Advanced React Development",
                    "AI Integration Specialist"
                ],
                "education": {
                    "degree": "Computer Science",
                    "university": "Tech University",
                    "year": "2020"
                },
                "contact": {
                    "email": "abhishek@supereditor.com",
                    "linkedin": "linkedin.com/in/abhishek-editor",
                    "github": "github.com/abhishek-editor"
                }
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Content Saving Authenticated", True, "POST /api/save-content working with valid JWT", 
                            {"response": data})
            else:
                self.log_test("Content Saving Authenticated", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Saving Authenticated", False, f"Connection error: {str(e)}")
    
    def test_content_saving_unauthenticated(self):
        """Test POST /api/save-content without authentication"""
        try:
            content = {"hero": {"name": "Test"}}
            response = requests.post(f"{self.base_url}/save-content", json=content)
            
            if response.status_code == 403:
                self.log_test("Content Saving Unauthenticated", True, "Unauthenticated requests properly rejected with 403")
            else:
                self.log_test("Content Saving Unauthenticated", False, 
                            f"Expected 403, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Saving Unauthenticated", False, f"Connection error: {str(e)}")
    
    def test_auto_save_simulation(self):
        """Test rapid consecutive saves to simulate auto-save functionality"""
        if not self.token:
            self.log_test("Auto-Save Simulation", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Simulate 5 consecutive auto-saves
            for i in range(5):
                content = {
                    "hero": {
                        "name": "Abhishek Kolluri",
                        "title": f"Auto-save test {i+1}",
                        "description": f"Testing auto-save functionality - iteration {i+1}"
                    },
                    "about": {"description": f"Auto-save test content {i+1}"},
                    "freelance": {"available": True},
                    "projects": {"featured": []},
                    "skills": ["Auto-save Testing"],
                    "experience": [],
                    "hackathons": [],
                    "certs": [],
                    "education": {"degree": "Test"},
                    "contact": {"email": "test@autosave.com"}
                }
                
                response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
                
                if response.status_code != 200:
                    self.log_test("Auto-Save Simulation", False, f"Auto-save {i+1} failed with status {response.status_code}")
                    return
                
                # Small delay to simulate real auto-save intervals
                time.sleep(0.1)
            
            self.log_test("Auto-Save Simulation", True, "Rapid consecutive saves (5 saves) successful - auto-save backend ready")
            
        except Exception as e:
            self.log_test("Auto-Save Simulation", False, f"Connection error: {str(e)}")
    
    def test_large_content_payload(self):
        """Test saving large content payloads without size limits"""
        if not self.token:
            self.log_test("Large Content Payload", False, "No token available for testing")
            return
        
        try:
            # Create large content payload
            large_description = "This is a very long description. " * 100  # 3000+ characters
            large_skills = [f"Skill {i}" for i in range(50)]  # 50 skills
            large_projects = [
                {
                    "name": f"Project {i}",
                    "description": f"Detailed description for project {i}. " * 20,
                    "tech": [f"Tech{j}" for j in range(10)]
                } for i in range(10)
            ]
            
            content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Large Content Test",
                    "description": large_description
                },
                "about": {"description": large_description},
                "freelance": {"available": True, "description": large_description},
                "projects": {"featured": large_projects},
                "skills": large_skills,
                "experience": [
                    {
                        "company": f"Company {i}",
                        "position": f"Position {i}",
                        "duration": f"2020-202{i}",
                        "description": large_description
                    } for i in range(5)
                ],
                "hackathons": [{"name": f"Hack {i}", "description": large_description} for i in range(5)],
                "certs": [f"Certificate {i}" for i in range(20)],
                "education": {"degree": "Computer Science", "description": large_description},
                "contact": {"email": "test@large.com", "description": large_description}
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
            
            if response.status_code == 200:
                # Calculate approximate payload size
                payload_size = len(json.dumps(content))
                self.log_test("Large Content Payload", True, 
                            f"Large content payload handled successfully (~{payload_size} bytes)", 
                            {"payload_size_bytes": payload_size})
            else:
                self.log_test("Large Content Payload", False, f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Large Content Payload", False, f"Connection error: {str(e)}")
    
    def test_content_persistence_integrity(self):
        """Test content persistence and data integrity"""
        if not self.token:
            self.log_test("Content Persistence Integrity", False, "No token available for testing")
            return
        
        try:
            # Save specific test content
            test_content = {
                "hero": {
                    "name": "Data Integrity Test",
                    "title": "Testing Content Persistence",
                    "description": "Verifying data integrity in MongoDB"
                },
                "about": {"description": "Content persistence test"},
                "freelance": {"available": False, "rate": "$100/hour"},
                "projects": {"featured": [{"name": "Test Project", "tech": ["Test Tech"]}]},
                "skills": ["Data Integrity", "MongoDB", "Testing"],
                "experience": [{"company": "Test Corp", "position": "Tester"}],
                "hackathons": [{"name": "Test Hack"}],
                "certs": ["Test Cert"],
                "education": {"degree": "Test Degree"},
                "contact": {"email": "integrity@test.com"}
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Save content
            save_response = requests.post(f"{self.base_url}/save-content", json=test_content, headers=headers)
            
            if save_response.status_code != 200:
                self.log_test("Content Persistence Integrity", False, "Failed to save content for integrity test")
                return
            
            # Retrieve content
            get_response = requests.get(f"{self.base_url}/content")
            
            if get_response.status_code == 200:
                retrieved_content = get_response.json()
                
                # Verify key data integrity
                if (retrieved_content.get("hero", {}).get("name") == "Data Integrity Test" and
                    retrieved_content.get("freelance", {}).get("rate") == "$100/hour" and
                    "Data Integrity" in retrieved_content.get("skills", [])):
                    
                    self.log_test("Content Persistence Integrity", True, 
                                "Content persistence verified with data integrity", 
                                {"saved_hero": test_content["hero"]["name"], 
                                 "retrieved_hero": retrieved_content.get("hero", {}).get("name")})
                else:
                    self.log_test("Content Persistence Integrity", False, 
                                "Data integrity mismatch between saved and retrieved content", 
                                {"saved": test_content["hero"], 
                                 "retrieved": retrieved_content.get("hero", {})})
            else:
                self.log_test("Content Persistence Integrity", False, 
                            f"Failed to retrieve content: HTTP {get_response.status_code}")
                
        except Exception as e:
            self.log_test("Content Persistence Integrity", False, f"Connection error: {str(e)}")
    
    def test_cors_configuration(self):
        """Test CORS configuration for frontend integration"""
        try:
            response = requests.options(f"{self.base_url}/", headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST'
            })
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            }
            
            if cors_headers['access-control-allow-origin']:
                self.log_test("CORS Configuration", True, "CORS properly configured for frontend integration", 
                            {"headers": cors_headers})
            else:
                self.log_test("CORS Configuration", False, "CORS headers missing or misconfigured", 
                            {"headers": cors_headers})
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error testing CORS: {str(e)}")
    
    def test_error_handling(self):
        """Test proper error handling and status codes"""
        try:
            # Test 401 for invalid token
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(f"{self.base_url}/subscribers", headers=headers)
            
            if response.status_code == 401:
                error_tests_passed = 1
            else:
                error_tests_passed = 0
            
            # Test 403 for missing token
            response = requests.post(f"{self.base_url}/save-content", json={"test": "data"})
            
            if response.status_code == 403:
                error_tests_passed += 1
            
            if error_tests_passed == 2:
                self.log_test("Error Handling", True, "Proper 401/403 responses for unauthorized access")
            else:
                self.log_test("Error Handling", False, f"Error handling issues: {error_tests_passed}/2 tests passed")
                
        except Exception as e:
            self.log_test("Error Handling", False, f"Connection error: {str(e)}")
    
    def run_super_editor_tests(self):
        """Run all Super Website Editor backend tests"""
        print("🎯 Starting Super Website Editor Backend API Tests")
        print("=" * 60)
        
        # Core connectivity and authentication
        print("\n🔗 BACKEND CONNECTIVITY & AUTHENTICATION")
        print("-" * 40)
        self.test_backend_connectivity()
        self.test_authentication_system()
        self.test_invalid_password_rejection()
        self.test_jwt_token_validation()
        
        # Content management for editor
        print("\n📄 CONTENT MANAGEMENT FOR EDITOR")
        print("-" * 40)
        self.test_content_loading_api()
        self.test_content_saving_authenticated()
        self.test_content_saving_unauthenticated()
        
        # Auto-save and advanced features
        print("\n💾 AUTO-SAVE & ADVANCED FEATURES")
        print("-" * 40)
        self.test_auto_save_simulation()
        self.test_large_content_payload()
        self.test_content_persistence_integrity()
        
        # Integration and error handling
        print("\n🔧 INTEGRATION & ERROR HANDLING")
        print("-" * 40)
        self.test_cors_configuration()
        self.test_error_handling()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 SUPER WEBSITE EDITOR BACKEND TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        # Critical features status
        critical_tests = [
            "Backend Connectivity",
            "Authentication System", 
            "Content Loading API",
            "Content Saving Authenticated",
            "Auto-Save Simulation"
        ]
        
        critical_results = [r for r in self.test_results if r["test"] in critical_tests]
        critical_passed = sum(1 for r in critical_results if r["success"])
        
        print(f"\n🎯 CRITICAL FEATURES STATUS: {critical_passed}/{len(critical_tests)}")
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        if critical_passed == len(critical_tests):
            print("\n🎉 ALL CRITICAL BACKEND APIS FOR SUPER WEBSITE EDITOR ARE WORKING!")
            print("✅ Backend is ready to support all frontend edit features")
        else:
            print(f"\n⚠️  CRITICAL ISSUES FOUND: {len(critical_tests) - critical_passed} critical features failing")
        
        return passed, failed, critical_passed, len(critical_tests)

if __name__ == "__main__":
    tester = SuperWebsiteEditorAPITester()
    passed, failed, critical_passed, critical_total = tester.run_super_editor_tests()
    
    # Exit with appropriate code
    exit(0 if critical_passed == critical_total else 1)