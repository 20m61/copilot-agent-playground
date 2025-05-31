# Monitoring and Observability Guide

This document describes the comprehensive monitoring, logging, and alerting setup for the Next.js Playground application.

## Overview

The monitoring stack provides:
- **Real-time metrics** via CloudWatch
- **Proactive alerting** via SNS notifications  
- **Cost monitoring** with AWS Budgets
- **Performance optimization** with Lambda insights
- **Structured logging** for troubleshooting

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │────│   CloudWatch     │────│   SNS Topics    │
│   Metrics       │    │   Metrics &      │    │   Alerting      │
└─────────────────┘    │   Dashboards     │    └─────────────────┘
                       └──────────────────┘             │
┌─────────────────┐    ┌──────────────────┐             │
│   CloudWatch    │────│   Log Insights   │             │
│   Logs          │    │   Queries        │             │
└─────────────────┘    └──────────────────┘             │
                                                        │
┌─────────────────┐    ┌──────────────────┐             │
│   AWS Budgets   │────│   Cost Alerts    │─────────────┘
│   Monitoring    │    │   & Forecasts    │
└─────────────────┘    └──────────────────┘
```

## Monitoring Components

### 1. Application Metrics

#### Lambda Function Metrics
- **Invocations**: Request volume and patterns
- **Errors**: Error rate and failed requests
- **Duration**: Response time and performance
- **Throttles**: Concurrency limit hits
- **Memory Usage**: Resource utilization

#### API Gateway Metrics  
- **Request Count**: API usage volume
- **4XX/5XX Errors**: Client and server errors
- **Latency**: API response times
- **Cache Hit Rate**: CloudFront efficiency

#### DynamoDB Metrics
- **Read/Write Capacity**: Resource consumption
- **Throttles**: Capacity limit hits  
- **Latency**: Database response times
- **Error Rate**: Failed operations

#### CloudFront Metrics
- **Requests**: Traffic volume
- **Cache Hit Rate**: CDN efficiency
- **Error Rate**: Distribution errors
- **Data Transfer**: Bandwidth usage

### 2. Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|---------|
| Lambda Error Rate | >2% | >5% | Check logs, rollback if needed |
| Lambda Duration | >5s avg | >10s avg | Optimize code or increase memory |
| API Latency | >2s avg | >5s avg | Check downstream dependencies |
| DynamoDB Throttles | >0 | >5/min | Increase capacity or optimize queries |
| CloudFront Error Rate | >2% | >5% | Check origin health |
| Cost Budget | >80% | >100% | Review usage and optimize |

### 3. CloudWatch Dashboard

Access the monitoring dashboard:
```bash
# Get dashboard URL from CDK output
aws cloudformation describe-stacks \
  --stack-name nextjs-playground-staging-monitoring \
  --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
  --output text
```

**Dashboard Widgets:**
- Lambda performance graphs
- API Gateway request metrics
- DynamoDB capacity and latency
- CloudFront cache and error rates
- Cost trending and forecasts

### 4. Log Insights Queries

Pre-configured queries for common analysis:

#### Error Analysis
```sql
fields @timestamp, @message, @requestId
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

#### Performance Analysis  
```sql
fields @timestamp, @duration, @billedDuration, @memorySize, @maxMemoryUsed
| filter @type = "REPORT"
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)
| sort @timestamp desc
```

#### Cold Start Analysis
```sql
fields @timestamp, @message, @initDuration
| filter @type = "REPORT" and @initDuration > 0
| stats count() as coldStarts, avg(@initDuration) as avgInitDuration by bin(1h)
| sort @timestamp desc
```

## Setup and Configuration

### 1. Deploy Monitoring Stack

The monitoring stack is automatically deployed for staging and production:

```bash
# Deploy with monitoring
cd infrastructure
npx cdk deploy --all --context stage=staging

# Deploy with email alerts
npx cdk deploy --all --context stage=staging --context alertEmail=your-email@domain.com
```

### 2. Configure Email Alerts

Add your email to receive alerts:

```bash
# Via CDK context
npx cdk deploy --context alertEmail=alerts@yourcompany.com

# Or update SNS subscription manually
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:nextjs-playground-alerts-staging \
  --protocol email \
  --notification-endpoint alerts@yourcompany.com
```

