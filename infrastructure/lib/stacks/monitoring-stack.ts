import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  stage: string;
  lambdaFunction: lambda.Function;
  api: apigateway.RestApi;
  sessionTable: dynamodb.Table;
  distribution: cloudfront.Distribution;
  alertEmail?: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alertTopic: sns.Topic;
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `nextjs-playground-alerts-${props.stage}`,
      displayName: `Next.js Playground Alerts - ${props.stage}`,
    });

    // Add email subscription if provided
    if (props.alertEmail) {
      this.alertTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(props.alertEmail)
      );
    }

    // Lambda Function Alarms
    const lambdaErrorRate = new cloudwatch.Alarm(this, 'LambdaErrorRate', {
      alarmName: `nextjs-playground-lambda-errors-${props.stage}`,
      alarmDescription: 'Lambda function error rate is too high',
      metric: props.lambdaFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5, // 5 errors in 5 minutes
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    const lambdaDuration = new cloudwatch.Alarm(this, 'LambdaDuration', {
      alarmName: `nextjs-playground-lambda-duration-${props.stage}`,
      alarmDescription: 'Lambda function duration is too high',
      metric: props.lambdaFunction.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 10000, // 10 seconds
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    const lambdaThrottles = new cloudwatch.Alarm(this, 'LambdaThrottles', {
      alarmName: `nextjs-playground-lambda-throttles-${props.stage}`,
      alarmDescription: 'Lambda function is being throttled',
      metric: props.lambdaFunction.metricThrottles({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // API Gateway Alarms
    const apiErrorRate = new cloudwatch.Alarm(this, 'ApiErrorRate', {
      alarmName: `nextjs-playground-api-errors-${props.stage}`,
      alarmDescription: 'API Gateway 5XX error rate is too high',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiName: props.api.restApiName,
          Stage: props.stage,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10, // 10 errors in 5 minutes
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    const apiLatency = new cloudwatch.Alarm(this, 'ApiLatency', {
      alarmName: `nextjs-playground-api-latency-${props.stage}`,
      alarmDescription: 'API Gateway latency is too high',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: 'Latency',
        dimensionsMap: {
          ApiName: props.api.restApiName,
          Stage: props.stage,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // DynamoDB Alarms
    const dynamoReadThrottles = new cloudwatch.Alarm(this, 'DynamoReadThrottles', {
      alarmName: `nextjs-playground-dynamo-read-throttles-${props.stage}`,
      alarmDescription: 'DynamoDB read throttles detected',
      metric: props.sessionTable.metricThrottledRequestsForOperations({
        operations: [dynamodb.Operation.GET_ITEM, dynamodb.Operation.QUERY, dynamodb.Operation.SCAN],
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    const dynamoWriteThrottles = new cloudwatch.Alarm(this, 'DynamoWriteThrottles', {
      alarmName: `nextjs-playground-dynamo-write-throttles-${props.stage}`,
      alarmDescription: 'DynamoDB write throttles detected',
      metric: props.sessionTable.metricThrottledRequestsForOperations({
        operations: [dynamodb.Operation.PUT_ITEM, dynamodb.Operation.UPDATE_ITEM, dynamodb.Operation.DELETE_ITEM],
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // CloudFront Alarms (simplified for compatibility)
    const cloudfrontErrorRate = new cloudwatch.Alarm(this, 'CloudFrontErrorRate', {
      alarmName: `nextjs-playground-cloudfront-errors-${props.stage}`,
      alarmDescription: 'CloudFront 4XX error rate is too high',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: '4xxErrorRate',
        dimensionsMap: {
          DistributionId: props.distribution.distributionId,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 10, // 10% error rate
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Add alarms to SNS topic
    [
      lambdaErrorRate,
      lambdaDuration,
      lambdaThrottles,
      apiErrorRate,
      apiLatency,
      dynamoReadThrottles,
      dynamoWriteThrottles,
      cloudfrontErrorRate,
    ].forEach(alarm => {
      alarm.addAlarmAction(new cloudwatchActions.SnsAction(this.alertTopic));
    });

    // Create CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `nextjs-playground-${props.stage}`,
      widgets: [
        [
          // Lambda Metrics
          new cloudwatch.GraphWidget({
            title: 'Lambda Function Performance',
            left: [
              props.lambdaFunction.metricInvocations(),
              props.lambdaFunction.metricErrors(),
              props.lambdaFunction.metricThrottles(),
            ],
            right: [
              props.lambdaFunction.metricDuration(),
            ],
            period: cdk.Duration.minutes(5),
            width: 12,
            height: 6,
          }),
        ],
        [
          // API Gateway Metrics
          new cloudwatch.GraphWidget({
            title: 'API Gateway Performance',
            left: [
              new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: 'Count',
                dimensionsMap: {
                  ApiName: props.api.restApiName,
                  Stage: props.stage,
                },
              }),
              new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: '4XXError',
                dimensionsMap: {
                  ApiName: props.api.restApiName,
                  Stage: props.stage,
                },
              }),
              new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: '5XXError',
                dimensionsMap: {
                  ApiName: props.api.restApiName,
                  Stage: props.stage,
                },
              }),
            ],
            right: [
              new cloudwatch.Metric({
                namespace: 'AWS/ApiGateway',
                metricName: 'Latency',
                dimensionsMap: {
                  ApiName: props.api.restApiName,
                  Stage: props.stage,
                },
              }),
            ],
            period: cdk.Duration.minutes(5),
            width: 12,
            height: 6,
          }),
        ],
        [
          // DynamoDB Metrics
          new cloudwatch.GraphWidget({
            title: 'DynamoDB Performance',
            left: [
              props.sessionTable.metricConsumedReadCapacityUnits(),
              props.sessionTable.metricConsumedWriteCapacityUnits(),
            ],
            right: [
              props.sessionTable.metricSuccessfulRequestLatency({
                dimensionsMap: { Operation: 'GetItem' },
              }),
              props.sessionTable.metricSuccessfulRequestLatency({
                dimensionsMap: { Operation: 'PutItem' },
              }),
            ],
            period: cdk.Duration.minutes(5),
            width: 12,
            height: 6,
          }),
        ],
        [
          // CloudFront Metrics
          new cloudwatch.GraphWidget({
            title: 'CloudFront Performance',
            left: [
              new cloudwatch.Metric({
                namespace: 'AWS/CloudFront',
                metricName: 'Requests',
                dimensionsMap: {
                  DistributionId: props.distribution.distributionId,
                },
              }),
              new cloudwatch.Metric({
                namespace: 'AWS/CloudFront',
                metricName: 'BytesDownloaded',
                dimensionsMap: {
                  DistributionId: props.distribution.distributionId,
                },
              }),
            ],
            right: [
              new cloudwatch.Metric({
                namespace: 'AWS/CloudFront',
                metricName: 'CacheHitRate',
                dimensionsMap: {
                  DistributionId: props.distribution.distributionId,
                },
              }),
            ],
            period: cdk.Duration.minutes(5),
            width: 12,
            height: 6,
          }),
        ],
      ],
    });

    // Cost Budget (only for production)
    if (props.stage === 'prod') {
      new budgets.CfnBudget(this, 'CostBudget', {
        budget: {
          budgetName: `nextjs-playground-${props.stage}-budget`,
          budgetLimit: {
            amount: 100, // $100 USD
            unit: 'USD',
          },
          timeUnit: 'MONTHLY',
          budgetType: 'COST',
          costFilters: {
            TagKey: ['Project'],
            TagValue: ['nextjs-playground'],
          },
        },
        notificationsWithSubscribers: [
          {
            notification: {
              notificationType: 'ACTUAL',
              comparisonOperator: 'GREATER_THAN',
              threshold: 80, // Alert at 80% of budget
              thresholdType: 'PERCENTAGE',
            },
            subscribers: props.alertEmail ? [
              {
                subscriptionType: 'EMAIL',
                address: props.alertEmail,
              },
            ] : [],
          },
          {
            notification: {
              notificationType: 'FORECASTED',
              comparisonOperator: 'GREATER_THAN',
              threshold: 100, // Alert if forecasted to exceed budget
              thresholdType: 'PERCENTAGE',
            },
            subscribers: props.alertEmail ? [
              {
                subscriptionType: 'EMAIL',
                address: props.alertEmail,
              },
            ] : [],
          },
        ],
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch dashboard URL',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS topic ARN for alerts',
    });
  }
}