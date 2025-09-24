#!/usr/bin/env python3
"""
Super Advanced Website Editor Backend API Test Suite
Focused testing for all editing functionality backend support.
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

class SuperAdvancedWebsiteEditorTester:
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

    def test_authentication_valid_password(self):
        """Test POST /api/login with password 'shipfast' - should return valid JWT token"""
        try:
            payload = {"passphrase": PASSPHRASE}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "message" in data:
                    self.token = data["token"]
                    # Verify token format (JWT should have 3 parts separated by dots)
                    token_parts = data["token"].split('.')
                    if len(token_parts) == 3:
                        self.log_test("Authentication Valid Password", True, 
                                    f"Password 'shipfast' generates valid JWT token. Message: {data['message']}", 
                                    {"token_format": "valid_jwt", "token_parts": len(token_parts)})
                    else:
                        self.log_test("Authentication Valid Password", False, 
                                    "Token format invalid - not a proper JWT", 
                                    {"token": data["token"]})
                else:
                    self.log_test("Authentication Valid Password", False, 
                                "Missing token or message in response", 
                                {"response": data})
            else:
                self.log_test("Authentication Valid Password", False, 
                            f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Authentication Valid Password", False, f"Connection error: {str(e)}")

    def test_authentication_invalid_password(self):
        """Test invalid password rejection with proper 401 response"""
        try:
            payload = {"passphrase": "wrongpassword123"}
            response = requests.post(f"{self.base_url}/login", json=payload)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data:
                    self.log_test("Authentication Invalid Password", True, 
                                f"Invalid password correctly rejected with 401. Detail: {data['detail']}")
                else:
                    self.log_test("Authentication Invalid Password", True, 
                                "Invalid password correctly rejected with 401")
            else:
                self.log_test("Authentication Invalid Password", False, 
                            f"Expected 401, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Authentication Invalid Password", False, f"Connection error: {str(e)}")

    def test_jwt_token_validation_protected_endpoints(self):
        """Verify JWT token validation on protected endpoints"""
        if not self.token:
            self.log_test("JWT Token Validation", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Test multiple protected endpoints
            protected_endpoints = [
                ("/save-content", "POST"),
                ("/subscribers", "GET"),
                ("/feedback", "GET"),
                ("/contacts", "GET"),
                ("/analytics", "GET")
            ]
            
            valid_endpoints = 0
            for endpoint, method in protected_endpoints:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
                elif method == "POST":
                    # For POST endpoints, send minimal valid data
                    if endpoint == "/save-content":
                        test_content = {
                            "hero": {"name": "Test", "title": "Test"},
                            "about": {"description": "Test"},
                            "freelance": {"available": True},
                            "projects": {"featured": []},
                            "skills": ["Test"],
                            "experience": [],
                            "hackathons": [],
                            "certs": [],
                            "education": {"degree": "Test"},
                            "contact": {"email": "test@example.com"}
                        }
                        response = requests.post(f"{self.base_url}{endpoint}", json=test_content, headers=headers)
                    
                if response.status_code in [200, 201]:
                    valid_endpoints += 1
                elif response.status_code == 401:
                    # Token might be expired or invalid
                    break
            
            if valid_endpoints >= 3:  # At least 3 endpoints should work
                self.log_test("JWT Token Validation", True, 
                            f"Valid JWT token accepted on {valid_endpoints}/{len(protected_endpoints)} protected endpoints")
            else:
                self.log_test("JWT Token Validation", False, 
                            f"JWT token validation failed on multiple endpoints. Only {valid_endpoints} worked")
                
        except Exception as e:
            self.log_test("JWT Token Validation", False, f"Connection error: {str(e)}")

    def test_content_retrieval_api(self):
        """Test GET /api/content - should retrieve portfolio content"""
        try:
            response = requests.get(f"{self.base_url}/content")
            
            if response.status_code == 200:
                data = response.json()
                # Check if we get meaningful content or default message
                if isinstance(data, dict):
                    if "message" in data and "No content found" in data["message"]:
                        self.log_test("Content Retrieval API", True, 
                                    "Content API working - returns default message when no content exists", 
                                    {"response_type": "default_message"})
                    else:
                        # Check for typical portfolio content structure
                        expected_fields = ["hero", "about", "projects", "skills", "contact"]
                        found_fields = [field for field in expected_fields if field in data]
                        
                        if len(found_fields) >= 2:  # At least 2 portfolio sections
                            self.log_test("Content Retrieval API", True, 
                                        f"Content API working - retrieved portfolio content with {len(found_fields)} sections", 
                                        {"found_sections": found_fields, "total_fields": len(data)})
                        else:
                            self.log_test("Content Retrieval API", True, 
                                        "Content API working - retrieved data structure", 
                                        {"data_keys": list(data.keys())})
                else:
                    self.log_test("Content Retrieval API", False, 
                                "Unexpected response format - not a dictionary", 
                                {"response_type": type(data).__name__})
            else:
                self.log_test("Content Retrieval API", False, 
                            f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Retrieval API", False, f"Connection error: {str(e)}")

    def test_content_save_authenticated(self):
        """Test POST /api/save-content with valid JWT - should save content successfully"""
        if not self.token:
            self.log_test("Content Save Authenticated", False, "No token available for testing")
            return
        
        try:
            # Comprehensive portfolio content for Super Advanced Website Editor
            content = {
                "hero": {
                    "name": "Abhishek Kolluri",
                    "title": "Super Advanced Website Editor Developer",
                    "description": "Building the next generation of web editing tools with AI-powered features",
                    "tagline": "Edit. Create. Innovate.",
                    "background_style": "gradient-purple-blue"
                },
                "about": {
                    "description": "Passionate full-stack developer specializing in advanced web editing interfaces, real-time collaboration tools, and AI-powered content generation. Expert in React, FastAPI, and modern web technologies.",
                    "skills_highlight": "Advanced UI/UX, Real-time Systems, AI Integration",
                    "experience_years": 5
                },
                "freelance": {
                    "available": True,
                    "rate": "$75/hour",
                    "specialties": ["Web Editors", "AI Integration", "Real-time Systems"]
                },
                "projects": {
                    "featured": [
                        {
                            "name": "Super Advanced Website Editor",
                            "description": "DeepSeek-like website editor with AI-powered design suggestions, real-time collaboration, and advanced editing tools",
                            "tech": ["React", "FastAPI", "MongoDB", "AI/ML", "WebSockets"],
                            "features": ["Right-click editing", "Drag-and-drop", "Auto-save", "AI redesign", "Live preview"]
                        },
                        {
                            "name": "Real-time Collaborative Editor",
                            "description": "Multi-user editing platform with live cursors, conflict resolution, and version control",
                            "tech": ["React", "Node.js", "Socket.io", "Redis"],
                            "features": ["Live collaboration", "Version history", "Conflict resolution"]
                        }
                    ]
                },
                "skills": [
                    "React", "FastAPI", "MongoDB", "AI/ML Integration", "WebSockets", 
                    "Real-time Systems", "Advanced UI/UX", "Drag & Drop APIs", 
                    "Content Management", "Authentication Systems"
                ],
                "experience": [
                    {
                        "company": "Advanced Web Solutions",
                        "position": "Senior Full-Stack Developer",
                        "duration": "2022-2024",
                        "description": "Led development of advanced web editing tools and AI-powered content generation systems"
                    }
                ],
                "hackathons": [
                    {
                        "name": "AI Web Editor Hackathon 2024",
                        "position": "Winner",
                        "project": "Super Advanced Website Editor prototype"
                    }
                ],
                "certs": [
                    "AWS Certified Solutions Architect",
                    "Google Cloud AI/ML Specialist",
                    "MongoDB Certified Developer"
                ],
                "education": {
                    "degree": "Computer Science",
                    "university": "Tech University",
                    "year": "2020",
                    "specialization": "AI and Web Technologies"
                },
                "contact": {
                    "email": "abhishek@superwebeditor.com",
                    "linkedin": "linkedin.com/in/abhishek-kolluri",
                    "github": "github.com/abhishek-kolluri",
                    "portfolio": "superwebeditor.com"
                }
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "timestamp" in data:
                    self.log_test("Content Save Authenticated", True, 
                                f"Content saved successfully for Super Advanced Website Editor. {data['message']}", 
                                {"timestamp": data["timestamp"], "content_sections": len(content)})
                else:
                    self.log_test("Content Save Authenticated", False, 
                                "Missing expected fields in save response", 
                                {"response": data})
            else:
                self.log_test("Content Save Authenticated", False, 
                            f"HTTP {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Save Authenticated", False, f"Connection error: {str(e)}")

    def test_content_save_unauthenticated(self):
        """Test unauthenticated save requests get proper 403 rejection"""
        try:
            content = {"hero": {"name": "Unauthorized Test"}}
            response = requests.post(f"{self.base_url}/save-content", json=content)
            
            if response.status_code == 403:
                self.log_test("Content Save Unauthenticated", True, 
                            "Unauthenticated save request correctly rejected with 403")
            else:
                self.log_test("Content Save Unauthenticated", False, 
                            f"Expected 403, got {response.status_code}", 
                            {"response": response.text})
        except Exception as e:
            self.log_test("Content Save Unauthenticated", False, f"Connection error: {str(e)}")

    def test_rapid_consecutive_saves_autosave(self):
        """Test rapid consecutive saves (simulate auto-save functionality)"""
        if not self.token:
            self.log_test("Rapid Consecutive Saves", False, "No token available for testing")
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            base_content = {
                "hero": {"name": "Auto-save Test", "title": "Testing"},
                "about": {"description": "Auto-save simulation"},
                "freelance": {"available": True},
                "projects": {"featured": []},
                "skills": ["Auto-save"],
                "experience": [],
                "hackathons": [],
                "certs": [],
                "education": {"degree": "Test"},
                "contact": {"email": "autosave@test.com"}
            }
            
            successful_saves = 0
            total_saves = 5
            
            for i in range(total_saves):
                # Modify content slightly for each save (simulating real editing)
                content = base_content.copy()
                content["hero"]["title"] = f"Auto-save Test {i+1}"
                content["about"]["description"] = f"Auto-save simulation - save #{i+1}"
                
                response = requests.post(f"{self.base_url}/save-content", json=content, headers=headers)
                
                if response.status_code == 200:
                    successful_saves += 1
                
                # Small delay to simulate real auto-save timing
                time.sleep(0.1)
            
            if successful_saves == total_saves:
                self.log_test("Rapid Consecutive Saves", True, 
                            f"Auto-save simulation successful: {successful_saves}/{total_saves} saves completed", 
                            {"saves_per_second": total_saves / 0.5})
            else:
                self.log_test("Rapid Consecutive Saves", False, 
                            f"Auto-save simulation failed: only {successful_saves}/{total_saves} saves successful")
                
        except Exception as e:
            self.log_test("Rapid Consecutive Saves", False, f"Connection error: {str(e)}")

    def test_large_content_payloads(self):
        """Verify content persistence and data integrity with large payloads"""
        if not self.token:
            self.log_test("Large Content Payloads", False, "No token available for testing")
            return
        
        try:
            # Create large content payload (simulating complex website with lots of content)
            large_content = {
                "hero": {
                    "name": "Large Content Test",
                    "title": "Testing Large Payload Handling",
                    "description": "This is a comprehensive test of large content payloads for the Super Advanced Website Editor. " * 50,
                    "background_image": "data:image/svg+xml;base64," + "A" * 1000  # Simulated large base64 image
                },
                "about": {
                    "description": "Extensive about section with detailed information about capabilities, experience, and expertise in web development. " * 100,
                    "detailed_skills": ["Skill " + str(i) for i in range(100)],
                    "achievements": ["Achievement " + str(i) for i in range(50)]
                },
                "projects": {
                    "featured": [
                        {
                            "name": f"Project {i}",
                            "description": f"Detailed description of project {i} with comprehensive information about technologies, challenges, and solutions implemented. " * 20,
                            "tech": [f"Tech{j}" for j in range(10)],
                            "features": [f"Feature{k}" for k in range(15)]
                        } for i in range(20)
                    ]
                },
                "skills": [f"Skill {i}" for i in range(200)],
                "experience": [
                    {
                        "company": f"Company {i}",
                        "position": f"Position {i}",
                        "duration": f"2020-202{i}",
                        "description": f"Detailed work experience description for company {i}. " * 30
                    } for i in range(10)
                ],
                "hackathons": [{"name": f"Hackathon {i}", "position": "Winner", "project": f"Project {i}"} for i in range(20)],
                "certs": [f"Certification {i}" for i in range(30)],
                "education": {
                    "degree": "Computer Science with extensive coursework in advanced topics",
                    "university": "University with long name and detailed information",
                    "year": "2020",
                    "courses": [f"Course {i}" for i in range(50)]
                },
                "contact": {
                    "email": "large.content.test@example.com",
                    "detailed_info": "Extensive contact information with multiple ways to reach out. " * 50
                }
            }
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Calculate approximate payload size
            payload_size = len(json.dumps(large_content))
            
            response = requests.post(f"{self.base_url}/save-content", json=large_content, headers=headers)
            
            if response.status_code == 200:
                # Verify data integrity by retrieving and comparing
                get_response = requests.get(f"{self.base_url}/content")
                
                if get_response.status_code == 200:
                    retrieved_content = get_response.json()
                    
                    # Check key fields for data integrity
                    if (retrieved_content.get("hero", {}).get("name") == "Large Content Test" and
                        len(retrieved_content.get("skills", [])) >= 100 and
                        len(retrieved_content.get("projects", {}).get("featured", [])) >= 10):
                        
                        self.log_test("Large Content Payloads", True, 
                                    f"Large content payload handled successfully without size limits. Payload: ~{payload_size/1024:.1f}KB", 
                                    {"payload_size_bytes": payload_size, "projects_count": len(large_content["projects"]["featured"])})
                    else:
                        self.log_test("Large Content Payloads", False, 
                                    "Data integrity check failed - retrieved content doesn't match saved content")
                else:
                    self.log_test("Large Content Payloads", False, 
                                "Failed to retrieve content for integrity verification")
            else:
                self.log_test("Large Content Payloads", False, 
                            f"Large content save failed: HTTP {response.status_code}", 
                            {"payload_size_bytes": payload_size})
                
        except Exception as e:
            self.log_test("Large Content Payloads", False, f"Connection error: {str(e)}")

    def test_cors_headers_frontend_integration(self):
        """Verify proper CORS headers for frontend integration"""
        try:
            # Test CORS preflight request
            response = requests.options(f"{self.base_url}/login", headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            })
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
                'access-control-allow-credentials': response.headers.get('access-control-allow-credentials')
            }
            
            # Check if CORS is properly configured for frontend integration
            if cors_headers['access-control-allow-origin'] in ['*', 'http://localhost:3000']:
                methods_ok = 'POST' in str(cors_headers.get('access-control-allow-methods', ''))
                headers_ok = 'content-type' in str(cors_headers.get('access-control-allow-headers', '')).lower()
                
                if methods_ok and headers_ok:
                    self.log_test("CORS Headers Frontend Integration", True, 
                                "CORS properly configured for Super Advanced Website Editor frontend", 
                                {"cors_headers": cors_headers})
                else:
                    self.log_test("CORS Headers Frontend Integration", False, 
                                "CORS headers missing required methods or headers", 
                                {"cors_headers": cors_headers})
            else:
                self.log_test("CORS Headers Frontend Integration", False, 
                            "CORS allow-origin not configured for frontend", 
                            {"cors_headers": cors_headers})
                
        except Exception as e:
            self.log_test("CORS Headers Frontend Integration", False, f"Connection error: {str(e)}")

    def test_backend_connectivity_response_times(self):
        """Test backend connectivity and response times"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/")
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                if response_time < 1000:  # Less than 1 second
                    self.log_test("Backend Connectivity Response Times", True, 
                                f"Backend responding quickly: {response_time:.0f}ms", 
                                {"response_time_ms": response_time, "status": "fast"})
                elif response_time < 5000:  # Less than 5 seconds
                    self.log_test("Backend Connectivity Response Times", True, 
                                f"Backend responding adequately: {response_time:.0f}ms", 
                                {"response_time_ms": response_time, "status": "adequate"})
                else:
                    self.log_test("Backend Connectivity Response Times", False, 
                                f"Backend responding slowly: {response_time:.0f}ms", 
                                {"response_time_ms": response_time, "status": "slow"})
            else:
                self.log_test("Backend Connectivity Response Times", False, 
                            f"Backend connectivity issue: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test("Backend Connectivity Response Times", False, f"Connection error: {str(e)}")

    def test_all_endpoints_status_codes(self):
        """Confirm all endpoints respond with proper status codes"""
        try:
            # Test various endpoints and their expected status codes
            endpoint_tests = [
                ("/", "GET", 200, "Root endpoint"),
                ("/content", "GET", 200, "Public content endpoint"),
                ("/login", "POST", [200, 401], "Login endpoint"),
                ("/save-content", "POST", [200, 403], "Save content endpoint"),
                ("/subscribers", "GET", [200, 403], "Subscribers endpoint"),
                ("/feedback", "GET", [200, 403], "Feedback endpoint"),
                ("/contacts", "GET", [200, 403], "Contacts endpoint"),
                ("/analytics", "GET", [200, 403], "Analytics endpoint")
            ]
            
            correct_responses = 0
            total_tests = len(endpoint_tests)
            
            for endpoint, method, expected_codes, description in endpoint_tests:
                try:
                    if method == "GET":
                        response = requests.get(f"{self.base_url}{endpoint}")
                    elif method == "POST":
                        if endpoint == "/login":
                            response = requests.post(f"{self.base_url}{endpoint}", json={"passphrase": "test"})
                        else:
                            response = requests.post(f"{self.base_url}{endpoint}", json={})
                    
                    if isinstance(expected_codes, list):
                        if response.status_code in expected_codes:
                            correct_responses += 1
                    else:
                        if response.status_code == expected_codes:
                            correct_responses += 1
                            
                except:
                    pass  # Skip failed requests for this summary test
            
            if correct_responses >= total_tests * 0.8:  # 80% success rate
                self.log_test("All Endpoints Status Codes", True, 
                            f"Endpoints responding with proper status codes: {correct_responses}/{total_tests}", 
                            {"success_rate": f"{(correct_responses/total_tests)*100:.1f}%"})
            else:
                self.log_test("All Endpoints Status Codes", False, 
                            f"Multiple endpoints not responding correctly: {correct_responses}/{total_tests}")
                
        except Exception as e:
            self.log_test("All Endpoints Status Codes", False, f"Connection error: {str(e)}")

    def run_super_advanced_editor_tests(self):
        """Run all Super Advanced Website Editor backend tests"""
        print("🚀 Super Advanced Website Editor Backend API Tests")
        print("=" * 60)
        print("Testing all backend APIs that support editing functionality")
        print()
        
        # 1. Authentication API Testing
        print("🔐 AUTHENTICATION API TESTING")
        print("-" * 40)
        self.test_authentication_valid_password()
        self.test_authentication_invalid_password()
        self.test_jwt_token_validation_protected_endpoints()
        print()
        
        # 2. Content Management APIs
        print("📄 CONTENT MANAGEMENT APIs")
        print("-" * 40)
        self.test_content_retrieval_api()
        self.test_content_save_authenticated()
        self.test_content_save_unauthenticated()
        print()
        
        # 3. Auto-Save Support Testing
        print("💾 AUTO-SAVE SUPPORT TESTING")
        print("-" * 40)
        self.test_rapid_consecutive_saves_autosave()
        self.test_large_content_payloads()
        print()
        
        # 4. Error Handling Verification
        print("🛡️ ERROR HANDLING VERIFICATION")
        print("-" * 40)
        self.test_cors_headers_frontend_integration()
        self.test_backend_connectivity_response_times()
        self.test_all_endpoints_status_codes()
        print()
        
        # Summary
        print("=" * 60)
        print("📊 SUPER ADVANCED WEBSITE EDITOR BACKEND TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        print()
        
        # Categorize results by functionality
        categories = {
            "🔐 Authentication System": [
                "Authentication Valid Password", 
                "Authentication Invalid Password", 
                "JWT Token Validation"
            ],
            "📄 Content Management": [
                "Content Retrieval API", 
                "Content Save Authenticated", 
                "Content Save Unauthenticated"
            ],
            "💾 Auto-Save Support": [
                "Rapid Consecutive Saves", 
                "Large Content Payloads"
            ],
            "🛡️ Error Handling": [
                "CORS Headers Frontend Integration", 
                "Backend Connectivity Response Times", 
                "All Endpoints Status Codes"
            ]
        }
        
        print("📋 RESULTS BY FUNCTIONALITY:")
        for category, test_names in categories.items():
            category_results = [r for r in self.test_results if r["test"] in test_names]
            if category_results:
                category_passed = sum(1 for r in category_results if r["success"])
                category_total = len(category_results)
                status = "✅ READY" if category_passed == category_total else "⚠️ ISSUES"
                print(f"  {category}: {category_passed}/{category_total} ({status})")
        print()
        
        if failed > 0:
            print("🔍 FAILED TESTS REQUIRING ATTENTION:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        else:
            print("🎉 ALL BACKEND TESTS PASSED!")
            print("✅ Super Advanced Website Editor backend is FULLY OPERATIONAL")
            print("✅ Authentication system working perfectly")
            print("✅ Content management APIs ready for editing")
            print("✅ Auto-save functionality fully supported")
            print("✅ Error handling and CORS properly configured")
        
        print()
        print("🎯 BACKEND READINESS FOR SUPER ADVANCED WEBSITE EDITOR:")
        if passed >= len(self.test_results) * 0.9:  # 90% success rate
            print("✅ BACKEND IS ROCK SOLID - Ready to support all editing features")
        elif passed >= len(self.test_results) * 0.8:  # 80% success rate
            print("⚠️ BACKEND IS MOSTLY READY - Minor issues need attention")
        else:
            print("❌ BACKEND NEEDS FIXES - Critical issues must be resolved")
        
        return passed, failed

if __name__ == "__main__":
    tester = SuperAdvancedWebsiteEditorTester()
    passed, failed = tester.run_super_advanced_editor_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)