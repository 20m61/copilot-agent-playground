# Testing Guide

Comprehensive testing strategies and procedures for the Next.js Serverless Playground.

## 📋 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [API Testing](#api-testing)
6. [Infrastructure Testing](#infrastructure-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)

## 🎯 Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \ (Few, High-value scenarios)
     /______\
    /        \
   /Integration\ (Service boundaries)
  /____________\
 /              \
/  Unit Testing  \ (Many, Fast, Isolated)
\________________/
```

### Test Types Overview

| Test Type | Purpose | Tools | Frequency |
|-----------|---------|-------|-----------|
| **Unit** | Component/function logic | Jest, Testing Library | Every commit |
| **Integration** | API endpoints, database | Supertest, Test containers | Every PR |
| **E2E** | User workflows | Playwright, Cypress | Before release |
| **Performance** | Load, stress testing | Artillery, k6 | Weekly/monthly |
| **Security** | Vulnerability scanning | OWASP ZAP, Snyk | Every build |

## 🧪 Unit Testing

### Setup

```bash
# Install testing dependencies
cd nextjs-app
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest-environment-jsdom
```

### Jest Configuration

```javascript
// nextjs-app/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
```

### Jest Setup

```javascript
// nextjs-app/jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
};
```

### Component Testing

```typescript
// nextjs-app/src/__tests__/components/Navigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';

describe('Navigation Component', () => {
  const defaultProps = {
    currentPath: '/',
  };

  it('renders all navigation links', () => {
    render(<Navigation {...defaultProps} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('highlights the current page', () => {
    render(<Navigation currentPath="/about" />);
    
    const aboutLink = screen.getByText('About');
    expect(aboutLink.closest('a')).toHaveClass('active');
  });

  it('navigates when link is clicked', () => {
    const mockPush = jest.fn();
    jest.doMock('next/router', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(<Navigation {...defaultProps} />);
    
    fireEvent.click(screen.getByText('About'));
    expect(mockPush).toHaveBeenCalledWith('/about');
  });
});
```

### Utility Function Testing

```typescript
// nextjs-app/src/__tests__/lib/utils.test.ts
import { formatDate, validateEmail, sanitizeInput } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('January 15, 2024');
    });

    it('handles invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('Invalid Date');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('removes dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World');
    });

    it('preserves safe content', () => {
      expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
    });
  });
});
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Navigation.test.tsx

# Run tests matching pattern
npm test --testNamePattern="validates email"
```

## 🔗 Integration Testing

### API Route Testing

```typescript
// nextjs-app/src/__tests__/api/hello.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/hello';

describe('/api/hello', () => {
  it('returns hello message', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toEqual({
      message: 'Hello, World!',
      timestamp: expect.any(String),
    });
  });

  it('handles POST requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('Test User');
  });

  it('returns 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
```

### Database Integration Testing

```typescript
// nextjs-app/src/__tests__/integration/database.test.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createSession, getSession } from '@/lib/db';

// Use local DynamoDB for testing
const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

describe('Database Integration', () => {
  beforeAll(async () => {
    // Setup test table
    await setupTestTable();
  });

  afterAll(async () => {
    // Cleanup test table
    await cleanupTestTable();
  });

  beforeEach(async () => {
    // Clear test data
    await clearTestData();
  });

  it('creates and retrieves session', async () => {
    const sessionId = 'test-session-123';
    const sessionData = {
      userId: 'user-456',
      createdAt: new Date().toISOString(),
    };

    // Create session
    await createSession(sessionId, sessionData);

    // Retrieve session
    const retrievedSession = await getSession(sessionId);

    expect(retrievedSession).toMatchObject({
      sessionId,
      ...sessionData,
    });
  });

  it('handles non-existent sessions', async () => {
    const result = await getSession('non-existent');
    expect(result).toBeNull();
  });
});
```

### Service Integration Testing

```typescript
// nextjs-app/src/__tests__/integration/services.test.ts
import { userService } from '@/lib/services/userService';
import { setupTestDB, teardownTestDB } from '@/test-utils/db';

describe('User Service Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('creates user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const user = await userService.createUser(userData);

    expect(user).toMatchObject(userData);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('validates user data', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
    };

    await expect(userService.createUser(invalidData))
      .rejects.toThrow('Validation failed');
  });
});
```

## 🖥️ End-to-End Testing

### Playwright Setup

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

### Playwright Configuration

```javascript
// nextjs-app/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// nextjs-app/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays content', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Next.js Playground/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Next.js Playground');

    // Check navigation
    await expect(page.locator('nav')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Click About link
    await page.click('text=About');
    await expect(page).toHaveURL('/about');

    // Check about page content
    await expect(page.locator('h1')).toContainText('About');
  });

  test('API endpoints work', async ({ page }) => {
    const response = await page.request.get('/api/status');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
  });
});
```

```typescript
// nextjs-app/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test('complete user flow', async ({ page }) => {
    // Start at homepage
    await page.goto('/');

    // Navigate to about page
    await page.click('text=About');
    await expect(page).toHaveURL('/about');

    // Test API interaction
    await page.click('button:has-text("Test API")');
    
    // Wait for API response
    await page.waitForResponse('/api/hello');
    
    // Check result
    await expect(page.locator('[data-testid="api-result"]'))
      .toContainText('Hello, World!');

    // Test form submission (if exists)
    await page.fill('input[name="message"]', 'Test message');
    await page.click('button:has-text("Send")');
    
    // Verify success message
    await expect(page.locator('.success-message'))
      .toBeVisible();
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test homepage.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Debug tests
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## 🌐 API Testing

