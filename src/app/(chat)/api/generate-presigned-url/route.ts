import { type NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";
import { env } from "@/env.mjs";

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

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { fileName, fileType }: { fileName: string; fileType: string } = body;

		if (!fileName || !fileType) {
			return NextResponse.json(
				{ error: "fileName and fileType are required" },
				{ status: 400 },
			);
		}

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

		return NextResponse.json({
			success: true,
			presignedUrl,
			key,
			url: `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
		});
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Error generating presigned URL" },
			{ status: 500 },
		);
	}
}
