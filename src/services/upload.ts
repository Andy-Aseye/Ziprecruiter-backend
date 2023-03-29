import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import HttpError from '../types';
import path from 'path';

export const uploadDocument = async (file: Express.Multer.File|undefined, acceptWord=false) => {
  if (!file) {
    throw new HttpError(400, 'Please upload document')
  }
  const ext = path.extname(file.originalname)
  if (!(ext === '.pdf' || ext === '.docx')) {
    throw new HttpError(400, 'Your document must be in a .pdf or .docx format')
  }
  const filename = `${uuidv4()}${ext}`;
  await pipeline(
    Readable.from(file.buffer),
    fs.createWriteStream(`${__dirname}/../public/documents/${filename}`)
  )
  return filename
}