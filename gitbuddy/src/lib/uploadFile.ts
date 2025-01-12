"use server"

import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from 'dotenv'

dotenv.config()

// Function to generate pre-signed URL for S3 upload
export async function generatePresignedUrl(fileName: string, fileType: string) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })

  const file_name = `raghu/${fileName}`
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: file_name,
    ContentType: fileType,
  })

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 172800 }) // URL valid for 5 minutes
    return url
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    throw new Error('Could not generate pre-signed URL')
  }
}

