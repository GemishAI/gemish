import { type NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { env } from "@/env.mjs";
import { withUnkey } from "@unkey/nextjs";
import { auth } from "@/lib/auth";
import limiter from "@/lib/ratelimit";
import { headers } from "next/headers";

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

export const POST = withUnkey(
  async (request: NextRequest) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { fileName, fileType }: { fileName: string; fileType: string } =
        body;

      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: "fileName and fileType are required" },
          { status: 400 }
        );
      }
      console.log(fileName, fileType);

      // Generate a unique file name
      const fileExtension = fileName.split(".").pop();
      const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
      const key = `uploads/${uniqueFileName}`;

      // Create command for S3 put operation
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // URL expires in 1 hour
      });

      console.log(presignedUrl);

      return NextResponse.json({
        success: true,
        presignedUrl,
        key,
        url: `${env.AWS_ENDPOINT_URL}/${key}`,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return NextResponse.json(
        { error: "Error generating presigned URL" },
        { status: 500 }
      );
    }
  },
  { apiId: env.UNKEY_API_ID }
);
