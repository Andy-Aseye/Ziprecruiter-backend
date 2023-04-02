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
const multer_1 = __importDefault(require("multer"));
const upload_1 = require("../services/upload");
const types_1 = __importDefault(require("../types"));
const authRoutesValidators_1 = require("../validators/authRoutesValidators");
const validator_1 = __importDefault(require("../middleware/validator"));
const upload = (0, multer_1.default)();
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = express_1.default.Router();
// Here we signup the user by storing req data into the schema model.
router.post("/signup/applicant", upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
]), (0, validator_1.default)(authRoutesValidators_1.signupApplicantSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files == undefined) {
        next(new types_1.default(400, "Resume and cover letter are both required"));
        return;
    }
    // @ts-ignore
    let resumeFile = req.files["resume"];
    // @ts-ignore
    let coverLetterFile = req.files["coverLetter"];
    if (resumeFile == undefined || coverLetterFile == undefined) {
        next(new types_1.default(400, "Resume and cover letter are both required"));
        return;
    }
    try {
        const { email, password, name, education, skills, yearsOfExperience } = req.body;
        const existingUserWithSameEmail = yield User_1.default.exists({ email });
        if (existingUserWithSameEmail) {
            next(new types_1.default(400, "User with this email already exists"));
            return;
        }
        const resume = yield (0, upload_1.uploadDocument)(resumeFile[0]);
        const coverLetter = yield (0, upload_1.uploadDocument)(coverLetterFile[0]);
        const user = new User_1.default({ email, password, type: "applicant" });
        const { _id: userId } = yield user.save();
        const applicant = new JobApplicant_1.default({
            userId,
            name,
            education,
            skills: JSON.parse(skills),
            yearsOfExperience: Number(yearsOfExperience),
            resume,
            coverletter: coverLetter,
        });
        yield applicant.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id, type: user.type, email: user.email }, config_1.default.jwtSecret, { expiresIn: "8h" });
        res
            .status(201)
            .json({ token: token, type: user.type, email: user.email });
    }
    catch (err) {
        next(err);
    }
}));
router.post("/signup/recruiter", (0, validator_1.default)(authRoutesValidators_1.signupRecruiterSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, organization, position, contactNumber } = req.body;
    try {
        const existingUserWithSameEmail = yield User_1.default.exists({ email });
        if (existingUserWithSameEmail) {
            next(new types_1.default(400, "User with this email already exists"));
            return;
        }
        const user = new User_1.default({ email, password, type: "recruiter" });
        const { _id: userId } = yield user.save();
        const recruiter = new Recruiter_1.default({
            userId,
            name,
            organization,
            position,
            contactNumber,
        });
        yield recruiter.save();
        const token = jsonwebtoken_1.default.sign({ _id: userId, type: user.type, email }, config_1.default.jwtSecret, { expiresIn: "8h" });
        res.status(201).json({ token, type: user.type, email });
    }
    catch (err) {
        next(err);
    }
}));
router.post("/login", (0, validator_1.default)(authRoutesValidators_1.loginSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.default.findOne({ email });
        if (user == null) {
            next(new types_1.default(401, "Wrong email or password"));
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            next(new types_1.default(401, "Wrong email or password"));
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, email: user.email, type: user.type }, JWT_SECRET);
        res.json({
            token,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = module.exports = router;
