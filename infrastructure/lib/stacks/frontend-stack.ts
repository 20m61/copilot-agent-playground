import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { SharedStack } from './shared-stack';

export interface FrontendStackProps extends cdk.StackProps {
  stage: string;
  sharedStack: SharedStack;
}

export class FrontendStack extends cdk.Stack {
  public readonly nextjsFunction: lambda.Function;
  public readonly api: apigateway.RestApi;
  public readonly sessionTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // DynamoDB table for session storage (cost-optimized with on-demand billing)
    this.sessionTable = new dynamodb.Table(this, 'SessionTable', {
      tableName: `nextjs-playground-sessions-${props.stage}`,
      partitionKey: {
        name: 'sessionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Cost optimization for low traffic
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
      pointInTimeRecovery: false, // Cost optimization
    });

    // Lambda function for Next.js SSR
    this.nextjsFunction = new lambda.Function(this, 'NextjsFunction', {
      functionName: `nextjs-playground-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'text/html',
            },
            body: '<h1>Next.js Lambda Placeholder</h1><p>This will be replaced with actual Next.js build</p>',
          };
        };
      `), // Placeholder - will be replaced with actual Next.js build
      timeout: cdk.Duration.seconds(30),
      memorySize: 512, // Cost optimization - start with smaller memory
      logRetention: logs.RetentionDays.ONE_WEEK, // Cost optimization
      environment: {
        NODE_ENV: props.stage === 'prod' ? 'production' : 'development',
        DYNAMODB_TABLE_NAME: this.sessionTable.tableName,
        STAGE: props.stage,
      },
      deadLetterQueueEnabled: false, // Cost optimization for initial setup
    });

    // Grant Lambda permissions to access DynamoDB
    this.sessionTable.grantReadWriteData(this.nextjsFunction);

    // Grant Lambda permissions to access S3 bucket for static assets
    props.sharedStack.assetsBucket.grantRead(this.nextjsFunction);

    // API Gateway for Lambda function
    this.api = new apigateway.RestApi(this, 'NextjsApi', {
      restApiName: `nextjs-playground-api-${props.stage}`,
      description: 'API Gateway for Next.js serverless application',
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
      cloudWatchRole: false, // Cost optimization
      deployOptions: {
        stageName: props.stage,
        throttlingRateLimit: 100, // Cost optimization
        throttlingBurstLimit: 200,
        loggingLevel: apigateway.MethodLoggingLevel.ERROR, // Cost optimization
        dataTraceEnabled: false, // Cost optimization
        metricsEnabled: true,
      },
    });

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(this.nextjsFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // Catch-all route for Next.js routing
    this.api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true,
    });

    // Health check endpoint
    const healthResource = this.api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: this.nextjsFunction.functionName,
      description: 'Lambda function name',
    });

    new cdk.CfnOutput(this, 'SessionTableName', {
      value: this.sessionTable.tableName,
      description: 'DynamoDB table for sessions',
    });
  }
}