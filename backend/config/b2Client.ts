import { S3Client } from "@aws-sdk/client-s3";
import { loadSharedConfigFiles } from "@smithy/shared-ini-file-loader";

const awsProfile: string = "veterinarycomp";

const sharedConfigFiles = await loadSharedConfigFiles();

const config = sharedConfigFiles.configFile[awsProfile];
const credentials = sharedConfigFiles.credentialsFile[awsProfile];

export const b2Client = new S3Client({
  credentials: {
    accessKeyId: credentials.aws_access_key_id!,
    secretAccessKey: credentials.aws_secret_access_key!,
  },
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT_URL,
});
