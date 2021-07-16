#!/bin/sh

cd `dirname $0`
unzip package/backlog-codepipeline.zip -d package/backlog-codepipeline
cp -r src/git* package/backlog-codepipeline/
cp -r src/lib/ package/backlog-codepipeline/
rm package/backlog-codepipeline.zip
cd package/backlog-codepipeline
zip -9yr ../backlog-codepipeline.zip *
cd ../
rm -r backlog-codepipeline
cd ../

node edit-serverless-jsons.mjs
