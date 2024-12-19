import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserFields, UserMethods, UserModel } from '../types/user';

const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema<UserFields, UserModel, UserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required!'],
    },
    password: {
      type: String,
      required: [true, 'Password is required!'],
    },
  },
  { versionKey: false },
);

UserSchema.methods.checkPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = model<UserFields, UserModel>('User', UserSchema);

export default User;
