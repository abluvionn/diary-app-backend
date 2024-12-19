import path from 'path';
import { configDotenv } from 'dotenv';

const envFile = '.env';

configDotenv({ path: envFile });

const rootPath = __dirname;

const config = {
  rootPath,
  port: (process.env['PORT'] && parseInt(process.env['PORT'])) || '8000',
  publicPath: path.join(rootPath, 'public'),
  mongoose: {
    db: process.env['MONGO_DB_URL'] || '',
  },
  IpWhiteList: ['http://localhost:5173'],
  JwtAccessExpiresAt: 60 * 15,
  JwtRefreshExpiresAt: 60 * 60 * 24 * 30,
};

export default config;
