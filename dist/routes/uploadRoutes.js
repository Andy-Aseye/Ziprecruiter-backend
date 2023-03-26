"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
const pipeline = (0, util_1.promisify)(stream_1.pipeline);
const pipelineAsync = (0, util_1.promisify)(require("stream").pipeline);
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/resume', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({
            message: 'File not uploaded',
        });
        return;
    }
    const file = req.file;
    console.log(file);
    const ext = path_1.default.extname(file.originalname);
    if (ext !== '.pdf') {
        res.status(400).json({
            message: 'Invalid format',
        });
    }
    else {
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        console.log(typeof file.stream, file.stream);
        pipeline(file.stream, fs_1.default.createWriteStream(`${__dirname}/../public/resume/${filename}`))
            .then(() => {
            res.send({
                message: 'File uploaded successfully',
                url: `/host/resume/${filename}`,
            });
        })
            .catch((err) => {
            console.log(err);
            res.status(400).json({
                message: 'Error while uploading',
            });
        });
    }
}));
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
router.post("/profile", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            throw new Error("File is missing");
        }
        const ext = path_1.default.extname(file.originalname);
        if (!file) {
            throw new Error("File is missing");
        }
        if (ext !== ".jpg" && ext !== ".png") {
            res.status(400).json({
                message: "Invalid format"
            });
        }
        else {
            const filename = `${(0, uuid_1.v4)()}${ext}`;
            yield pipelineAsync(file.stream, fs_1.default.createWriteStream(`${__dirname}/../public/profile/${filename}`));
            res.send({
                message: "Profile image uploaded successfully",
                url: `/host/profile/${filename}`,
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Error while uploading",
        });
    }
}));
exports.default = module.exports = router;
