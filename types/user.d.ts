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
  _id: ObjectId;
}

export interface DecodedJwt extends JwtPayload {
  user?: string;
}
