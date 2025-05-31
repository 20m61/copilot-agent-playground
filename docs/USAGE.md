# Usage Guide

This guide provides comprehensive instructions for using the Next.js Serverless Playground in different environments and scenarios.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Environment Management](#environment-management)
4. [Deployment Workflows](#deployment-workflows)
5. [Feature Usage](#feature-usage)
6. [Common Tasks](#common-tasks)
7. [Best Practices](#best-practices)

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version
npm --version

# Check AWS CLI configuration
aws configure list

# Check Git configuration
git config --list
```

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/20m61/copilot-agent-playground.git
   cd copilot-agent-playground
   ```

2. **Install dependencies:**
   ```bash
   # Next.js application
   cd nextjs-app
   npm install

   # Infrastructure
   cd ../infrastructure
   npm install
   ```

3. **Configure AWS credentials:**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
   ```

## 💻 Local Development

### Running the Next.js Application

```bash
cd nextjs-app

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**Available Development Commands:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server locally
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run tests
```

### Development Features

- **Hot Reload**: Changes are reflected immediately
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling
- **API Routes**: Server-side API endpoints

### Local Environment Variables

Create `.env.local` for local development:

```bash
# nextjs-app/.env.local
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your-local-db-url
```

## 🏢 Environment Management

### Environment Overview

| Environment | Purpose | Auto-Deploy | Manual Approval | Monitoring |
|-------------|---------|-------------|-----------------|------------|
| **Development** | Local development | ❌ | ❌ | Basic |
| **Staging** | Pre-production testing | ✅ (on master) | ❌ | Full |
| **Production** | Live application | ❌ | ✅ | Enhanced |

### Environment Configuration

Each environment has specific configurations:

#### Development Environment
```bash
# Deploy development environment
cd infrastructure
npx cdk deploy --all --context stage=dev

# Estimated cost: $5-15/month
```

#### Staging Environment
```bash
# Automatically deployed on master branch push
# Manual deployment:
npx cdk deploy --all --context stage=staging

# Estimated cost: $10-25/month
```

#### Production Environment
```bash
# Requires manual approval in GitHub Actions
# Or manual deployment:
npx cdk deploy --all --context stage=prod

# Estimated cost: $20-100/month (scales with usage)
```

## 🔄 Deployment Workflows

### Automated Deployment (Recommended)

#### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... code changes ...

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/your-feature-name

# Create pull request
gh pr create --title "Add new feature" --body "Description of changes"
```

#### 2. Staging Deployment
```bash
# Merge to master triggers automatic staging deployment
gh pr merge --squash

# Monitor deployment
gh run list
```

#### 3. Production Deployment
```bash
# Trigger production deployment via GitHub Actions
gh workflow run deploy.yml -f environment=production

# Or use GitHub web interface:
# Actions → Deploy Pipeline → Run workflow → production
```

### Manual Deployment

#### CDK Direct Deployment
```bash
cd infrastructure

# Bootstrap (first time only)
npx cdk bootstrap

# Deploy to specific environment
npx cdk deploy --all --context stage=dev
npx cdk deploy --all --context stage=staging
npx cdk deploy --all --context stage=prod

# Deploy specific stack
npx cdk deploy nextjs-playground-staging-frontend --context stage=staging
```

#### Rollback Deployment
```bash
# View deployment history
aws cloudformation describe-stack-events --stack-name nextjs-playground-prod-frontend

# Rollback using previous version
git checkout PREVIOUS_COMMIT_HASH
npx cdk deploy --all --context stage=prod
```

## ⚙️ Feature Usage

### API Endpoints

The application includes several API routes:

#### Health Check
```bash
curl https://your-domain.com/api/status
# Returns: {"status": "healthy", "timestamp": "..."}
```

#### Hello World
```bash
curl https://your-domain.com/api/hello
# Returns: {"message": "Hello, World!", "environment": "staging"}
```

### Custom API Development

1. **Create new API route:**
   ```typescript
   // nextjs-app/src/app/api/users/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     return NextResponse.json({ users: [] });
   }

   export async function POST(request: NextRequest) {
     const body = await request.json();
     // Handle user creation
     return NextResponse.json({ success: true });
   }
   ```

2. **Test locally:**
   ```bash
   curl http://localhost:3000/api/users
   ```

3. **Deploy and test:**
   ```bash
   git add .
   git commit -m "Add users API"
   git push origin main
   ```

### Database Integration

Example DynamoDB integration:

```typescript
// nextjs-app/src/lib/dynamodb.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(client);

export async function getSession(sessionId: string) {
  const command = new GetCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: { sessionId },
  });
  
  const response = await dynamo.send(command);
  return response.Item;
}

export async function createSession(sessionId: string, data: any) {
  const command = new PutCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      sessionId,
      ...data,
      ttl: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    },
  });
  
  await dynamo.send(command);
}
```

## 📋 Common Tasks

### Adding New Dependencies

```bash
cd nextjs-app

# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Update dependencies
npm update
```

### Environment Variables

#### Adding New Environment Variables

1. **Update CDK stacks:**
   ```typescript
   // infrastructure/lib/stacks/frontend-stack.ts
   this.nextjsFunction = new lambda.Function(this, 'NextjsFunction', {
     // ...
     environment: {
       NODE_ENV: props.stage === 'prod' ? 'production' : 'development',
       NEW_VARIABLE: props.stage === 'prod' ? 'prod-value' : 'dev-value',
     },
   });
   ```

2. **Use in Next.js:**
   ```typescript
   // nextjs-app/src/app/api/example/route.ts
   const newVariable = process.env.NEW_VARIABLE;
   ```

### Monitoring and Debugging

#### View Application Logs
```bash
# Lambda function logs
aws logs tail /aws/lambda/nextjs-playground-staging --follow

# API Gateway logs
aws logs tail /aws/apigateway/nextjs-playground-staging --follow

# Application logs (structured)
aws logs tail /aws/application/nextjs-playground-staging --follow
```

#### CloudWatch Metrics
```bash
# Get CloudWatch dashboard URL
aws cloudformation describe-stacks \
  --stack-name nextjs-playground-staging-monitoring \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
  --output text
```

### Performance Optimization

#### Lambda Cold Starts
```bash
# Monitor cold starts
aws logs start-query \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @initDuration | filter @type = "REPORT" and @initDuration > 0'
```

#### Cache Optimization
- Monitor CloudFront cache hit rates
- Adjust TTL values based on content type
- Use appropriate cache headers

### Cost Management

#### Monitor Costs
```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

#### Cost Optimization Tips
- Use appropriate Lambda memory settings
- Optimize DynamoDB capacity settings
- Set up CloudWatch log retention
- Monitor unused resources

## 🏆 Best Practices

### Development Workflow

1. **Always create feature branches**
2. **Write tests for new features**
3. **Run linting and type checking before commits**
4. **Use descriptive commit messages**
5. **Test in staging before production**

### Code Quality

1. **Follow TypeScript strict mode**
2. **Use ESLint rules consistently**
3. **Implement proper error handling**
4. **Add meaningful comments for complex logic**
5. **Keep functions small and focused**

### Security

1. **Never commit secrets or API keys**
2. **Use environment variables for configuration**
3. **Validate all inputs**
4. **Implement proper authentication**
5. **Keep dependencies updated**

### Performance

1. **Optimize bundle size**
2. **Use appropriate caching strategies**
3. **Monitor Lambda performance metrics**
4. **Implement error boundaries**
5. **Use CDN for static assets**

### Infrastructure

1. **Use infrastructure as code (CDK)**
2. **Tag all resources appropriately**
3. **Implement proper monitoring**
4. **Set up cost alerts**
5. **Regular security audits**

## 🆘 Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Report bugs on GitHub Issues
- **Monitoring**: Use CloudWatch dashboards
- **Logs**: Check application logs for debugging
- **Community**: GitHub Discussions for questions

## 📖 Additional Resources

- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Monitoring Guide](MONITORING.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [API Documentation](API.md)
- [Contributing Guidelines](CONTRIBUTING.md)