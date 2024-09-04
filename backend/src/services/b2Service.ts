import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { b2Client } from "../../config/b2Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const b2Service = {
  getSignedUrl: async (fileKey: string) => {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
    });

    try {
      const signedUrl = await getSignedUrl(b2Client, command, {
        expiresIn: 3600,
      });
      return signedUrl;
    } catch (err) {
      console.error("Error generating signed URL:", err);
      return undefined;
    }
  },

  uploadFileToB2: async (
    fileBuffer: Buffer,
    fileName: string
  ): Promise<string | undefined> => {
    try {
      const uploadedFile = await b2Client.send(
        new PutObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: fileName,
          Body: fileBuffer,
        })
      );
      return fileName;
    } catch (err) {
      console.error("upload file error: ", err);
      return undefined;
    }
  },
};

export default b2Service;
