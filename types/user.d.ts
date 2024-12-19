import { JwtPayload } from 'jsonwebtoken';
import { HydratedDocument, Model } from 'mongoose';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: HydratedDocument<UserFromDb>;
}

export interface UserFields {
  email: string;
  password: string;
}

export interface UserFromDb extends Omit<UserFields, 'password'> {
  _id: any;
}

export interface DecodedJwt extends JwtPayload {
  user?: string;
}

export interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
}

export type UserModel = Model<UserFields, object, UserMethods>;
