"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let applicantSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    education: [
        {
            institutionName: {
                type: String,
                required: true,
            },
            startYear: {
                type: Number,
                required: true,
                min: 1960,
                max: new Date().getFullYear(),
                validate: Number.isInteger,
            },
            endYear: {
                type: Number,
                required: true,
                max: new Date().getFullYear(),
                // validate: [
                //     {
                //         validator: Number.isInteger, 
                //         msg: "Year value should be a number"
                //     },
                //     {
                //         // validator: function (value: any) {
                //         //     return this.StartYear <= value;
                //         // },
                //         msg: "End year value cannot be less than start year"
                //     },
                // ],
            },
        },
    ],
    // I'm storing each skill as a string and returning skills as an array of strings of skills.
    skills: [String],
    // rating: {
    // }
    yearsOfExperience: {
        type: Number,
        required: true,
        default: "Not specified"
    },
    resume: {
        type: String,
    },
    profile: {
        type: String,
    },
}, { collation: { locale: "en" } });
const JobApplicantInfo = mongoose_1.default.model("JobApplicantInfo", applicantSchema);
exports.default = JobApplicantInfo;
