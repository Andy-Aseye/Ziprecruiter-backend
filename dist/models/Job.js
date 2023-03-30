"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let jobSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    skills: [String],
    description: {
        type: String,
        required: true,
    },
    jobType: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        min: 0,
    },
    salary: {
        type: String,
    },
});
const Job = mongoose_1.default.model("Job", jobSchema);
exports.default = Job;
// acceptedCandidates: {
//   type: Number,
//   default: 0,
//   // validate: [
//   //   {
//   //     validator: Number.isInteger,
//   //     msg: "acceptedCandidates should be an integer",
//   //   },
//   //   {
//   //     validator: function (value: any) {
//   //       return value >= 0;
//   //     },
//   //     msg: "acceptedCandidates should greater than equal to 0",
//   //   },
//   // ],
// },
// dateOfPosting: {
//   type: Date,
//   default: Date.now,
// },
// Duration validator
// validate: [
//   {
//     validator: Number.isInteger,
//     msg: "Duration should be an integer",
//   },
// ],
// Salary validator
// validate: [
//   // {
//   //   validator: Number.isInteger,
//   //   msg: "Salary should be an integer",
//   // },
//   // {
//   //   validator: function (value: any) {
//   //     return value >= 0;
//   //   },
//   //   msg: "Salary should be positive",
//   // },
// ],
