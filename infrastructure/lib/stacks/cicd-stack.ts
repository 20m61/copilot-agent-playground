import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface CicdStackProps extends cdk.StackProps {
  stage: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
}

export class CicdStack extends cdk.Stack {
  public readonly pipeline: codepipeline.Pipeline;
  public readonly artifactBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: CicdStackProps) {
    super(scope, id, props);

    // S3 Bucket for pipeline artifacts
    this.artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      bucketName: `nextjs-playground-artifacts-${props.stage}-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldArtifacts',
          enabled: true,
          expiration: cdk.Duration.days(30),
          noncurrentVersionExpiration: cdk.Duration.days(7),
        },
      ],
    });

    // CodeBuild project for deployment
    const deployProject = new codebuild.Project(this, 'DeployProject', {
      projectName: `nextjs-playground-deploy-${props.stage}`,
      description: `Deploy Next.js application to ${props.stage} environment`,
      source: codebuild.Source.gitHub({
        owner: props.githubOwner,
        repo: props.githubRepo,
        branchOrRef: props.githubBranch,
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL, // Cost optimization
        privileged: false,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '20',
            },
            commands: [
              'echo "Installing dependencies..."',
              'cd nextjs-app && npm ci',
              'cd ../infrastructure && npm install',
            ],
          },
          pre_build: {
            commands: [
              'echo "Running pre-build checks..."',
              'cd nextjs-app && npm run lint',
              'cd nextjs-app && npm run type-check',
            ],
          },
          build: {
            commands: [
              'echo "Building Next.js application..."',
              'cd nextjs-app && npm run build',
              'echo "Deploying infrastructure..."',
              'cd ../infrastructure',
              `npx cdk deploy --all --require-approval never --context stage=${props.stage}`,
            ],
          },
          post_build: {
            commands: [
              'echo "Deployment completed!"',
              'npx cdk ls --context stage=' + props.stage,
            ],
          },
        },
        artifacts: {
          files: [
            'nextjs-app/.next/**/*',
            'infrastructure/cdk.out/**/*',
          ],
        },
      }),
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.SOURCE),
      logging: {
        cloudWatch: {
          logGroup: new logs.LogGroup(this, 'DeployLogGroup', {
            logGroupName: `/aws/codebuild/nextjs-playground-deploy-${props.stage}`,
            retention: logs.RetentionDays.ONE_WEEK, // Cost optimization
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          }),
        },
      },
      timeout: cdk.Duration.minutes(30),
    });

    // Grant necessary permissions to CodeBuild
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudformation:*',
          's3:*',
          'lambda:*',
          'apigateway:*',
          'cloudfront:*',
          'dynamodb:*',
          'iam:*',
          'logs:*',
          'route53:*',
          'acm:*',
          'ssm:GetParameter*',
          'sts:AssumeRole',
        ],
        resources: ['*'],
      })
    );

    // Grant access to artifact bucket
    this.artifactBucket.grantReadWrite(deployProject);

    // Pipeline artifacts
    const sourceArtifact = new codepipeline.Artifact('SourceArtifact');
    const buildArtifact = new codepipeline.Artifact('BuildArtifact');

    // Create the pipeline
    this.pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `nextjs-playground-${props.stage}`,
      artifactBucket: this.artifactBucket,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipelineActions.GitHubSourceAction({
              actionName: 'GitHub_Source',
              owner: props.githubOwner,
              repo: props.githubRepo,
              branch: props.githubBranch,
              oauthToken: cdk.SecretValue.secretsManager('github-token'),
              output: sourceArtifact,
              trigger: codepipelineActions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipelineActions.CodeBuildAction({
              actionName: 'Deploy_Application',
              project: deployProject,
              input: sourceArtifact,
              outputs: [buildArtifact],
              environmentVariables: {
                STAGE: {
                  value: props.stage,
                },
                AWS_DEFAULT_REGION: {
                  value: this.region,
                },
              },
            }),
          ],
        },
      ],
    });

    // Add manual approval for production
    if (props.stage === 'prod') {
      this.pipeline.addStage({
        stageName: 'ManualApproval',
        actions: [
          new codepipelineActions.ManualApprovalAction({
            actionName: 'ProductionApproval',
            additionalInformation: `Please review and approve deployment to production environment.
            
Deployment details:
- Environment: ${props.stage}
- Branch: ${props.githubBranch}
- Region: ${this.region}

Review the staging environment before approving.`,
            notificationTopic: undefined, // Add SNS topic if notifications are needed
          }),
        ],
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'PipelineName', {
      value: this.pipeline.pipelineName,
      description: 'CodePipeline name',
    });

    new cdk.CfnOutput(this, 'PipelineConsoleUrl', {
      value: `https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${this.pipeline.pipelineName}/view`,
      description: 'Pipeline console URL',
    });

    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: this.artifactBucket.bucketName,
      description: 'Pipeline artifact bucket name',
    });
  }
}