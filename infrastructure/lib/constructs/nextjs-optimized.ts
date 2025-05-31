import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface NextjsOptimizedProps {
  stage: string;
  memorySize?: number;
  timeout?: cdk.Duration;
  reservedConcurrency?: number;
  enableXRay?: boolean;
  enableProvisioned?: boolean;
  provisionedConcurrency?: number;
}

export class NextjsOptimized extends Construct {
  public readonly lambdaFunction: lambda.Function;
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: NextjsOptimizedProps) {
    super(scope, id);

    // Optimized memory size based on stage
    const memorySize = props.memorySize || this.getOptimalMemorySize(props.stage);
    
    // Log group with structured retention
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/nextjs-playground-${props.stage}`,
      retention: this.getLogRetention(props.stage),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function with performance optimizations
    this.lambdaFunction = new lambda.Function(this, 'Function', {
      functionName: `nextjs-playground-optimized-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(this.getOptimizedHandler()),
      memorySize,
      timeout: props.timeout || cdk.Duration.seconds(30),
      reservedConcurrency: props.reservedConcurrency,
      logGroup: this.logGroup,
      environment: {
        NODE_ENV: props.stage === 'prod' ? 'production' : 'development',
        STAGE: props.stage,
        // Performance optimizations
        NODE_OPTIONS: '--enable-source-maps --max-old-space-size=512',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        // Logging
        LOG_LEVEL: props.stage === 'prod' ? 'warn' : 'debug',
      },
      deadLetterQueueEnabled: props.stage === 'prod',
      tracing: props.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
      insightsVersion: props.stage === 'prod' ? lambda.LambdaInsightsVersion.VERSION_1_0_229_0 : undefined,
    });

    // Provisioned concurrency for production
    if (props.enableProvisioned && props.provisionedConcurrency) {
      const version = this.lambdaFunction.currentVersion;
      const alias = new lambda.Alias(this, 'ProdAlias', {
        aliasName: 'PROD',
        version,
        provisionedConcurrencyConfig: {
          provisionedConcurrentExecutions: props.provisionedConcurrency,
        },
      });
    }

    // Lambda Layer for common dependencies (optional)
    if (props.stage === 'prod') {
      const optimizationLayer = new lambda.LayerVersion(this, 'OptimizationLayer', {
        layerVersionName: `nextjs-optimization-${props.stage}`,
        code: lambda.Code.fromInline(`
          // Layer for shared dependencies and utilities
          module.exports = {
            compression: require('compression'),
            helmet: require('helmet'),
          };
        `),
        compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
        description: 'Optimization utilities for Next.js Lambda',
      });

      this.lambdaFunction.addLayers(optimizationLayer);
    }
  }

  private getOptimalMemorySize(stage: string): number {
    switch (stage) {
      case 'prod':
        return 1024; // Higher memory for production performance
      case 'staging':
        return 768;  // Balanced for testing
      default:
        return 512;  // Cost-optimized for development
    }
  }

  private getLogRetention(stage: string): logs.RetentionDays {
    switch (stage) {
      case 'prod':
        return logs.RetentionDays.ONE_MONTH;
      case 'staging':
        return logs.RetentionDays.TWO_WEEKS;
      default:
        return logs.RetentionDays.ONE_WEEK;
    }
  }

  private getOptimizedHandler(): string {
    return `
const AWS = require('aws-sdk');

// Connection reuse
if (process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED) {
  AWS.config.update({
    httpOptions: {
      agent: require('https').globalAgent
    }
  });
}

// Enhanced logging
const logger = {
  debug: (...args) => process.env.LOG_LEVEL === 'debug' && console.log('[DEBUG]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Lambda handler with optimizations
exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  try {
    // Set shorter timeout for Lambda context
    context.callbackWaitsForEmptyEventLoop = false;
    
    logger.debug('Event received:', JSON.stringify(event, null, 2));
    
    // Simulate Next.js SSR response
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Response-Time': \`\${Date.now() - startTime}ms\`,
        'X-Stage': process.env.STAGE,
      },
      body: \`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next.js Playground - \${process.env.STAGE}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; }
        .status { background: #e7f5e7; padding: 10px; border-radius: 4px; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Next.js Playground</h1>
            <p>Serverless deployment powered by AWS Lambda</p>
        </div>
        
        <div class="status">
            <strong>✅ Application Status: Healthy</strong><br>
            Environment: <strong>\${process.env.STAGE.toUpperCase()}</strong><br>
            Response Time: <strong>\${Date.now() - startTime}ms</strong>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">\${process.env.AWS_REGION}</div>
                <div class="metric-label">AWS Region</div>
            </div>
            <div class="metric">
                <div class="metric-value">\${context.memoryLimitInMB}MB</div>
                <div class="metric-label">Memory Limit</div>
            </div>
            <div class="metric">
                <div class="metric-value">\${context.getRemainingTimeInMillis()}ms</div>
                <div class="metric-label">Remaining Time</div>
            </div>
            <div class="metric">
                <div class="metric-value">\${process.version}</div>
                <div class="metric-label">Node.js Version</div>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>🤖 Generated with Claude Code | Request ID: \${context.awsRequestId}</p>
        </div>
    </div>
</body>
</html>
      \`,
    };
    
    logger.info('Request completed', {
      requestId: context.awsRequestId,
      duration: Date.now() - startTime,
      statusCode: response.statusCode
    });
    
    return response;
    
  } catch (error) {
    logger.error('Handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Response-Time': \`\${Date.now() - startTime}ms\`,
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        requestId: context.awsRequestId,
        stage: process.env.STAGE
      })
    };
  }
};
    `;
  }
}