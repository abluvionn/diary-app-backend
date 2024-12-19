import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config';
import usersRouter from './routes/users';
import cookieParser from 'cookie-parser';

const app = express();
const localhost = `http://localhost:${config.port}`;

app.use(
  cors({
    origin: config.IpWhiteList,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use('/users', usersRouter);

const run = async () => {
  await mongoose.connect(config.mongoose.db);

  app.listen(config.port, () => {
    console.log(`Server running at ${localhost}`);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

void run();
