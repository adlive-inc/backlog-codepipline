import * as child from 'child_process';
import * as util from 'util';
import * as fs from 'fs';

const main = async () => {
  const cloudformationTemplateUpdateStack = JSON.parse(
    fs.readFileSync(
      'package/cloudformation-template-update-stack.json',
      'utf-8'
    )
  );
  const serverlessState = JSON.parse(
    fs.readFileSync('package/serverless-state.json', 'utf-8')
  );
  const targetObjectName = Object.keys(
    serverlessState.service.provider.compiledCloudFormationTemplate.Resources
  ).find((x) => x.indexOf('LambdaVersion') > -1);
  delete cloudformationTemplateUpdateStack.Resources[targetObjectName]
    .Properties.CodeSha256;
  delete serverlessState.service.provider.compiledCloudFormationTemplate
    .Resources[targetObjectName].Properties.CodeSha256;
  fs.writeFileSync(
    'package/serverless-state.json',
    JSON.stringify(serverlessState)
  );
  fs.writeFileSync(
    'package/cloudformation-template-update-stack.json',
    JSON.stringify(cloudformationTemplateUpdateStack)
  );
};

main();
