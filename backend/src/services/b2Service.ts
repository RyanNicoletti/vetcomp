import { GetObjectCommand } from "@aws-sdk/client-s3";
import { b2Client } from "../../config/b2Client";

const b2Service = {
  getObject: async (fileKey: string) => {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
    });
    try {
      const response = await b2Client.send(command);
      const arrayBuffer = await response.Body?.transformToByteArray();

      const blob = new Blob([arrayBuffer!], {
        type: response.ContentType || "application/octet-stream",
      });

      const file = new File([blob], fileKey.split("/").pop() || "file", {
        type: blob.type,
      });
      return file;
    } catch (err) {
      console.error("get object error: ", err);
      return undefined;
    }
  },
};

export default b2Service;