### 3. Cost Budget Setup

For production environments, a $100 monthly budget is automatically configured:

- **80% threshold**: Warning notification
- **100% threshold**: Critical alert
- **Forecasted overage**: Proactive warning

## Performance Optimization

### 1. Lambda Optimization

**Memory Configuration by Environment:**
- **Development**: 512MB (cost-optimized)
- **Staging**: 768MB (balanced)
- **Production**: 1024MB (performance-optimized)

**Performance Features:**
- Connection reuse enabled
- Structured logging with different levels
- Dead letter queue for production
- Lambda Insights for detailed metrics
- Provisioned concurrency (optional)

### 2. Cold Start Mitigation

**Monitoring Cold Starts:**
```bash
# View cold start metrics
aws logs start-query \
  --log-group-name /aws/lambda/nextjs-playground-prod \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @initDuration | filter @type = "REPORT" and @initDuration > 0'
```

**Optimization Strategies:**
- Keep functions warm with scheduled invocations
- Minimize package size and dependencies  
- Use provisioned concurrency for critical functions
- Optimize initialization code

### 3. Cache Optimization

**CloudFront Caching:**
- Static assets: 1 year cache
- API responses: No cache (dynamic content)
- HTML pages: 1 hour browser, 24 hour edge

**Cache Hit Rate Monitoring:**
Monitor cache efficiency and adjust TTLs based on hit rates.

## Troubleshooting

### 1. Common Issues

#### High Error Rate
1. Check CloudWatch logs for error details
2. Review recent deployments
3. Check downstream service health
4. Consider rollback if critical

#### High Latency
1. Monitor Lambda duration metrics
2. Check DynamoDB response times
3. Review CloudFront cache hit rates
4. Analyze cold start frequency

#### Cost Spikes
1. Review CloudWatch metrics for usage patterns
2. Check for unexpected traffic or attacks
3. Analyze DynamoDB capacity consumption
4. Review Lambda invocation volumes

### 2. Log Analysis

**Access Logs:**
```bash
# View Lambda logs
aws logs tail /aws/lambda/nextjs-playground-staging --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/nextjs-playground-staging \
  --filter-pattern "ERROR"
```

**Structured Log Analysis:**
Logs include structured data for easy parsing:
- Request ID for correlation
- Performance timing data
- Error context and stack traces
- Environment and configuration info

### 3. Performance Analysis

**Lambda Performance:**
```bash
# Get performance statistics  
aws logs start-query \
  --log-group-name /aws/lambda/nextjs-playground-staging \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @duration, @billedDuration, @maxMemoryUsed | filter @type = "REPORT" | stats avg(@duration), max(@duration), min(@duration)'
```

## Best Practices

### 1. Monitoring Strategy
- Set up alerts for business-critical metrics
- Use appropriate thresholds to avoid alert fatigue
- Regular review and adjustment of monitoring rules
- Implement runbooks for common scenarios

### 2. Cost Optimization
- Monitor and optimize resource utilization
- Use appropriate retention periods for logs
- Implement automated cost alerts
- Regular review of usage patterns

### 3. Security Monitoring
- Monitor authentication failures
- Track unusual access patterns
- Alert on configuration changes
- Regular security audit of monitoring setup

## Advanced Features

### 1. Custom Metrics

Create application-specific metrics:
```javascript
// In Lambda function
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

await cloudwatch.putMetricData({
  Namespace: 'NextjsPlayground/Custom',
  MetricData: [{
    MetricName: 'BusinessMetric',
    Value: 1,
    Unit: 'Count'
  }]
}).promise();
```

### 2. Distributed Tracing

Enable X-Ray tracing for detailed request flows:
```bash
# Deploy with X-Ray enabled
npx cdk deploy --context enableXRay=true
```

### 3. Log Analytics

Set up log analytics for business intelligence:
- Export logs to S3 for long-term analysis
- Use Athena for complex log queries
- Create custom dashboards with QuickSight

## Integration with CI/CD

The monitoring setup integrates with the CI/CD pipeline:
- Health checks during deployment
- Automated rollback on metric threshold breaches
- Performance regression detection
- Cost impact assessment

Monitor deployment health and set up automatic rollback triggers based on error rates or performance degradation.