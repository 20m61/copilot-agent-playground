# Next.js Serverless Playground 🚀

A complete, production-ready serverless Next.js application deployed on AWS with comprehensive CI/CD, monitoring, and cost optimization.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│  S3 (静的資産)   │    │   Lambda@Edge   │
│   (CDN)         │    │                  │    │   (リダイレクト) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Lambda Function│────│     DynamoDB     │────│   CloudWatch    │
│  (SSR/API)      │    │   (セッション)   │    │   (監視・ログ)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐
│  GitHub Actions │────│  AWS CodePipeline│
│  (CI Testing)   │    │  (CD Deployment) │
└─────────────────┘    └──────────────────┘
```

## ✨ Features

### 🔧 Core Application
- **Next.js 15** with TypeScript and Tailwind CSS
- **Server-Side Rendering** on AWS Lambda
- **API Routes** with DynamoDB integration
- **Static Asset Optimization** via CloudFront CDN

### 🚀 CI/CD Pipeline
- **GitHub Actions** for continuous integration
- **AWS CodePipeline** for deployment automation
- **Multi-environment** support (dev/staging/prod)
- **Automated testing** and security scanning

### 📊 Monitoring & Observability
- **CloudWatch Dashboard** with custom metrics
- **Proactive Alerting** via SNS notifications
- **Cost Monitoring** with budget alerts
- **Structured Logging** with Log Insights
- **Performance Optimization** with Lambda insights

### 💰 Cost Optimization
- **Serverless Architecture** - pay only for usage
- **On-Demand DynamoDB** - no minimum charges
- **Optimized CloudFront** - reduced edge locations
- **Smart Resource Sizing** per environment
- **Estimated Cost**: $5-15/month for low traffic

## 🚦 Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ and npm
- AWS CLI configured
- GitHub account

### 1. Clone and Setup
```bash
git clone https://github.com/20m61/copilot-agent-playground.git
cd copilot-agent-playground

# Install Next.js dependencies
cd nextjs-app
npm install

# Install infrastructure dependencies  
cd ../infrastructure
npm install
```

### 2. Local Development
```bash
# Start Next.js development server
cd nextjs-app
npm run dev

# Open http://localhost:3000
```

### 3. Deploy to AWS
```bash
# Bootstrap CDK (first time only)
cd infrastructure
npx cdk bootstrap

# Deploy development environment
npx cdk deploy --all --context stage=dev

# Deploy staging environment
npx cdk deploy --all --context stage=staging

# Deploy production environment (with approval)
npx cdk deploy --all --context stage=prod
```

## 📁 Project Structure

```
.
├── nextjs-app/                 # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   └── components/        # React components
│   ├── public/                # Static assets
│   └── package.json
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

## 🏢 Environments

| Environment | Purpose | Deployment | Domain | Cost |
|-------------|---------|------------|---------|------|
| **dev** | Local development | Manual CDK | None | $5-10/month |
| **staging** | Pre-production testing | Auto on `master` | `staging.*` | $10-20/month |
| **prod** | Production | Manual approval | `www.*` | $20-50/month |

## 🔄 CI/CD Workflow

### Continuous Integration
1. **Code Quality**: ESLint, TypeScript checks
2. **Testing**: Unit tests, integration tests
3. **Security**: Dependency audit, vulnerability scanning
4. **Build Validation**: Next.js build and CDK synth

### Continuous Deployment
1. **Staging**: Auto-deploy on `master` branch
2. **Production**: Manual approval required
3. **Rollback**: Automatic on health check failures
4. **Notifications**: Slack/Email alerts on deployment status

## 📊 Monitoring

### Key Metrics
- **Lambda Performance**: Duration, errors, throttles
- **API Gateway**: Request volume, latency, error rates
- **DynamoDB**: Capacity usage, throttles, latency
- **CloudFront**: Cache hit rate, error rate, data transfer
- **Cost**: Daily spend, budget alerts

### Dashboards
- **CloudWatch Dashboard**: Real-time application metrics
- **Cost Dashboard**: Spend tracking and forecasts
- **Performance Dashboard**: Latency and error analysis

### Alerting
- **Error Rate** > 5% in 5 minutes
- **Response Time** > 5 seconds average
- **Cost Budget** > 80% monthly limit
- **DynamoDB Throttles** detected

## 💰 Cost Breakdown

### Staging Environment (~$15/month)
- **Lambda**: $2-5 (500K invocations)
- **API Gateway**: $2-3 (500K requests)
- **CloudFront**: $1-2 (100GB transfer)
- **DynamoDB**: $1-3 (on-demand)
- **S3**: $1-2 (storage + requests)
- **CloudWatch**: $2-3 (metrics + logs)

### Production Scaling
Costs scale linearly with usage. For 10M requests/month:
- **Lambda**: $20-40
- **API Gateway**: $15-25
- **CloudFront**: $8-15
- **DynamoDB**: $10-25
- **Total**: ~$50-100/month

## 🛠️ Development

### Available Scripts

**Next.js App:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run tests
```

**Infrastructure:**
```bash
npm run build        # Compile TypeScript
npm run synth        # Generate CloudFormation
npm run deploy       # Deploy stacks
npm run diff         # Show changes
npm run destroy      # Destroy stacks
```

### Adding New Features
1. Create feature branch from `master`
2. Develop in `nextjs-app/` or `infrastructure/`
3. Run tests and linting locally
4. Create pull request to `master`
5. CI pipeline validates changes
6. Merge triggers staging deployment
7. Manual approval for production

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)**: Detailed deployment instructions
- **[Monitoring Guide](docs/MONITORING.md)**: Observability and alerting setup
- **[Architecture Guide](infrastructure/README.md)**: Infrastructure deep dive

## 🔒 Security

- **HTTPS Everywhere**: All traffic encrypted
- **IAM Least Privilege**: Minimal required permissions
- **Dependency Scanning**: Automated vulnerability detection
- **Secrets Management**: AWS Secrets Manager integration
- **Access Controls**: Environment-specific permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Ensure CI passes
6. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides in `/docs`
- **Monitoring**: CloudWatch dashboards and alerts
- **Community**: Discussions and Q&A

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

*A production-ready serverless Next.js starter with enterprise-grade CI/CD, monitoring, and cost optimization.*