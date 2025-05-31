import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface LoggingConstructProps {
  stage: string;
  applicationName: string;
  enableStructuredLogging?: boolean;
  enableLogInsights?: boolean;
  enableMetricFilters?: boolean;
}

export class LoggingConstruct extends Construct {
  public readonly centralLogGroup: logs.LogGroup;
  public readonly logInsightsQueries: logs.QueryDefinition[];
  public readonly metricFilters: logs.MetricFilter[];

  constructor(scope: Construct, id: string, props: LoggingConstructProps) {
    super(scope, id);

    // Central log group for application logs
    this.centralLogGroup = new logs.LogGroup(this, 'CentralLogGroup', {
      logGroupName: `/aws/application/${props.applicationName}-${props.stage}`,
      retention: this.getLogRetention(props.stage),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Log Insights queries for common analysis
    this.logInsightsQueries = [];
    if (props.enableLogInsights !== false) {
      this.logInsightsQueries.push(
        // Error analysis query
        new logs.QueryDefinition(this, 'ErrorAnalysisQuery', {
          queryDefinitionName: `${props.applicationName}-${props.stage}-errors`,
          queryString: `
fields @timestamp, @message, @requestId
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
          `,
          logGroups: [this.centralLogGroup],
        }),

        // Performance analysis query
        new logs.QueryDefinition(this, 'PerformanceQuery', {
          queryDefinitionName: `${props.applicationName}-${props.stage}-performance`,
          queryString: `
fields @timestamp, @duration, @billedDuration, @memorySize, @maxMemoryUsed
| filter @type = "REPORT"
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)
| sort @timestamp desc
          `,
          logGroups: [this.centralLogGroup],
        }),

        // Request volume query
        new logs.QueryDefinition(this, 'RequestVolumeQuery', {
          queryDefinitionName: `${props.applicationName}-${props.stage}-requests`,
          queryString: `
fields @timestamp, @requestId
| filter @type = "START"
| stats count() by bin(1h)
| sort @timestamp desc
          `,
          logGroups: [this.centralLogGroup],
        }),

        // Cold start analysis
        new logs.QueryDefinition(this, 'ColdStartQuery', {
          queryDefinitionName: `${props.applicationName}-${props.stage}-coldstarts`,
          queryString: `
fields @timestamp, @message, @initDuration
| filter @type = "REPORT" and @initDuration > 0
| stats count() as coldStarts, avg(@initDuration) as avgInitDuration by bin(1h)
| sort @timestamp desc
          `,
          logGroups: [this.centralLogGroup],
        })
      );
    }

    // Metric filters for custom metrics
    this.metricFilters = [];
    if (props.enableMetricFilters !== false) {
      // Error count metric
      const errorMetricFilter = new logs.MetricFilter(this, 'ErrorMetricFilter', {
        logGroup: this.centralLogGroup,
        metricNamespace: `${props.applicationName}/${props.stage}`,
        metricName: 'ErrorCount',
        filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level="ERROR", ...]'),
        metricValue: '1',
        defaultValue: 0,
      });

      // Warning count metric  
      const warningMetricFilter = new logs.MetricFilter(this, 'WarningMetricFilter', {
        logGroup: this.centralLogGroup,
        metricNamespace: `${props.applicationName}/${props.stage}`,
        metricName: 'WarningCount',
        filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level="WARN", ...]'),
        metricValue: '1',
        defaultValue: 0,
      });

      // Response time metric
      const responseTimeMetricFilter = new logs.MetricFilter(this, 'ResponseTimeMetricFilter', {
        logGroup: this.centralLogGroup,
        metricNamespace: `${props.applicationName}/${props.stage}`,
        metricName: 'ResponseTime',
        filterPattern: logs.FilterPattern.literal('[timestamp, requestId, level, message, duration]'),
        metricValue: '$duration',
        defaultValue: 0,
      });

      this.metricFilters.push(errorMetricFilter, warningMetricFilter, responseTimeMetricFilter);
    }

    // Log processing Lambda for structured logging
    if (props.enableStructuredLogging !== false) {
      const logProcessorFunction = new lambda.Function(this, 'LogProcessor', {
        functionName: `${props.applicationName}-log-processor-${props.stage}`,
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        timeout: cdk.Duration.minutes(1),
        memorySize: 256,
        code: lambda.Code.fromInline(`
const AWS = require('aws-sdk');
const zlib = require('zlib');

exports.handler = async (event) => {
  const payload = Buffer.from(event.awslogs.data, 'base64');
  const parsed = JSON.parse(zlib.gunzipSync(payload).toString());
  
  for (const logEvent of parsed.logEvents) {
    try {
      // Parse structured log if possible
      const message = JSON.parse(logEvent.message);
      
      // Add enrichment data
      message.timestamp = new Date(logEvent.timestamp).toISOString();
      message.logGroup = parsed.logGroup;
      message.logStream = parsed.logStream;
      
      // Send to analytics service or data lake
      console.log('Structured log:', JSON.stringify(message));
      
    } catch (e) {
      // Handle unstructured logs
      console.log('Unstructured log:', {
        timestamp: new Date(logEvent.timestamp).toISOString(),
        message: logEvent.message,
        logGroup: parsed.logGroup,
        logStream: parsed.logStream
      });
    }
  }
  
  return { statusCode: 200 };
};
        `),
        environment: {
          STAGE: props.stage,
          APPLICATION_NAME: props.applicationName,
        },
      });

      // Grant permissions to read from CloudWatch Logs
      logProcessorFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: ['*'],
        })
      );

      // Subscription filter to send logs to processor
      new logs.SubscriptionFilter(this, 'LogSubscriptionFilter', {
        logGroup: this.centralLogGroup,
        destination: new logs.LambdaDestination(logProcessorFunction),
        filterPattern: logs.FilterPattern.allEvents(),
      });
    }
  }

  private getLogRetention(stage: string): logs.RetentionDays {
    switch (stage) {
      case 'prod':
        return logs.RetentionDays.SIX_MONTHS;
      case 'staging':
        return logs.RetentionDays.ONE_MONTH;
      default:
        return logs.RetentionDays.TWO_WEEKS;
    }
  }

  // Helper method to create custom metric alarms
  public createCustomMetricAlarm(
    id: string,
    metricName: string,
    threshold: number,
    applicationName: string,
    stage: string,
    comparisonOperator: cloudwatch.ComparisonOperator = cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD
  ): cloudwatch.Alarm {
    return new cloudwatch.Alarm(this, id, {
      metric: new cloudwatch.Metric({
        namespace: `${applicationName}/${stage}`,
        metricName,
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold,
      comparisonOperator,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
  }
}