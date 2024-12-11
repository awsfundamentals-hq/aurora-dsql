/// <reference path="./.sst/platform/config.d.ts" />
import dotenv from 'dotenv';
dotenv.config();

export default $config({
  app(input) {
    return {
      name: 'aurora-dsql',
      removal: 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const dsqlClusterIdentifier = process.env.CLUSTER_IDENTIFIER!;

    const api = new sst.aws.Function('api', {
      handler: 'lambda/api.handler',
      timeout: '60 seconds',
      link: [],
      url: true,
      environment: {
        CLUSTER_IDENTIFIER: dsqlClusterIdentifier,
      },
      permissions: [
        {
          actions: ['dsql:DbConnect', 'dsql:DbConnectAdmin'],
          resources: ['*'],
        },
      ],
    });

    new sst.aws.Nextjs('frontend', {
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    });
  },
});
