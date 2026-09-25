import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from '../config/env.config.js';
import { logger } from './logger.js';

const uploadsDir = path.resolve(process.cwd(), 'public/uploads');

// Ensure public/uploads folder exists locally
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  logger.warn({ err }, 'Could not create uploads directory');
}

export const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

export const s3Service = {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; key: string }> {
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedName}`;
    const key = `products/${uniqueName}`;

    // If AWS credentials are valid production credentials, attempt S3 upload
    if (
      ENV.AWS_ACCESS_KEY_ID &&
      ENV.AWS_ACCESS_KEY_ID !== 'mock_access_key' &&
      ENV.AWS_SECRET_ACCESS_KEY !== 'mock_secret_key'
    ) {
      try {
        const command = new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        });

        await s3Client.send(command);
        const url = `https://${ENV.AWS_S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
        logger.info({ key, url }, 'Uploaded file to AWS S3');
        return { url, key };
      } catch (err) {
        logger.warn({ err }, 'AWS S3 upload failed. Falling back to local storage.');
      }
    }

    // Local file storage fallback
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(localFilePath, fileBuffer);
      const url = `http://localhost:${ENV.PORT}/uploads/${uniqueName}`;
      logger.info({ url, localFilePath }, 'Saved file to local storage');
      return { url, key: uniqueName };
    } catch (localErr) {
      logger.error({ localErr }, 'Failed saving file locally. Returning data URI fallback.');
      const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      return { url: dataUri, key: uniqueName };
    }
  },

  getPublicUrl(key: string): string {
    return `https://${ENV.AWS_S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
  },
};

