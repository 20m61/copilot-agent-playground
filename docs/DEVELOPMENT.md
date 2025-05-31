# Development Guide

A comprehensive guide for setting up and developing with the Next.js Serverless Playground.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing Strategy](#testing-strategy)
7. [Debugging](#debugging)
8. [Performance Optimization](#performance-optimization)

## 🔧 Prerequisites

### Required Software

```bash
# Node.js (v18+ required)
# Download from https://nodejs.org/
node --version  # Should be 18.0.0 or higher

# npm (comes with Node.js)
npm --version   # Should be 8.0.0 or higher

# AWS CLI v2
# Download from https://aws.amazon.com/cli/
aws --version

# Git
git --version

# AWS CDK CLI (optional, for infrastructure development)
npm install -g aws-cdk
cdk --version
```

### Recommended Tools

```bash
# VS Code with extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
code --install-extension GitHub.copilot

# GitHub CLI
gh --version

# Docker (for containerized development)
docker --version
```

## 🚀 Development Environment Setup

### 1. Repository Setup

```bash
# Fork the repository (if contributing)
gh repo fork 20m61/copilot-agent-playground

# Clone your fork
git clone https://github.com/YOUR_USERNAME/copilot-agent-playground.git
cd copilot-agent-playground

# Add upstream remote
git remote add upstream https://github.com/20m61/copilot-agent-playground.git
```

### 2. Install Dependencies

```bash
# Install Next.js dependencies
cd nextjs-app
npm install

# Install infrastructure dependencies
cd ../infrastructure
npm install
```

### 3. AWS Configuration

```bash
# Configure AWS credentials
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 4. Environment Variables

Create local environment files:

```bash
# nextjs-app/.env.local
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_VERSION=local

# For local DynamoDB (optional)
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=nextjs-playground-dev

# For local testing with AWS services
AWS_REGION=us-east-1
```

### 5. VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## 📁 Project Structure

### Overview

```
copilot-agent-playground/
├── nextjs-app/                 # Next.js application
│   ├── src/
│   │   ├── app/               # App Router (Next.js 13+)
│   │   │   ├── api/           # API routes
│   │   │   ├── globals.css    # Global styles
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   └── components/        # Reusable components
│   ├── public/                # Static assets
│   ├── package.json
│   └── next.config.ts
├── infrastructure/             # AWS CDK infrastructure
│   ├── bin/
│   │   └── app.ts            # CDK app entry point
│   ├── lib/
│   │   ├── stacks/           # CDK stacks
│   │   └── constructs/       # Reusable constructs
│   └── package.json
├── .github/
│   └── workflows/            # GitHub Actions
├── docs/                     # Documentation
└── README.md
```

### Next.js Application Structure

```
nextjs-app/src/
├── app/
│   ├── api/                  # API routes
│   │   ├── hello/
│   │   │   └── route.ts      # GET /api/hello
│   │   └── status/
│   │       └── route.ts      # GET /api/status
│   ├── about/
│   │   └── page.tsx          # /about page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (/)
├── components/
│   └── Navigation.tsx        # Navigation component
└── lib/                      # Utility functions
    ├── utils.ts              # General utilities
    ├── db.ts                 # Database helpers
    └── api.ts                # API helpers
```

### Infrastructure Structure

```
infrastructure/lib/
├── stacks/
│   ├── shared-stack.ts       # S3, CloudFront, common resources
│   ├── frontend-stack.ts     # Lambda, API Gateway, DynamoDB
│   ├── cicd-stack.ts         # CI/CD pipeline
│   └── monitoring-stack.ts   # CloudWatch, alarms, dashboards
├── constructs/
│   ├── nextjs-optimized.ts   # Optimized Lambda construct
│   └── logging-construct.ts  # Centralized logging
└── utils/
    └── helpers.ts            # CDK utilities
```

## 🔄 Development Workflow

### Daily Development

```bash
# Start development session
cd nextjs-app
npm run dev

# In another terminal, watch for changes
npm run type-check -- --watch

# Run linting
npm run lint

# Run tests
npm test -- --watch
```

### Feature Development

```bash
# 1. Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create feature branch
git checkout -b feature/user-authentication

# 3. Develop feature
# ... make changes ...

# 4. Test changes
npm run lint
npm run type-check
npm run test
npm run build

# 5. Commit changes
git add .
git commit -m "feat: add user authentication system"

# 6. Push and create PR
git push origin feature/user-authentication
gh pr create --title "Add user authentication" --body "Implements JWT-based auth"
```

### Infrastructure Development

```bash
# Navigate to infrastructure
cd infrastructure

# Compile TypeScript
npm run build

# Synthesize CloudFormation
npm run synth

# Deploy to development environment
npm run cdk deploy -- --all --context stage=dev

# Compare with deployed stack
npm run cdk diff -- --context stage=dev
```

## 📝 Code Standards

### TypeScript Configuration

```json
// nextjs-app/tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

### ESLint Configuration

```javascript
// nextjs-app/eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Customize rules
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];

export default eslintConfig;
```

### Code Style Guidelines

#### Component Structure

```typescript
// Good component structure
import React from 'react';
import { ComponentProps } from '@/types';
import { utility } from '@/lib/utils';

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ExampleComponent({ 
  title, 
  children, 
  className = '' 
}: Props) {
  // Hooks first
  const [state, setState] = React.useState(false);
  
  // Event handlers
  const handleClick = () => {
    setState(!state);
  };
  
  // Render
  return (
    <div className={`base-styles ${className}`}>
      <h1>{title}</h1>
      <button onClick={handleClick}>
        Toggle
      </button>
      {children}
    </div>
  );
}
```

#### API Route Structure

```typescript
// nextjs-app/src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  try {
    // Implementation
    const users = await getUsers();
    
    return NextResponse.json({ 
      users,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateUserSchema.parse(body);
    
    // Create user
    const user = await createUser(validatedData);
    
    return NextResponse.json(
      { user, success: true },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Naming Conventions

- **Files**: `kebab-case.tsx`, `PascalCase.tsx` for components
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`

## 🧪 Testing Strategy

### Unit Testing

```typescript
// nextjs-app/src/__tests__/components/Navigation.test.tsx
import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
  
  it('highlights current page', () => {
    render(<Navigation currentPath="/about" />);
    
    const aboutLink = screen.getByText('About');
    expect(aboutLink).toHaveClass('active');
  });
});
```

### API Testing

```typescript
// nextjs-app/src/__tests__/api/hello.test.ts
import { GET } from '@/app/api/hello/route';
import { NextRequest } from 'next/server';

describe('/api/hello', () => {
  it('returns hello message', async () => {
    const request = new NextRequest('http://localhost:3000/api/hello');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message', 'Hello, World!');
  });
});
```

### Integration Testing

```typescript
// nextjs-app/src/__tests__/integration/user-flow.test.ts
import { test, expect } from '@playwright/test';

test('user can navigate and interact', async ({ page }) => {
  await page.goto('/');
  
  // Check homepage
  await expect(page.locator('h1')).toContainText('Next.js Playground');
  
  // Navigate to about page
  await page.click('text=About');
  await expect(page).toHaveURL('/about');
  
  // Check API call
  const response = await page.request.get('/api/status');
  expect(response.status()).toBe(200);
});
```

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# Integration tests (if Playwright is set up)
npm run test:e2e

# Watch mode
npm run test:watch
```

## 🐛 Debugging

### Local Debugging

#### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Console Debugging

```typescript
// Add debug logs
console.log('Debug info:', { variable, state });

// Use debugger statement
debugger;

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.debug('Development debug info');
}
```

### AWS Debugging

#### Local DynamoDB

```bash
# Install DynamoDB Local
npm install -g dynamodb-admin

# Start local DynamoDB
docker run -p 8000:8000 amazon/dynamodb-local

# Start DynamoDB admin interface
dynamodb-admin
```

#### Lambda Local Testing

```bash
# Using AWS SAM (if configured)
sam local start-api

# Or test individual function
sam local invoke NextjsFunction --event test-event.json
```

### Production Debugging

```bash
# View Lambda logs
aws logs tail /aws/lambda/nextjs-playground-prod --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --filter-pattern "ERROR"

# View API Gateway logs
aws logs tail /aws/apigateway/nextjs-playground-prod --follow
```

## ⚡ Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze  # If analyzer is configured

# Check for large dependencies
npm ls --depth=0
```

### Next.js Optimizations

```typescript
// next.config.ts
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};
```

### Lambda Performance

```typescript
// Optimize cold starts
export const config = {
  runtime: 'nodejs18.x',
  memorySize: 1024, // Adjust based on needs
  timeout: 30,
};

// Connection reuse
const httpClient = new HttpClient({
  keepAlive: true,
  maxSockets: 50,
});
```

### Monitoring Performance

```bash
# Monitor Core Web Vitals
# Use built-in Next.js analytics or add custom tracking

# Monitor API performance
# Add timing logs to API routes

# Monitor Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=nextjs-playground-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

## 💡 Tips and Tricks

1. **Use TypeScript strictly** - Enable all strict checks
2. **Leverage VS Code extensions** - Install recommended extensions
3. **Hot reload everything** - Use watch modes for faster development
4. **Debug with source maps** - Enable source maps in development
5. **Profile regularly** - Use browser dev tools and monitoring
6. **Test early and often** - Write tests as you develop
7. **Use linting hooks** - Set up pre-commit hooks
8. **Document as you go** - Keep documentation up to date