import multer from 'multer';
import { promises as fs } from 'fs';
import { resolve, extname } from 'node:path';
import { randomUUID } from 'crypto';
import config from './config';
import { unlink } from 'node:fs';

const imageStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const destDir = resolve(config.publicPath, 'images');
    await fs.mkdir(destDir, { recursive: true });
    cb(null, config.publicPath);
  },

  filename: (_req, file, cb) => {
    const extension = extname(file.originalname);
    cb(null, 'images/' + randomUUID() + extension);
  },
});

const fileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not supported file type.'));
  }
};

export const imagesUpload = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export const clearImage = (imageName: string) => {
  unlink(resolve(config.publicPath, imageName), (err) => {
    if (err) {
      console.log("File doesn't exist!");
      throw err;
    }
  });
};
