# API Documentation

Complete documentation for all API endpoints in the Next.js Serverless Playground.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
8. [Examples](#examples)
9. [SDK and Client Libraries](#sdk-and-client-libraries)

## 🌟 Overview

The Next.js Serverless Playground provides a RESTful API built with Next.js API routes, deployed as AWS Lambda functions. The API follows REST conventions and returns JSON responses.

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Responses**: All endpoints return JSON
- **Error Handling**: Consistent error response format
- **Environment Aware**: Different behavior per environment
- **Serverless**: Auto-scaling with AWS Lambda
- **Monitoring**: Integrated with CloudWatch

### Base Architecture
```
Client → API Gateway → Lambda Function → DynamoDB
                ↓
           CloudWatch Logs
```

## 🔐 Authentication

Currently, the API endpoints are public for demonstration purposes. In a production environment, you would implement authentication using:

### Future Authentication Methods
```typescript
// JWT Bearer Token (planned)
Authorization: Bearer <jwt-token>

// API Key (planned)
X-API-Key: <api-key>

// OAuth 2.0 (planned)
Authorization: Bearer <oauth-token>
```

### Example Implementation
```typescript
// middleware/auth.ts (future implementation)
export function requireAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      const user = await verifyToken(token);
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

## 🌐 Base URLs

### Development
```
http://localhost:3000/api
```

### Staging
```
https://your-staging-domain.com/api
```

### Production
```
https://your-production-domain.com/api
```

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

## ❌ Error Handling

### HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## 🚦 Rate Limiting

### Current Limits
- **Development**: No limits
- **Staging**: 100 requests/minute per IP
- **Production**: 1000 requests/minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## 🛠️ API Endpoints

### Health Check

#### GET /api/status
Check the health and status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 86400,
  "region": "us-east-1"
}
```

**Example:**
```bash
curl -X GET https://api.example.com/api/status
```

### Hello World

#### GET /api/hello
Simple hello world endpoint for testing.

**Query Parameters:**
- `name` (optional): Name to include in greeting

**Response:**
```json
{
  "message": "Hello, World!",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

**With name parameter:**
```json
{
  "message": "Hello, John!",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

**Examples:**
```bash
# Basic request
curl -X GET https://api.example.com/api/hello

# With name parameter
curl -X GET "https://api.example.com/api/hello?name=John"
```

#### POST /api/hello
Submit data to the hello endpoint.

**Request Body:**
```json
{
  "name": "John Doe",
  "message": "Hello from client"
}
```

**Response:**
```json
{
  "message": "Hello, John Doe! You said: Hello from client",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123456789"
}
```

**Example:**
```bash
curl -X POST https://api.example.com/api/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "message": "Hello from client"}'
```

### Sessions (Future Implementation)

#### POST /api/sessions
Create a new session.

**Request Body:**
```json
{
  "userId": "user-123",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response:**
```json
{
  "sessionId": "sess-789",
  "userId": "user-123",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T11:30:00Z"
}
```

#### GET /api/sessions/:sessionId
Retrieve session information.

**Response:**
```json
{
  "sessionId": "sess-789",
  "userId": "user-123",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T11:30:00Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

#### DELETE /api/sessions/:sessionId
Delete a session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

### Users (Future Implementation)

#### GET /api/users
List users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search query

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### GET /api/users/:userId
Get user by ID.

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/users/:userId
Update user information.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### DELETE /api/users/:userId
Delete a user.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 📝 Examples

### JavaScript/TypeScript

```typescript
// API client class
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async post(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage
const client = new ApiClient('https://api.example.com');

// Get status
const status = await client.get('/api/status');
console.log('API Status:', status);

// Send hello
const hello = await client.post('/api/hello', {
  name: 'John',
  message: 'Hello from client'
});
console.log('Response:', hello);
```

### Python

```python
import requests
import json

class ApiClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def get(self, endpoint):
        response = self.session.get(f"{self.base_url}{endpoint}")
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint, data):
        response = self.session.post(
            f"{self.base_url}{endpoint}",
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        return response.json()

# Usage
client = ApiClient('https://api.example.com')

# Get status
status = client.get('/api/status')
print('API Status:', status)

# Send hello
hello = client.post('/api/hello', {
    'name': 'John',
    'message': 'Hello from Python'
})
print('Response:', hello)
```

### cURL Examples

```bash
# Health check
curl -X GET https://api.example.com/api/status

# Hello world with query parameter
curl -X GET "https://api.example.com/api/hello?name=John"

# Hello world with POST data
curl -X POST https://api.example.com/api/hello \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "message": "Hello from cURL"
  }'

# With authentication (future)
curl -X GET https://api.example.com/api/users \
  -H "Authorization: Bearer your-jwt-token"

# Create user (future)
curl -X POST https://api.example.com/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

## 📚 SDK and Client Libraries

### TypeScript/JavaScript SDK

```typescript
// @types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

// sdk.ts
export class PlaygroundApiSdk {
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data;
  }
  
  // Health check
  async getStatus() {
    return this.request<{
      status: string;
      environment: string;
      version: string;
      uptime: number;
    }>('/api/status');
  }
  
  // Hello endpoint
  async hello(name?: string) {
    const url = name ? `/api/hello?name=${encodeURIComponent(name)}` : '/api/hello';
    return this.request<{ message: string }>('/api/hello');
  }
  
  async sayHello(data: { name: string; message: string }) {
    return this.request<{ message: string }>('/api/hello', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Users (future implementation)
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    
    const url = `/api/users${query.toString() ? `?${query}` : ''}`;
    return this.request<{ users: User[]; pagination: any }>(url);
  }
  
  async createUser(data: { name: string; email: string; password: string }) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async getUser(userId: string) {
    return this.request<User>(`/api/users/${userId}`);
  }
  
  async updateUser(userId: string, data: Partial<User>) {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async deleteUser(userId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

// Usage
const sdk = new PlaygroundApiSdk('https://api.example.com', 'your-api-key');

// Use with async/await
const status = await sdk.getStatus();
console.log('API Status:', status.data);

// Use with promises
sdk.hello('John')
  .then(response => console.log('Hello response:', response.data))
  .catch(error => console.error('Error:', error));
```

### Environment-specific Configuration

```typescript
// config/api.ts
export const apiConfig = {
  development: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  staging: {
    baseUrl: 'https://staging-api.example.com',
    timeout: 5000,
  },
  production: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  },
};

export function getApiConfig() {
  const env = process.env.NODE_ENV || 'development';
  return apiConfig[env as keyof typeof apiConfig];
}
```

## 🔍 Testing the API

### Unit Testing

```typescript
// __tests__/api.test.ts
import { PlaygroundApiSdk } from '../sdk';

describe('Playground API SDK', () => {
  const sdk = new PlaygroundApiSdk('http://localhost:3000');
  
  test('should get API status', async () => {
    const response = await sdk.getStatus();
    
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('healthy');
  });
  
  test('should say hello', async () => {
    const response = await sdk.hello('Test');
    
    expect(response.success).toBe(true);
    expect(response.data?.message).toContain('Test');
  });
});
```

### Integration Testing

```bash
# Test with Newman (Postman CLI)
npm install -g newman

# Run Postman collection
newman run api-tests.postman_collection.json \
  --environment production.postman_environment.json
```

## 📊 Monitoring and Analytics

### Request Logging

All API requests are automatically logged with:
- Request ID
- HTTP method and path
- Response status code
- Response time
- User agent
- IP address (when available)

### Metrics Available

- **Request Count**: Total API requests
- **Response Time**: Average response time per endpoint
- **Error Rate**: Percentage of failed requests
- **Status Codes**: Distribution of HTTP status codes
- **Geographic Distribution**: Requests by region

### Accessing Logs

```bash
# View API logs
aws logs tail /aws/lambda/nextjs-playground-prod --follow

# Filter by endpoint
aws logs filter-log-events \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --filter-pattern "/api/hello"

# Get performance metrics
aws logs start-query \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @duration | filter @message like /api/ | stats avg(@duration)'
```

## 🔮 Future Enhancements

### Planned Features

1. **Authentication**: JWT-based authentication
2. **User Management**: Full CRUD operations for users
3. **Session Management**: Session creation and management
4. **File Upload**: Support for file uploads to S3
5. **WebSocket Support**: Real-time features
6. **GraphQL API**: Alternative to REST API
7. **API Versioning**: Support for multiple API versions
8. **Advanced Rate Limiting**: Per-user rate limiting
9. **Caching**: Response caching with Redis
10. **Documentation**: Interactive API documentation with Swagger

### Contribution

To contribute to the API development:

1. Fork the repository
2. Create a feature branch
3. Add tests for new endpoints
4. Update this documentation
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.