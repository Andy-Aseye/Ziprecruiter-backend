"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const DBstring = process.env.DB;
mongoose_1.default.connect(DBstring, { useNewUrlparser: true })
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err));
mongoose_1.default.connection.on('error', (err) => {
    console.log(err);
});
