import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class UploadService {
  /**
   * Save uploaded file to local uploads directory
   */
  static async saveLocalFile(fileData: { filename: string; mimetype: string; file: NodeJS.ReadableStream }) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(fileData.mimetype)) {
      throw new Error('Only image files (JPEG, PNG, WebP, GIF) are permitted');
    }

    const ext = path.extname(fileData.filename) || '.jpg';
    const sanitizedFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(UPLOAD_DIR, sanitizedFilename);

    await pipeline(fileData.file, fs.createWriteStream(targetPath));

    const publicUrl = `http://localhost:4000/uploads/${sanitizedFilename}`;

    return {
      filename: sanitizedFilename,
      mimetype: fileData.mimetype,
      url: publicUrl,
    };
  }
}
