import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const imageUpload = async (file: UploadFile): Promise<string> => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG and WebP are allowed');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  const fileExt = path.extname(file.originalname);
  const randomName = crypto.randomBytes(16).toString('hex');
  const fileName = `${randomName}${fileExt}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await fs.promises.writeFile(filePath, file.buffer);

  return `/uploads/${fileName}`;
};