### Supertest Setup

```bash
npm install --save-dev supertest @types/supertest
```

### API Test Examples

```typescript
// nextjs-app/src/__tests__/api/integration.test.ts
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server: any;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });
});

afterAll(() => {
  server.close();
});

describe('API Integration Tests', () => {
  test('GET /api/status', async () => {
    const response = await request(server)
      .get('/api/status')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'healthy',
      timestamp: expect.any(String),
    });
  });

  test('GET /api/hello', async () => {
    const response = await request(server)
      .get('/api/hello')
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  test('POST /api/hello with valid data', async () => {
    const testData = { name: 'Test User' };

    const response = await request(server)
      .post('/api/hello')
      .send(testData)
      .expect(200);

    expect(response.body.message).toContain('Test User');
  });

  test('POST /api/hello with invalid data', async () => {
    const invalidData = { name: '' };

    await request(server)
      .post('/api/hello')
      .send(invalidData)
      .expect(400);
  });
});
```

### API Contract Testing

```typescript
// nextjs-app/src/__tests__/api/contracts.test.ts
import { z } from 'zod';
import request from 'supertest';

// Define API schemas
const StatusResponseSchema = z.object({
  status: z.literal('healthy'),
  timestamp: z.string(),
  version: z.string().optional(),
});

const HelloResponseSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
});

describe('API Contract Tests', () => {
  test('/api/status conforms to schema', async () => {
    const response = await request(server)
      .get('/api/status')
      .expect(200);

    expect(() => StatusResponseSchema.parse(response.body))
      .not.toThrow();
  });

  test('/api/hello conforms to schema', async () => {
    const response = await request(server)
      .get('/api/hello')
      .expect(200);

    expect(() => HelloResponseSchema.parse(response.body))
      .not.toThrow();
  });
});
```

## 🏗️ Infrastructure Testing

### CDK Testing

```typescript
// infrastructure/test/stacks.test.ts
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SharedStack } from '../lib/stacks/shared-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';

describe('Infrastructure Tests', () => {
  let app: App;
  let sharedStack: SharedStack;
  let frontendStack: FrontendStack;

  beforeEach(() => {
    app = new App();
    sharedStack = new SharedStack(app, 'TestSharedStack', {
      stage: 'test',
    });
    frontendStack = new FrontendStack(app, 'TestFrontendStack', {
      stage: 'test',
      sharedStack,
    });
  });

  test('creates S3 bucket', () => {
    const template = Template.fromStack(sharedStack);
    
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('creates Lambda function with correct runtime', () => {
    const template = Template.fromStack(frontendStack);
    
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Handler: 'index.handler',
    });
  });

  test('creates CloudFront distribution', () => {
    const template = Template.fromStack(sharedStack);
    
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Enabled: true,
      },
    });
  });

  test('sets up proper IAM permissions', () => {
    const template = Template.fromStack(frontendStack);
    
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ],
          },
        ],
      },
    });
  });
});
```

### Infrastructure Integration Testing

```bash
# infrastructure/test/integration.test.sh
#!/bin/bash

# Deploy test stack
cdk deploy TestStack --require-approval never

# Test endpoints
curl -f https://test-api-endpoint.execute-api.us-east-1.amazonaws.com/test/health

# Test Lambda function
aws lambda invoke \
  --function-name test-nextjs-function \
  --payload '{"test": true}' \
  response.json

# Verify response
cat response.json | jq '.statusCode' | grep -q '200'

# Cleanup
cdk destroy TestStack --force
```

## ⚡ Performance Testing

### Load Testing with Artillery

```bash
npm install --save-dev artillery
```

```yaml
# nextjs-app/performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
    - duration: 60
      arrivalRate: 100
      name: Peak load

scenarios:
  - name: Homepage flow
    flow:
      - get:
          url: '/'
      - think: 2
      - get:
          url: '/about'
      - think: 1
      - get:
          url: '/api/status'
```

```bash
# Run load test
npx artillery run performance/load-test.yml
```

### Lighthouse Performance Testing

```typescript
// nextjs-app/src/__tests__/performance/lighthouse.test.ts
import lighthouse from 'lighthouse';
import { launch } from 'puppeteer';

describe('Performance Tests', () => {
  test('homepage meets performance thresholds', async () => {
    const browser = await launch({ headless: true });
    const { lhr } = await lighthouse('http://localhost:3000', {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      logLevel: 'info',
    });

    expect(lhr.categories.performance.score).toBeGreaterThan(0.9);
    expect(lhr.categories.accessibility.score).toBeGreaterThan(0.9);
    expect(lhr.categories['best-practices'].score).toBeGreaterThan(0.9);

    await browser.close();
  });
});
```

## 🔒 Security Testing

### Dependency Vulnerability Testing

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for high severity issues only
npm audit --audit-level high
```

### OWASP ZAP Integration

```bash
# Run ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000
```

### Security Headers Testing

```typescript
// nextjs-app/src/__tests__/security/headers.test.ts
import request from 'supertest';

describe('Security Headers', () => {
  test('sets security headers', async () => {
    const response = await request(server)
      .get('/')
      .expect(200);

    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers['strict-transport-security']).toBeDefined();
  });
});
```

## 📊 Test Reporting and Coverage

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### CI Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:coverage
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎯 Best Practices

1. **Write tests first** (TDD approach)
2. **Keep tests simple and focused**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test error conditions**
6. **Maintain high coverage**
7. **Run tests in CI/CD**
8. **Regular security scanning**