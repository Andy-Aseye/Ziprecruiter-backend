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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Recruiter_1 = __importDefault(require("../models/Recruiter"));
const JobApplicant_1 = __importDefault(require("../models/JobApplicant"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../middleware/config"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = express_1.default.Router();
// Here we signup the user by storing req data into the schema model.
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const user = new User_1.default({
            email: data.email,
            password: data.password,
            type: data.type,
        });
        yield user.save();
        const userDetails = user.type === "applicant" ? new JobApplicant_1.default({
            userId: user._id,
            name: data.name,
            education: data.education,
            skills: data.skills,
            yearsOfExperience: data.yearsOfExperience,
            resume: data.resume.name,
            profile: data.profile.name,
        }) : new Recruiter_1.default({
            userId: user._id,
            name: data.name,
            organization: data.organization,
            position: data.position,
            contactNumber: data.contactNumber,
        });
        yield userDetails.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id, type: user.type, email: user.email }, config_1.default.jwtSecret, { expiresIn: "8h" });
        res.json({
            token: token,
            type: user.type,
            email: user.email
        });
    }
    catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Email already exists" });
        }
        else if (err.name === "ValidationError") {
            console.log(err);
            yield User_1.default.deleteOne({ _id: err._id });
            res.status(400).json({ error: err.message });
        }
        else {
            res.status(500).json({ error: err.message });
        }
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Email does not exist" });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, type: user.type }, JWT_SECRET);
        res.status(200).json({
            token,
            // user
            // type: user.type,
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error in login" });
    }
}));
exports.default = module.exports = router;
