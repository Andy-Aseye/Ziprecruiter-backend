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
const authMiddleware_1 = require("../middleware/authMiddleware");
const Job_1 = __importDefault(require("../models/Job"));
const router = express_1.default.Router();
// First let me create a route to add jobs. this should only be allow by recruiter type users.
router.post("/jobs", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }
        if (user.type != "recruiter") {
            res.status(401).json({
                message: "You don't have permission to add jobs",
            });
            return;
        }
        // This code runs meaning the user is a recruiter. We set the data to the inputs sent from the add job form in the frontend
        const data = req.body;
        const job = new Job_1.default({
            // userId is the id of the recruiter this implies the job schema stores the recruiter details as well 
            userId: user.id,
            title: data.title,
            maxApplicants: data.maxApplicants,
            maxPositions: data.maxPositions,
            dateOfPosting: data.dateOfPosting,
            deadline: data.deadline,
            skillsets: data.skillsets,
            jobType: data.jobType,
            duration: data.duration,
            salary: data.salary,
            rating: data.rating,
        });
        yield job.save();
        res.json({ message: "Job added successfully to the database" });
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
exports.default = module.exports = router;
