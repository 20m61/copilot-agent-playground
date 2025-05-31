# Troubleshooting Guide

Comprehensive guide for diagnosing and resolving common issues in the Next.js Serverless Playground.

## 📋 Table of Contents

1. [Common Issues](#common-issues)
2. [Development Issues](#development-issues)
3. [Build and Deployment Issues](#build-and-deployment-issues)
4. [Runtime Issues](#runtime-issues)
5. [Infrastructure Issues](#infrastructure-issues)
6. [Performance Issues](#performance-issues)
7. [Security Issues](#security-issues)
8. [Monitoring and Debugging](#monitoring-and-debugging)

## 🚨 Common Issues

### Application Won't Start

#### Issue: `npm run dev` fails
```bash
Error: Cannot find module 'next'
```

**Solution:**
```bash
cd nextjs-app
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
```bash
# Option 1: Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm run dev

# Option 3: Find and kill specific process
npx kill-port 3000
```

### TypeScript Errors

#### Issue: Module not found errors
```typescript
Cannot find module '@/components/Navigation' or its corresponding type declarations.
```

**Solution:**
Check `tsconfig.json` paths configuration:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

#### Issue: Type errors in production build
```bash
Type error: Property 'xyz' does not exist on type 'unknown'.
```

**Solutions:**
```typescript
// Add proper type definitions
interface MyData {
  xyz: string;
}

// Use type assertion carefully
const data = response as MyData;

// Add type guards
function isValidData(data: unknown): data is MyData {
  return typeof data === 'object' && data !== null && 'xyz' in data;
}
```

### Environment Variables

#### Issue: Environment variables not working
```javascript
console.log(process.env.MY_VAR); // undefined
```

**Solutions:**
```bash
# 1. Check file naming
# Client-side: NEXT_PUBLIC_* in .env.local
# Server-side: Any name in .env.local

# 2. Restart development server
npm run dev

# 3. Verify .env.local exists and has correct format
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
```

## 🔧 Development Issues

### Hot Reload Not Working

#### Issue: Changes not reflected in browser

**Solutions:**
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Restart development server
npm run dev

# 3. Check file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 4. Disable antivirus real-time scanning on project folder
```

### CSS and Styling Issues

#### Issue: Tailwind classes not working

**Solutions:**
```javascript
// 1. Check tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}

// 2. Import Tailwind in globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// 3. Restart development server
npm run dev
```

#### Issue: Custom CSS not loading
```bash
# Check import order in layout.tsx
import './globals.css'; // Should be at the top
```

### API Route Issues

#### Issue: API route returning 404
```bash
GET /api/hello 404
```

**Solutions:**
```bash
# 1. Check file structure
# App Router: src/app/api/hello/route.ts
# Pages Router: src/pages/api/hello.ts

# 2. Verify export format
// App Router
export async function GET() { /* ... */ }

// Pages Router  
export default function handler(req, res) { /* ... */ }

# 3. Restart development server
npm run dev
```

## 🏗️ Build and Deployment Issues

### Next.js Build Failures

#### Issue: Build fails with TypeScript errors
```bash
Type checking and linting...
Failed to compile.
```

**Solutions:**
```bash
# 1. Run type check manually
npm run type-check

# 2. Fix TypeScript errors or temporarily skip
# next.config.js
module.exports = {
  typescript: {
    ignoreBuildErrors: true, // Only for temporary debugging
  },
}

# 3. Check for circular dependencies
npx madge --circular src/
```

#### Issue: Build fails with memory issues
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solutions:**
```bash
# 1. Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 2. Add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"

# 3. Optimize bundle size
npm run analyze
```

### CDK Deployment Issues

#### Issue: CDK bootstrap required
```bash
Need to perform AWS CDK bootstrap in this environment
```

**Solution:**
```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

#### Issue: Insufficient permissions
```bash
User: arn:aws:iam::123456789012:user/username is not authorized to perform: cloudformation:CreateStack
```

**Solutions:**
```bash
# 1. Check AWS credentials
aws sts get-caller-identity

# 2. Ensure proper IAM permissions
# Required policies: CloudFormation, IAM, Lambda, S3, etc.

# 3. Use administrator access for initial setup
aws iam attach-user-policy \
  --user-name your-username \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

#### Issue: CDK version mismatch
```bash
Cloud assembly schema version mismatch
```

**Solutions:**
```bash
# 1. Update CDK CLI
npm install -g aws-cdk@latest

# 2. Update CDK libraries
cd infrastructure
npm update aws-cdk-lib

# 3. Check version compatibility
cdk --version
npm list aws-cdk-lib
```

## 🚀 Runtime Issues

### Lambda Function Errors

#### Issue: Lambda timeout
```bash
Task timed out after 30.00 seconds
```

**Solutions:**
```typescript
// 1. Increase timeout in CDK
this.nextjsFunction = new lambda.Function(this, 'NextjsFunction', {
  timeout: cdk.Duration.seconds(60), // Increase from 30
  // ...
});

// 2. Optimize function performance
// - Reduce bundle size
// - Use connection pooling
// - Implement caching
```

#### Issue: Lambda out of memory
```bash
Runtime.ExitError: RequestId: ... Process exited before completing request
```

**Solutions:**
```typescript
// 1. Increase memory allocation
this.nextjsFunction = new lambda.Function(this, 'NextjsFunction', {
  memorySize: 1024, // Increase from 512
  // ...
});

// 2. Monitor memory usage
// Check CloudWatch metrics for actual usage
```

#### Issue: Cold start performance
```bash
Lambda initialization taking too long
```

**Solutions:**
```typescript
// 1. Enable provisioned concurrency
const version = this.nextjsFunction.currentVersion;
new lambda.Alias(this, 'ProdAlias', {
  aliasName: 'PROD',
  version,
  provisionedConcurrencyConfig: {
    provisionedConcurrentExecutions: 5,
  },
});

// 2. Optimize bundle size
// - Use dynamic imports
// - Remove unused dependencies
// - Enable tree shaking

// 3. Keep functions warm
// Use CloudWatch Events to ping periodically
```

### Database Issues

#### Issue: DynamoDB throttling
```bash
ProvisionedThroughputExceededException
```

**Solutions:**
```typescript
// 1. Switch to on-demand billing
new dynamodb.Table(this, 'Table', {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  // ...
});

// 2. Add exponential backoff
const params = {
  TableName: 'MyTable',
  // ...
};

const command = new GetCommand(params);
await retryWithBackoff(() => dynamoClient.send(command));
```

#### Issue: DynamoDB connection errors
```bash
NetworkingError: connect ECONNREFUSED
```

**Solutions:**
```typescript
// 1. Check AWS credentials
console.log(process.env.AWS_REGION);
console.log(process.env.AWS_ACCESS_KEY_ID ? 'Credentials set' : 'No credentials');

// 2. Configure region explicitly
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// 3. Use VPC endpoints if in VPC
// Configure VPC endpoint for DynamoDB
```

## 🏗️ Infrastructure Issues

### CloudFormation Stack Issues

#### Issue: Stack stuck in UPDATE_ROLLBACK_FAILED
```bash
The following resource(s) failed to update: [LogicalResourceId]
```

**Solutions:**
```bash
# 1. Continue rollback
aws cloudformation continue-update-rollback \
  --stack-name your-stack-name

# 2. Skip problematic resources
aws cloudformation continue-update-rollback \
  --stack-name your-stack-name \
  --resources-to-skip LogicalResourceId

# 3. Delete and recreate stack if safe
cdk destroy
cdk deploy
```

#### Issue: Resource already exists
```bash
Resource already exists
```

**Solutions:**
```bash
# 1. Import existing resource
cdk import

# 2. Delete resource manually
aws s3 rb s3://bucket-name --force

# 3. Use different resource names
const bucket = new s3.Bucket(this, 'Bucket', {
  bucketName: `my-bucket-${stage}-${Date.now()}`,
});
```

### CloudFront Issues

#### Issue: CloudFront distribution creation takes long
```bash
CloudFront distribution deployment in progress...
```

**Solutions:**
```bash
# 1. This is normal - can take 15-45 minutes
# Monitor progress:
aws cloudfront get-distribution \
  --id DISTRIBUTION_ID \
  --query 'Distribution.Status'

# 2. Use existing distribution for development
# Import existing distribution ID in CDK
```

#### Issue: CloudFront cache not updating
```bash
Old content still served despite deployment
```

**Solutions:**
```bash
# 1. Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"

# 2. Add cache busting to static assets
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

# 3. Use versioned paths
/_next/static/[buildId]/...
```

## ⚡ Performance Issues

### Slow Page Loads

#### Issue: Large bundle size
```bash
Warning: Bundle size exceeds recommended limit
```

**Solutions:**
```bash
# 1. Analyze bundle
npm run build
npm run analyze

# 2. Use dynamic imports
const MyComponent = dynamic(() => import('./MyComponent'), {
  loading: () => <div>Loading...</div>,
});

# 3. Optimize images
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
};
```

#### Issue: Slow API responses
```bash
API requests taking > 5 seconds
```

**Solutions:**
```typescript
// 1. Add request caching
import { unstable_cache } from 'next/cache';

const getCachedData = unstable_cache(
  async () => {
    return await fetchExpensiveData();
  },
  ['cache-key'],
  { revalidate: 3600 } // 1 hour
);

// 2. Use database connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 3. Optimize database queries
// Add indexes, use proper WHERE clauses
```

### Memory Leaks

#### Issue: Memory usage increasing over time
```bash
Process memory usage growing continuously
```

**Solutions:**
```typescript
// 1. Clear intervals and timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // do something
  }, 1000);
  
  return () => clearInterval(interval); // Cleanup
}, []);

// 2. Remove event listeners
useEffect(() => {
  const handleResize = () => {
    // handle resize
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 3. Monitor memory usage
// Use Chrome DevTools Memory tab
// Add memory profiling in production
```

## 🔒 Security Issues

### Authentication Issues

#### Issue: JWT token invalid
```bash
JsonWebTokenError: invalid signature
```

**Solutions:**
```typescript
// 1. Check JWT secret
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

// 2. Verify token correctly
import jwt from 'jsonwebtoken';

try {
  const decoded = jwt.verify(token, secret);
  // Token is valid
} catch (error) {
  // Token is invalid
  console.error('JWT verification failed:', error.message);
}

// 3. Check token expiration
const payload = {
  userId: user.id,
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
};
```

### CORS Issues

#### Issue: CORS policy blocking requests
```bash
Access to fetch has been blocked by CORS policy
```

**Solutions:**
```typescript
// 1. Configure CORS in API routes
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'success' });
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// 2. Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## 📊 Monitoring and Debugging

### CloudWatch Logs

#### Viewing Application Logs
```bash
# Lambda function logs
aws logs tail /aws/lambda/nextjs-playground-prod --follow

# Filter for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --filter-pattern "ERROR"

# Get recent logs
aws logs describe-log-streams \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --order-by LastEventTime \
  --descending \
  --max-items 1
```

#### Using Log Insights
```sql
-- Find errors in the last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- Performance analysis
fields @timestamp, @duration, @billedDuration, @memorySize, @maxMemoryUsed
| filter @type = "REPORT"
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)

-- Cold start analysis
fields @timestamp, @initDuration
| filter @type = "REPORT" and @initDuration > 0
| stats count() as coldStarts, avg(@initDuration) as avgInitDuration by bin(1h)
```

### Application Debugging

#### Client-Side Debugging
```typescript
// 1. Use browser developer tools
console.log('Debug info:', { data, state });

// 2. Add error boundaries
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// 3. Use React Developer Tools
// Install browser extension for component inspection
```

#### Server-Side Debugging
```typescript
// 1. Add detailed logging
console.log('[API] Request received:', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers.entries()),
});

// 2. Use debugger in development
if (process.env.NODE_ENV === 'development') {
  debugger; // Will pause execution in Node.js debugger
}

// 3. Add error context
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', {
    error: error.message,
    stack: error.stack,
    context: { /* relevant context */ },
  });
  throw error;
}
```

### Performance Monitoring

#### Setting Up Monitoring
```typescript
// 1. Add performance marks
performance.mark('api-start');
// ... API operation
performance.mark('api-end');
performance.measure('api-duration', 'api-start', 'api-end');

// 2. Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// 3. Custom metrics
const responseTime = Date.now() - startTime;
console.log(`API response time: ${responseTime}ms`);
```

## 🆘 Getting Additional Help

### Log Collection
When reporting issues, collect relevant logs:

```bash
# Application logs
npm run dev > app.log 2>&1

# CDK deployment logs
cdk deploy 2>&1 | tee cdk-deploy.log

# AWS CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name your-stack-name \
  --output table

# System information
node --version
npm --version
aws --version
```

### Useful Commands
```bash
# Check system resources
free -h              # Memory usage
df -h               # Disk usage
top                 # CPU usage

# Network diagnostics
curl -I https://api.example.com/health
dig api.example.com
nslookup api.example.com

# Process management
ps aux | grep node  # Find Node.js processes
lsof -i :3000      # Check what's using port 3000
```

### Support Channels
1. **GitHub Issues**: For bug reports and feature requests
2. **Documentation**: Check `/docs` directory
3. **AWS Support**: For infrastructure-related issues
4. **Next.js Community**: For framework-specific questions
5. **Stack Overflow**: For general development questions

Remember to provide:
- Error messages (full stack traces)
- Environment details (OS, Node.js version, etc.)
- Steps to reproduce
- Expected vs actual behavior
- Relevant configuration files