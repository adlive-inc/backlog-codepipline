import type { AWS } from '@serverless/typescript';

import backlogWebhook from '@functions/backlog-webhook';

const serverlessConfiguration: AWS = {
  service: 'backlog-codepipeline',
  frameworkVersion: '2',
  variablesResolutionMode: '20210326',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    s3: {
      host: 'localhost',
      directory: `${__dirname}/s3-local`,
    },
  },
  resources: {
    Resources: {
      NewResource: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '{your-bucket-nema}',
        },
      },
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline', 'serverless-s3-local'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'ap-northeast-1',
    memorySize: 512,
    timeout: 30,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      // ①
      BACKLOG_USER_NAME: '${ssm:backlog-username}',
      BACKLOG_PASSWORD: '${ssm:backlog-password}',
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      { // ②
        Effect: 'Allow',
        Action: ['s3:PutObject'],
        Resource: '*',
      },
    ],
  },
  // import the function via paths
  functions: { backlogWebhook },
};

module.exports = serverlessConfiguration;
