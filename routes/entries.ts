import express from 'express';
import mongoose from 'mongoose';
import { clearImage, imagesUpload } from '../multer';
import auth from '../middleware/Auth';
import { EntryFields } from '../types/entry';
import { RequestWithUser } from '../types/user';
import Entry from '../models/Entry';

const entriesRouter = express.Router();

entriesRouter.post(
  '/',
  auth,
  imagesUpload.single('image'),
  async (req: RequestWithUser, res, next) => {
    try {
      const entryData: EntryFields = {
        title: req.body.title,
        image: req.file ? req.file.filename : null,
        text: req.body.text,
        author: req.user._id
      };

      const entry = new Entry(entryData);
      await entry.save();

      return res.send(entry);
    } catch (error) {
      if (req.file) {
        clearImage(req.file.filename);
      }
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(422).send(error);
      }
      next(error);
    }
  }
);

entriesRouter.get('/', async (_req, res, next) => {
  try {
    const entries = await Entry.find();
    return res.send(entries);
  } catch (error) {
    next(error);
  }
});

export default entriesRouter;
