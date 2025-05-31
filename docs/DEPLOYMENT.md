# Deployment Guide

This document describes how to deploy the Next.js Playground application to AWS using the CI/CD pipeline.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  GitHub Actions │────│  AWS CodePipeline│────│   AWS Resources │
│  (CI/Testing)   │    │  (CD/Deployment) │    │  (App Runtime)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Environments

### Development (`dev`)
- **Purpose**: Local development and testing
- **Deployment**: Manual CDK deployment only
- **Access**: Developers
- **Cost**: Minimal (on-demand resources)

### Staging (`staging`)
- **Purpose**: Pre-production testing and validation
- **Deployment**: Automatic on `master` branch push
- **Access**: Development team and stakeholders
- **Domain**: `staging.your-domain.com` (if configured)

### Production (`prod`)
- **Purpose**: Live application serving users
- **Deployment**: Manual approval required
- **Access**: Public users
- **Domain**: `your-domain.com` (if configured)

## Prerequisites

### AWS Setup
1. **AWS Account**: Access to AWS account with appropriate permissions
2. **AWS CLI**: Configured with credentials
3. **CDK Bootstrap**: Run once per account/region
   ```bash
   npx cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

### GitHub Setup
1. **Repository Secrets**: Configure in GitHub repository settings
   ```
   AWS_ACCESS_KEY_ID         # For staging deployments
   AWS_SECRET_ACCESS_KEY     # For staging deployments
   AWS_ACCESS_KEY_ID_PROD    # For production deployments  
   AWS_SECRET_ACCESS_KEY_PROD # For production deployments
   ```

2. **GitHub Token**: Store in AWS Secrets Manager as `github-token`
   ```bash
   aws secretsmanager create-secret \
     --name github-token \
     --secret-string "your-github-personal-access-token"
   ```

## Deployment Workflows

### Continuous Integration (CI)
**Trigger**: Push to any branch, Pull Request to `master`/`develop`

**Steps**:
1. **Code Quality**: ESLint, TypeScript checks
2. **Testing**: Unit tests, integration tests
3. **Security**: Dependency audit, vulnerability scanning
4. **Build**: Next.js application build
5. **Infrastructure Validation**: CDK synth validation

### Continuous Deployment (CD)

#### Staging Deployment
**Trigger**: Push to `master` branch

**Steps**:
1. Automatic deployment via GitHub Actions
2. CDK stack deployment to staging environment
3. Application becomes available at staging URL
4. Deployment status notification

#### Production Deployment
**Trigger**: Manual workflow dispatch

**Steps**:
1. Manual trigger from GitHub Actions
2. Manual approval gate
3. CDK stack deployment to production environment
4. Application becomes available at production URL
5. Deployment completion notification

## Manual Deployment

### Local Development Environment
```bash
cd infrastructure
npm install

# Deploy all stacks to development
npx cdk deploy --all --context stage=dev
```

### Staging Environment
```bash
# Deploy to staging (requires AWS credentials)
npx cdk deploy --all --context stage=staging
```

### Production Environment
```bash
# Deploy to production (requires AWS credentials)
npx cdk deploy --all --context stage=prod
```

## Cost Optimization

### Development
- **Lambda**: Pay per invocation
- **DynamoDB**: On-demand billing
- **S3**: Pay for storage used
- **CloudFront**: Pay for data transfer
- **Estimated**: $5-15/month for low traffic

### Staging
- **Similar to development**: Slightly higher due to CI/CD resources
- **CodePipeline**: $1/month per active pipeline
- **CodeBuild**: Pay per build minute
- **Estimated**: $10-25/month

### Production
- **Scales with usage**: Higher traffic = higher costs
- **Reserved capacity**: Consider for predictable workloads
- **Estimated**: $20-100/month depending on traffic

## Monitoring and Debugging

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/nextjs-playground-staging --follow

# View CodeBuild logs
aws logs tail /aws/codebuild/nextjs-playground-deploy-staging --follow
```

### Application URLs
```bash
# Get CloudFront URL
aws cloudformation describe-stacks \
  --stack-name nextjs-playground-staging-shared \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionDomainName`].OutputValue' \
  --output text

# Get API Gateway URL
aws cloudformation describe-stacks \
  --stack-name nextjs-playground-staging-frontend \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

### Pipeline Status
```bash
# Check pipeline status
aws codepipeline get-pipeline-state \
  --name nextjs-playground-staging
```

## Troubleshooting

### Common Issues

#### CDK Bootstrap Error
```bash
# Re-run bootstrap
npx cdk bootstrap --force
```

#### Permission Denied
- Check AWS credentials
- Verify IAM permissions
- Ensure correct region

#### Build Failures
- Check Node.js version (requires 20+)
- Verify dependencies are installed
- Review build logs in CodeBuild

#### Deployment Timeouts
- Check resource limits
- Verify network connectivity
- Review CloudFormation events

### Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Refer to AWS CDK documentation
- **Logs**: Check CloudWatch logs for detailed error messages

## Security Best Practices

1. **Secrets Management**: Use AWS Secrets Manager for sensitive data
2. **IAM Roles**: Follow principle of least privilege
3. **HTTPS**: All traffic encrypted in transit
4. **Dependency Scanning**: Automated vulnerability detection
5. **Access Controls**: Environment-specific permissions

## Rollback Procedures

### Automatic Rollback
CDK deployments are atomic - if deployment fails, previous state is maintained.

### Manual Rollback
```bash
# Rollback to previous version
aws cloudformation cancel-update-stack --stack-name STACK_NAME

# Or deploy previous version
git checkout PREVIOUS_COMMIT
npx cdk deploy --all --context stage=ENVIRONMENT
```