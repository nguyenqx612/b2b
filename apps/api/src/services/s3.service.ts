import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const client = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;
const SIGNED_URL_EXPIRY = 3600; // 1 hour

async function uploadFile(opts: {
  buffer: Buffer;
  mimetype: string;
  folder: string;
  filename?: string;
}): Promise<string> {
  const ext = opts.mimetype.split('/')[1] ?? 'bin';
  const key = `${opts.folder}/${opts.filename ?? randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: opts.buffer,
      ContentType: opts.mimetype,
    }),
  );

  return key;
}

async function getSignedUrl(key: string): Promise<string> {
  return awsGetSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: SIGNED_URL_EXPIRY,
  });
}

async function deleteFile(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export const s3Service = { uploadFile, getSignedUrl, deleteFile };
