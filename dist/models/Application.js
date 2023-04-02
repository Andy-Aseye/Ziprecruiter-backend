"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let appicationSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    recruiterId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: ["applied", "shortlisted", "rejected", "cancelled", "invited for interview", "on watchlist"],
        default: "applied",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
    },
    jobType: {
        type: String
    },
    dateApplied: {
        type: Date,
        default: Date.now,
    },
    dateOfJoining: {
        type: Date,
        // validate: [
        //     {
        //         // validator: function (value : Date) {
        //         //     return this.dateApplied <= value;
        //         // },
        //         msg: "dateApplied should be greater than dateOfApplication",
        //     },
        // ],
    }
}, { collation: { locale: "en" } });
const Application = mongoose_1.default.model("Applications", appicationSchema);
exports.default = Application;
