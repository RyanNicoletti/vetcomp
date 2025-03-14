import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { b2Client } from "../../config/b2Client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
declare module "uuid";

const b2Service = {
  getSignedUrl: async (
    fileKey: string,
    bucketType: "verification" | "resume" = "verification"
  ) => {
    const bucketName =
      bucketType === "resume"
        ? process.env.B2_RESUME_BUCKET_NAME
        : process.env.B2_VERIFICATION_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucketName,
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
    originalFileName: string,
    bucketType: "verification" | "resume" = "verification",
    userId: string
  ): Promise<{ key: string; originalName: string } | undefined> => {
    try {
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const userIdPrefix = `${userId}-`;

      // Extract file extension
      const fileExtension = originalFileName.split(".").pop() || "";
      const sanitizedFileName = originalFileName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .substring(0, 50); // Limit length to avoid extremely long filenames

      const uniqueKey = `${userIdPrefix}${timestamp}-${uniqueId}-${sanitizedFileName}`;

      const bucketName =
        bucketType === "resume"
          ? process.env.B2_RESUME_BUCKET_NAME
          : process.env.B2_BUCKET_NAME;

      await b2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueKey,
          Body: fileBuffer,
          ContentType: getContentType(fileExtension),
        })
      );

      // Return both the unique key and the original file name
      return {
        key: uniqueKey,
        originalName: originalFileName,
      };
    } catch (err) {
      console.error("upload file error: ", err);
      return undefined;
    }
  },

  getDownloadHeaders: async (
    fileKey: string,
    bucketType: "verification" | "resume" = "verification"
  ) => {
    const bucketName =
      bucketType === "resume"
        ? process.env.B2_RESUME_BUCKET_NAME
        : process.env.B2_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    try {
      return {
        command,
        fileName: fileKey,
      };
    } catch (err) {
      console.error("Error preparing download headers:", err);
      return undefined;
    }
  },
};
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
  };

  return contentTypes[extension.toLowerCase()] || "application/octet-stream";
}
export default b2Service;
