import express, { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import VerifyRefreshToken from '../middleware/VerifyRefreshToken';
import config from '../config';
import User from '../models/User';
import { RequestWithUser } from '../types/user';

configDotenv();

const usersRouter = express.Router();

usersRouter.post('/', userRegister);
usersRouter.post('/sessions', userLogin);
usersRouter.get('/refresh', VerifyRefreshToken, userRefreshToken);
usersRouter.delete('/logout', userLogout);

async function userRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = new User({
      email: email,
      password: password,
    });

    await user.save();
    return res.send(user);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      return res.status(422).send({ error: e });
    }
    next(e);
  }
}

async function userLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send({
        error: 'Incorrect email or password',
      });
    }

    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      return res.status(401).send({
        error: 'Incorrect email or password',
      });
    }

    const accessToken = jwt.sign(
      { user: user._id },
      `${process.env.JWT_ACCESS}`,
      {
        expiresIn: `${config.JwtAccessExpiresAt}s`,
      }
    );

    const refreshToken = jwt.sign(
      { user: user._id },
      `${process.env.JWT_REFRESH}`,
      {
        expiresIn: `${config.JwtRefreshExpiresAt}ms`,
      }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt,
    });

    return res.send({ accessToken, user });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      return res.status(422).send({ error: e });
    }

    next(e);
  }
}

async function userRefreshToken(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findOne({ _id: req.user?.id });

    const accessToken = jwt.sign(
      { user: req.user?._id },
      `${process.env.JWT_ACCESS}`,
      {
        expiresIn: `${config.JwtAccessExpiresAt}s`,
      }
    );
    const refreshToken = jwt.sign(
      { user: req.user?._id },
      `${process.env.JWT_REFRESH}`,
      {
        expiresIn: `${config.JwtRefreshExpiresAt}s`,
      }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: config.JwtRefreshExpiresAt,
    });

    return res.send({ accessToken, user });
  } catch (e) {
    next(e);
  }
}

function userLogout(_req: Request, res: Response, next: NextFunction) {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
    });

    return res.status(200).send('Refresh token cleared!');
  } catch (e) {
    next(e);
  }
}

export default usersRouter;
