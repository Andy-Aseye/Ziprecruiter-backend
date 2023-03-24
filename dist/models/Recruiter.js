"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let recruiterSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    organization: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },
    contactNumber: {
        type: String,
        // validate: function(v : string) {
        //     return v != "" ? /\+\d{1,3}\d{10}/.test(v) : true;
        // },
        // msg: "Review phone number format"
    },
}, { collation: { locale: "en" } });
const RecruiterInfo = mongoose_1.default.model("RecruiterInfo", recruiterSchema);
exports.default = RecruiterInfo;
