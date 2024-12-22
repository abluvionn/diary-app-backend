import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';

const envFile = '.env';

configDotenv({ path: envFile });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;