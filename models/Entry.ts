import { Schema, Types, model, Document } from 'mongoose';
import User from './User';
import { EntryFields } from '../types/entry';

interface EntryDocument extends Document, EntryFields {}

const EntrySchema = new Schema<EntryDocument>(
  {
    title: {
      type: String,
      required: [true, 'Please enter title.'],
      unique: true,
      validate: {
        validator: async function (
          this: EntryDocument,
          title: string
        ): Promise<boolean> {
          if (!this.isModified('title')) return true;

          const entry = await Entry.findOne({ title });
          return !entry;
        },
        message: 'This title is already taken.',
      },
    },
    image: String || null,
    text: {
      type: String,
      required: [true, 'Please enter text'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async (id: Types.ObjectId) => await User.findById(id),
        message: 'User does not exist.',
      },
    },
  },
  { versionKey: false }
);

const Entry = model<EntryDocument>('Entry', EntrySchema);

export default Entry;
