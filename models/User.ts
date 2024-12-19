import { Schema, model, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserFields } from '../types/user';

const SALT_WORK_FACTOR = 10;

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
}

interface UserDocument extends Document, UserFields, UserMethods {}

type UserModel = Model<UserDocument>;

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      validate: {
        validator: async function (
          this: UserDocument,
          email: string
        ): Promise<boolean> {
          if (!this.isModified('email')) return true;

          const user = await User.findOne({ email });
          return !user;
        },
        message: 'This email is already taken.',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      validate: {
        validator: function (password: string) {
          return password.length >= 5;
        },
        message: 'Your password must be at least 5 characters.',
      },
    },
  },
  { versionKey: false }
);

UserSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

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

const User = model<UserDocument, UserModel>('User', UserSchema);

export default User;
