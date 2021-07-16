# backlogとcodepipeline連携用プロジェクト

## セットアップ

### 前提

- `node.js` 12.13.0 以上
- `npm` 6.12.0 以上
- `docker`

### セットアップして開発を始める

本ディレクトリで以下コマンドを実行

```
$ npm ci
$ npm start
```

### デプロイ

本ディレクトリで以下を実行

```
$ npm run deploy
```

※serverless framework でデプロイを行うため、適切な権限を持った iam アカウントが必要です。
