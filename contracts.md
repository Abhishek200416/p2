# Portfolio API Contracts

## Overview
This document defines the API contracts between the frontend and backend for Abhishek Kolluri's portfolio website.

## Authentication
- **Edit Mode**: Protected by passphrase "shipfast"
- **JWT Token**: 24-hour expiry for authenticated sessions
- **Storage**: sessionStorage for token persistence

## API Endpoints

### 1. Authentication
```
POST /api/login
Body: { "passphrase": "shipfast" }
Response: { "token": "jwt_token", "message": "success" }
```

### 2. Content Management
```
GET /api/content
Response: Full portfolio content JSON

POST /api/save-content (Auth Required)
Body: Complete portfolio content object
Response: { "message": "success", "timestamp": "..." }
```

### 3. Subscriber Management
```
POST /api/subscribe
Body: { "email": "user@example.com" }
Response: { "message": "subscribed", "status": "new|existing" }

GET /api/subscribers (Auth Required)
Response: { "count": 10, "subscribers": [...] }
```

## Frontend Integration Points

### 1. Mock Data Removal
- Remove hardcoded defaultContent from App.js
- Load content via GET /api/content on app initialization
- Fallback to defaults if API unavailable

### 2. Edit Mode Integration
- Replace localStorage-only editing with API calls
- Implement JWT-based authentication flow
- Add real-time content saving to backend

### 3. Subscribe Functionality
- Connect Hero component subscribe form to POST /api/subscribe
- Add proper error handling and user feedback
- Implement email validation

### 4. Project Modal Enhancement
- Add case study templates for project details
- Implement inline editing for project content
- Add image upload capability for project screenshots

## Database Schema

### 1. portfolio_content
```json
{
  "_id": ObjectId,
  "type": "current",
  "hero": {...},
  "about": {...},
  "freelance": {...},
  "projects": {...},
  "skills": [...],
  "experience": [...],
  "hackathons": [...],
  "certs": [...],
  "education": {...},
  "contact": {...},
  "updated_at": DateTime,
  "updated_by": "owner"
}
```

### 2. subscribers
```json
{
  "_id": ObjectId,
  "id": "uuid",
  "email": "user@example.com",
  "subscribed_at": DateTime,
  "ip_address": "optional"
}
```

### 3. status_checks
```json
{
  "_id": ObjectId,
  "id": "uuid",
  "client_name": "string",
  "timestamp": DateTime
}
```

## Security Considerations
- Rate limiting on subscribe endpoint (10 requests per minute)
- JWT token validation for protected endpoints
- Input sanitization for all user inputs
- CORS configuration for production domains

## Error Handling
- Graceful degradation when backend unavailable
- Clear error messages for authentication failures
- Toast notifications for user feedback
- Automatic retry for network errors

## Performance Optimizations
- Content caching with localStorage backup
- Lazy loading for project images
- Debounced auto-save for edit mode
- Optimistic updates for better UX

## Future Enhancements
- GitHub API integration for live project updates
- Image upload and management
- Analytics and visitor tracking
- Email notification system for new subscribers