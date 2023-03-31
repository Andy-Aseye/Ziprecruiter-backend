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
const upload_1 = require("../services/upload");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post('/resume', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.file);
        const filename = yield (0, upload_1.uploadDocument)(req.file);
        res.send({
            message: 'Resume uploaded successfully',
            url: `/documents/${filename}`,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.post("/cover-letter", upload.single("file"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.file);
        const filename = yield (0, upload_1.uploadDocument)(req.file);
        res.send({
            message: 'Cover letter uploaded successfully',
            url: `/documents/${filename}`,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = module.exports = router;
