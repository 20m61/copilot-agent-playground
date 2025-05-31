# Next.js Playground Infrastructure

AWS CDK infrastructure for deploying Next.js application to AWS with cost-optimized serverless architecture.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│  S3 (静的資産)   │    │   Lambda@Edge   │
│   (CDN)         │    │                  │    │   (リダイレクト) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│  Lambda Function│────│     DynamoDB     │
│  (SSR/API)      │    │   (セッション)   │
└─────────────────┘    └──────────────────┘
```

## Components

### Shared Stack
- **S3 Bucket**: Static asset storage with CloudFront integration
- **CloudFront Distribution**: Global CDN with optimized caching policies
- **Origin Access Control**: Secure S3 access

### Frontend Stack
- **Lambda Function**: Next.js SSR with Node.js 20.x runtime
- **API Gateway**: RESTful API with regional endpoints
- **DynamoDB Table**: Session storage with TTL and on-demand billing

## Cost Optimization Features

- **Serverless Architecture**: Pay only for actual usage
- **On-Demand DynamoDB**: No minimum charges for low traffic
- **CloudFront Price Class 100**: Reduced edge locations for cost savings
- **Optimized Lambda Memory**: 512MB starting configuration
- **Log Retention**: 1 week for development environments

## Prerequisites

- AWS CLI configured
- Node.js 18+ and npm
- AWS CDK CLI: `npm install -g aws-cdk`

## Setup

1. **Install dependencies:**
   ```bash
   cd infrastructure
   npm install
   ```

2. **Bootstrap CDK (first time only):**
   ```bash
   npm run cdk bootstrap
   ```

3. **Deploy development environment:**
   ```bash
   npm run cdk deploy -- -c stage=dev
   ```

4. **Deploy to other environments:**
   ```bash
   # Staging
   npm run cdk deploy -- -c stage=staging
   
   # Production
   npm run cdk deploy -- -c stage=prod
   ```

## Available Commands

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes
- `npm run test` - Run tests
- `npm run cdk synth` - Generate CloudFormation templates
- `npm run cdk diff` - Show differences
- `npm run cdk deploy` - Deploy stacks

## Environment Configuration

Use the `stage` context parameter to deploy to different environments:

- `dev` - Development environment
- `staging` - Staging environment
- `prod` - Production environment

## Estimated Costs

### Development Environment (Low Traffic)
- Lambda: $1-3/month
- CloudFront: $1-2/month
- S3: $1-2/month
- DynamoDB: $1-3/month
- API Gateway: $1-2/month
- **Total: ~$5-12/month**

### Production Environment (Medium Traffic)
- **Total: ~$20-50/month**

## Security Features

- S3 bucket with blocked public access
- CloudFront with HTTPS redirect
- Origin Access Control for S3
- IAM roles with least privilege
- VPC endpoints (optional for enhanced security)

## Monitoring

- CloudWatch Logs for Lambda functions
- CloudFront access logs
- API Gateway execution logs
- DynamoDB metrics

## Cleanup

To destroy all resources:
```bash
npm run cdk destroy -- -c stage=dev
```