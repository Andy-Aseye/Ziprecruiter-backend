import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Recruiter from "../models/Recruiter";
import JobApplicant from "../models/JobApplicant";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import config from "../middleware/config";
import multer from "multer";
import { uploadDocument } from "../services/upload";
import HttpError from "../types";
import {
  loginSchema,
  signupApplicantSchema,
  signupRecruiterSchema,
} from "../validators/authRoutesValidators";
import validate from "../middleware/validator";

const upload = multer();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const router = express.Router();

// Here we signup the user by storing req data into the schema model.

router.post(
  "/signup/applicant",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  validate(signupApplicantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.files == undefined) {
      next(new HttpError(400, "Resume and cover letter are both required"));
      return;
    }
    // @ts-ignore
    let resumeFile = req.files["resume"];
    // @ts-ignore
    let coverLetterFile = req.files["coverLetter"];
    if (resumeFile == undefined || coverLetterFile == undefined) {
      next(new HttpError(400, "Resume and cover letter are both required"));
      return;
    }
    try {
      const { email, password, name, education, skills, yearsOfExperience } =
        req.body;

      const existingUserWithSameEmail = await User.exists({ email });
      if (existingUserWithSameEmail) {
        next(new HttpError(400, "User with this email already exists"));
        return;
      }

      const resume = await uploadDocument(resumeFile[0]);
      const coverLetter = await uploadDocument(coverLetterFile[0]);

      const user = new User({ email, password, type: "applicant" });
      const { _id: userId } = await user.save();
      const applicant = new JobApplicant({
        userId,
        name,
        education,
        skills: JSON.parse(skills),
        yearsOfExperience: Number(yearsOfExperience),
        resume,
        coverletter: coverLetter,
      });
      await applicant.save();
      const token = jwt.sign(
        { _id: user._id, type: user.type, email: user.email },
        config.jwtSecret,
        { expiresIn: "8h" }
      );
      res
        .status(201)
        .json({ message: "Signup successful", token: token, type: user.type, email: user.email });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/signup/recruiter",
  validate(signupRecruiterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, organization, position, contactNumber } =
      req.body;

    try {
      const existingUserWithSameEmail = await User.exists({ email });
      if (existingUserWithSameEmail) {
        next(new HttpError(400, "User with this email already exists"));
        return;
      }

      const user = new User({ email, password, type: "recruiter" });
      const { _id: userId } = await user.save();
      const recruiter = new Recruiter({
        userId,
        name,
        organization,
        position,
        contactNumber,
      });
      await recruiter.save();
      const token = jwt.sign(
        { _id: userId, type: user.type, email },
        config.jwtSecret,
        { expiresIn: "8h" }
      );
      res.status(201).json({ message: "Signup successful", token, type: user.type, email });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {type, email, password } = req.body;

      const user = await User.findOne({ email });
      if (user == null) {
        next(new HttpError(401, "Wrong email or password"));
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        next(new HttpError(401, "Wrong email or password"));
        return;
      }

      const token = jwt.sign(
        { _id: user._id, email: user.email, type: user.type },
        JWT_SECRET
      );
      res.status(200).json({
        message: "Login successful",
        token,
        type
      });
    } catch (err) {
      next(err);
      res.json({message: "Login failed"})
    }
  }
);

export default module.exports = router;
