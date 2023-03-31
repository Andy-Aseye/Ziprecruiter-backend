import express, { Request, Response, NextFunction } from 'express';
import multer, {Multer} from 'multer';
import { uploadDocument } from '../services/upload';

const router = express.Router();

const upload: Multer = multer();

router.post('/resume', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.file)
    const filename = await uploadDocument(req.file)
    res.send({
      message: 'Resume uploaded successfully',
      url: `/documents/${filename}`,
    });

  } catch (err) {
    next(err)
  }
});

router.post("/cover-letter", upload.single("file"), async (req: Request, res: Response, next) => {
  try {
    console.log(req.file)
    const filename = await uploadDocument(req.file)
    res.send({
      message: 'Cover letter uploaded successfully',
      url: `/documents/${filename}`,
    });

  } catch (err) {
    next(err)
  }
})




  export default module.exports = router;