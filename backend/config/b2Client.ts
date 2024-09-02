import { S3Client } from "@aws-sdk/client-s3";

export const b2Client = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_KEYID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT_URL,
});

console.log(process.env.B2_REGION);
