import express from 'express';
import mongoose from 'mongoose';
import { clearImage, imagesUpload } from '../multer';
import auth from '../middleware/Auth';
import { EntryFields } from '../types/entry';
import { RequestWithUser } from '../types/user';
import Entry from '../models/Entry';
import cloudinary from '../cloudinary';
import { UploadApiResponse } from 'cloudinary';

const entriesRouter = express.Router();

entriesRouter.post(
  '/',
  auth,
  imagesUpload.single('image'),
  async (req: RequestWithUser, res, next) => {
    try {
      let imageUploadResult: UploadApiResponse | null = null;
      if (req.file) {
        imageUploadResult = await cloudinary.uploader.upload(req.file.path);
      }

      const entryData: EntryFields = {
        title: req.body.title,
        image: imageUploadResult ? imageUploadResult.secure_url : null,
        text: req.body.text,
        author: req.user._id,
      };

      const entry = new Entry(entryData);
      await entry.save();

      const entryToSend = await Entry.findOne({ _id: entry._id }).populate(
        'author',
        'email'
      );

      return res.send(entryToSend);
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
    const entries = await Entry.find().populate('author', 'email');
    return res.send(entries);
  } catch (error) {
    next(error);
  }
});

export default entriesRouter;
