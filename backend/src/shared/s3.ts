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

// Allowed media types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB max

export const s3Service = {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ url: string; key: string }> {
    // 1. File size check
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error('File size exceeds the 10MB limit');
    }

    // 2. MIME type verification
    const normalizedMime = (mimeType || 'image/jpeg').toLowerCase().split(';')[0].trim();
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      throw new Error(`Unsupported file type: ${mimeType}. Only JPG, PNG, WEBP, and GIF images are allowed.`);
    }

    // 3. File extension & name sanitization (prevent path traversal)
    const baseName = path.basename(fileName || 'image.jpg');
    let ext = path.extname(baseName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      ext = normalizedMime === 'image/png' ? '.png' : normalizedMime === 'image/webp' ? '.webp' : '.jpg';
    }

    const cleanBase = path.basename(baseName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanBase}${ext}`;
    const key = `products/${uniqueName}`;

    // If AWS credentials are valid production credentials, attempt S3 upload
    const isPlaceholderKey =
      !ENV.AWS_ACCESS_KEY_ID ||
      ENV.AWS_ACCESS_KEY_ID === 'mock_access_key' ||
      ENV.AWS_ACCESS_KEY_ID === 'your_aws_key' ||
      ENV.AWS_ACCESS_KEY_ID.includes('xxxx') ||
      ENV.AWS_ACCESS_KEY_ID.includes('your_');

    const isPlaceholderSecret =
      !ENV.AWS_SECRET_ACCESS_KEY ||
      ENV.AWS_SECRET_ACCESS_KEY === 'mock_secret_key' ||
      ENV.AWS_SECRET_ACCESS_KEY === 'your_aws_secret' ||
      ENV.AWS_SECRET_ACCESS_KEY.includes('xxxx') ||
      ENV.AWS_SECRET_ACCESS_KEY.includes('your_');

    if (!isPlaceholderKey && !isPlaceholderSecret) {
      try {
        const command = new PutObjectCommand({
          Bucket: ENV.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: fileBuffer,
          ContentType: normalizedMime,
        });

        await s3Client.send(command);
        const url = `https://${ENV.AWS_S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
        logger.info({ key, url }, 'Uploaded file to AWS S3');
        return { url, key };
      } catch (err) {
        logger.warn({ err }, 'AWS S3 upload failed. Falling back to local storage.');
      }
    }

    // Local file storage fallback with path traversal protection
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, uniqueName);
      // Ensure target file stays strictly inside uploadsDir
      if (!localFilePath.startsWith(uploadsDir)) {
        throw new Error('Invalid file destination path');
      }
      fs.writeFileSync(localFilePath, fileBuffer);
      const url = `/uploads/${uniqueName}`;
      logger.info({ url, localFilePath }, 'Saved file to local storage');
      return { url, key: uniqueName };
    } catch (localErr: any) {
      logger.error({ localErr }, 'Failed saving file locally. Returning data URI fallback.');
      const dataUri = `data:${normalizedMime};base64,${fileBuffer.toString('base64')}`;
      return { url: dataUri, key: uniqueName };
    }
  },

  async saveBase64Image(dataUriOrBase64: string, fileName = 'image.jpg'): Promise<string> {
    if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') {
      return dataUriOrBase64 || '/images/phone_purple.png';
    }
    // If it's already an http(s) URL or static asset path like /images/..., return directly
    if (dataUriOrBase64.startsWith('http://') || dataUriOrBase64.startsWith('https://') || dataUriOrBase64.startsWith('/images/')) {
      return dataUriOrBase64;
    }

    // Check if it's a data URI
    const dataUriMatch = dataUriOrBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (dataUriMatch) {
      const mimeType = `image/${dataUriMatch[1]}`;
      const rawBase64 = dataUriMatch[2];
      try {
        const buffer = Buffer.from(rawBase64, 'base64');
        const res = await this.uploadFile(buffer, fileName, mimeType);
        return res.url;
      } catch (err) {
        logger.warn({ err }, 'Failed saving base64 dataUri');
        return dataUriOrBase64;
      }
    }

    // If pure base64
    if (dataUriOrBase64.length > 200 && !dataUriOrBase64.startsWith('/')) {
      try {
        const buffer = Buffer.from(dataUriOrBase64, 'base64');
        const res = await this.uploadFile(buffer, fileName, 'image/jpeg');
        return res.url;
      } catch (err) {
        logger.warn({ err }, 'Failed saving raw base64 string');
        return dataUriOrBase64;
      }
    }

    return dataUriOrBase64;
  },

  getPublicUrl(key: string): string {
    return `https://${ENV.AWS_S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
  },
};


