import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const uploadDir = path.resolve(__dirname, '../../uploads/reports');

// Ensure uploads/reports folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate safe, collision-resistant filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, PNG, and WEBP files are accepted.'));
  }
};

export const reportUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 10MB default
  },
  fileFilter,
});
