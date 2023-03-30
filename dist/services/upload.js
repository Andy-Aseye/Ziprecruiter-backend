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
exports.uploadDocument = void 0;
const promises_1 = require("stream/promises");
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const types_1 = __importDefault(require("../types"));
const path_1 = __importDefault(require("path"));
const uploadDocument = (file, acceptWord = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new types_1.default(400, 'Please upload document');
    }
    const ext = path_1.default.extname(file.originalname);
    if (!(ext === '.pdf' || ext === '.docx')) {
        throw new types_1.default(400, 'Your document must be in a .pdf or .docx format');
    }
    const filename = `${(0, uuid_1.v4)()}${ext}`;
    yield (0, promises_1.pipeline)(stream_1.Readable.from(file.buffer), fs_1.default.createWriteStream(`${__dirname}/../public/documents/${filename}`));
    return filename;
});
exports.uploadDocument = uploadDocument;
