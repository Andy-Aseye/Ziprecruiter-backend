import express, {Request, Response} from 'express';
import multer, {Multer} from 'multer';
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';


// const pipeline = promisify(pipelineCallback);
const pipelineAsync = promisify(require("stream").pipeline);



const router = express.Router();

const upload: Multer = multer();




router.post('/resume', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      message: 'File not uploaded',
    });
    return;
  }

  const file: Express.Multer.File = req.file;
  console.log(file);
  const ext = path.extname(file.originalname);

  if (ext !== '.pdf') {
    res.status(400).json({
      message: 'Invalid format',
    });
  } else {
    const filename = `${uuidv4()}${ext}`;
    try {
      await pipeline(
        Readable.from(file.buffer),
        fs.createWriteStream(`${__dirname}/../public/resume/${filename}`)
      )
      res.send({
        message: 'File uploaded successfully',
        url: `/host/resume/${filename}`,
      });

    } catch (err) {
      console.log(err)
      res.status(400).json({
        message: 'Error while uploading',
      });
    }
      // .then(() => {
      //   res.send({
      //     message: 'File uploaded successfully',
      //     url: `/host/resume/${filename}`,
      //   });
      // })
      // .catch((err) => {
      //   console.log(err);
      //   res.status(400).json({
      //     message: 'Error while uploading',
      //   });
      // });
  }
});

// router.post('/resume', upload.single('file'), async (req: Request, res: Response) => {
//   // try {

//     if (!req.file) {
//       res.status(400).json({
//         message: 'File not uploaded',
//       });
//       return;
//     }
  
//     const file = req.file;
//     console.log(file)
//     const ext = path.extname(file.originalname);
    
//     if (ext !== '.pdf') {
//       res.status(400).json({
//         message: 'Invalid format',
//       });
//     } else {
//       const filename = `${uuidv4()}${ext}`;
  
//       console.log(typeof file.stream, file.stream)
//       pipeline(
//         file.stream,
//         fs.createWriteStream(`${__dirname}/../public/resume/${filename}`)
//       )
//         .then(() => {
//           res.send({
//             message: 'File uploaded successfully',
//             url: `/host/resume/${filename}`,
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(400).json({
//             message: 'Error while uploading',
//           });
//         });
//       }
    // } catch (e) {
    //   console.log(e)
    //   res.status(400).json({
    //     message: 'Error while uploading',
    //   });
    // }
  // });


  router.post("/profile", upload.single("file"), async (req: Request, res: Response) => {

    try{

      const file = req.file;

      if (!file) {
        throw new Error("File is missing");
      }

      const ext = path.extname(file.originalname);
      if (!file) {
        throw new Error("File is missing");
      }

      if ( ext !== ".jpg" && ext !== ".png" ) {
        res.status(400).json({
          message: "Invalid format"
        });
      } else {
        const filename = `${uuidv4()}${ext}`;

        await pipelineAsync(
          file.stream,
          fs.createWriteStream(`${__dirname}/../public/profile/${filename}`)
        );

        res.send({
          message: "Profile image uploaded successfully",
          url: `/host/profile/${filename}`,
        });
      } 
    }
    catch(error) {
      res.status(400).json({
        message: "Error while uploading",
      })
    }
  })




  export default module.exports = router;