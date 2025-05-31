#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SharedStack } from '../lib/stacks/shared-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';

const app = new cdk.App();

// Get stage from context or default to 'dev'
const stage = app.node.tryGetContext('stage') || 'dev';

// Validate stage
const validStages = ['dev', 'staging', 'prod'];
if (!validStages.includes(stage)) {
  throw new Error(`Invalid stage: ${stage}. Valid stages are: ${validStages.join(', ')}`);
}

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1', // CloudFront requires us-east-1 for some resources
};

// Stack naming convention
const stackPrefix = `nextjs-playground-${stage}`;

// Create shared resources stack
const sharedStack = new SharedStack(app, `${stackPrefix}-shared`, {
  env,
  stage,
  description: `Shared resources for Next.js Playground - ${stage} environment`,
  tags: {
    Environment: stage,
    Project: 'nextjs-playground',
    ManagedBy: 'CDK',
  },
});

// Create frontend stack
const frontendStack = new FrontendStack(app, `${stackPrefix}-frontend`, {
  env,
  stage,
  sharedStack,
  description: `Frontend infrastructure for Next.js Playground - ${stage} environment`,
  tags: {
    Environment: stage,
    Project: 'nextjs-playground',
    ManagedBy: 'CDK',
  },
});

// Add dependency
frontendStack.addDependency(sharedStack);

// Add stack-level tags
cdk.Tags.of(app).add('Project', 'nextjs-playground');
cdk.Tags.of(app).add('Environment', stage);
cdk.Tags.of(app).add('ManagedBy', 'CDK');