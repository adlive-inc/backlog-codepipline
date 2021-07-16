import 'source-map-support/register';
import * as child from 'child_process';
import * as util from 'util';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import * as AWS from 'aws-sdk';
import schema from './schema';
import { FromSchema } from 'json-schema-to-ts';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { S3 } from 'aws-sdk';

const backlogWebhook: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    if (!isTargetEvent(event.body)) {
      return formatJSONResponse({
        messaeg: 'do noting',
      });
    }
    if (isProductionDeploy(event.body.content)) {
      // ①
      await uploadSourceToS3(event.body.content, 'production.zip');
      return formatJSONResponse({
        message: 'deploy production',
      });
    }
    if (isDevelopDeploy(event.body.content)) {
      // ①
      await uploadSourceToS3(event.body.content, 'develop.zip');
      return formatJSONResponse({
        message: 'deploy develop',
      });
    }
    // ①
    await uploadSourceToS3(event.body.content, 'test.zip');
    return formatJSONResponse({
      message: 'do test only',
    });
  };

type Body = FromSchema<typeof schema>;

const isTargetEvent = (body: Body): boolean => {
  const targetProjectKeys = ['PROJECTKEY'];
  const targetRepositories = ['repository-name'];
  return (
    targetProjectKeys.includes(body.project.projectKey) &&
    targetRepositories.includes(body.content.repository.name) &&
    (body.content.change_type === 'create' ||
      body.content.change_type === 'update') //
  );
};

type Content = FromSchema<typeof schema.properties.content>;

const isProductionDeploy = (content: Content): boolean => {
  return (
    content.change_type === 'create' && content.ref.indexOf('refs/tags') > -1
  );
};
const isDevelopDeploy = (content: Content): boolean => {
  return (
    (content.change_type === 'create' || content.change_type === 'update') &&
    content.ref === 'refs/heads/master'
  );
};

const uploadSourceToS3 = async (
  content: Content,
  s3fileName: string
): Promise<void> => {
  const sourceDir = `${
    process.env.NODE_ENV === 'production' ? '' : process.cwd()
  }/tmp/${new Date().getTime()}`;
  await gitClone(content.repository.name, content.ref.split('/')[2], sourceDir);

  const zipFilePath = await zip(sourceDir);

  await uploadS3(s3fileName, fs.createReadStream(zipFilePath));

  fs.unlinkSync(zipFilePath);
  fs.rmdirSync(sourceDir, { recursive: true });
};

const GIT_USER_NAME = process.env.BACKLOG_USER_NAME;
const GIT_PASSWORD = process.env.BACKLOG_PASSWORD;
const PATH = process.env.NODE_ENV === 'production' ? '/var/task/' : '';
const gitClone = async (
  repositoryName: string,
  branchName: string,
  sourcePath: string
): Promise<void> => {
  // ②
  await exec(
    `PATH=$PATH:${PATH} ${
      process.env.NODE_ENV === 'production'
        ? `GIT_TEMPLATE_DIR=${PATH}git-core/templates `
        : ''
    }git clone -b ${branchName} --depth 1 https://${GIT_USER_NAME}:${GIT_PASSWORD}@your-domain.backlog.jp/git/PROJECTKEY/${repositoryName}.git ${sourcePath}`
  );
  console.log('git clone end');
};

const zip = (sourceDir: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const zipPath = `${sourceDir}.zip`;
    const output = fs.createWriteStream(zipPath);
    output.on('close', () => {
      console.log('zip end');
      resolve(zipPath);
    });
    output.on('error', (err) => {
      reject(err);
    });
    const archive = archiver('zip');
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

const S3_OPTION: AWS.S3.ClientConfiguration =
  process.env.NODE_ENV === 'production'
    ? {}
    : {
        s3ForcePathStyle: true,
        accessKeyId: 'S3RVER',
        secretAccessKey: 'S3RVER',
        endpoint: new AWS.Endpoint('http://localhost:4569'),
      };
const BUCKET_NAME = '{your-bucket-name}';
const uploadS3 = async (key: string, content: S3.Body): Promise<void> => {
  const s3 = new AWS.S3(S3_OPTION);
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
    })
    .promise();
};

const exec = util.promisify(child.exec);
export const main = middyfy(backlogWebhook);
