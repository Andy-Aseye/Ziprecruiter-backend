import express, { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import authKeys from "../controllers2/authKeys";
import User from "../models/User";
import Recruiter from "../models/Recruiter";
import JobApplicant from "../models/JobApplicant";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import config from "../middleware/config";
import multer, { Multer } from 'multer';
import { uploadDocument } from "../services/upload";
import HttpError from "../types";

const upload = multer();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const router = express.Router();

// Here we signup the user by storing req data into the schema model.

router.post('/signup/applicant', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), async (req: Request, res: Response, next: NextFunction) => {
    if (req.files == undefined) {
        next(new HttpError(400, 'Resume and cover letter are both required'))
        return
    }
    // @ts-ignore
    let resumeFile = req.files['resume']
    // @ts-ignore
    let coverLetterFile = req.files['coverLetter']
    if (resumeFile == undefined || coverLetterFile == undefined) {
        next(new HttpError(400, 'Resume and cover letter are both required'))
        return
    }
    try {
        const resume = await uploadDocument(resumeFile[0])
        const coverLetter = await uploadDocument(coverLetterFile[0])
        const { email, password, name, education, skills, yearsOfExperience } = req.body;

        const existingUserWithSameEmail = await User.exists({ email });
        if (existingUserWithSameEmail) {
            next(new HttpError(400, 'User with this email already exists'));
            return;
        }

        const user = new User({ email, password, type: 'applicant' });
        const { _id: userId } = await user.save();
        const applicant = new JobApplicant({ userId, name, education, skills, yearsOfExperience, resume, coverLetter });
        await applicant.save();
        const token = jwt.sign({ _id: user._id, type: user.type, email: user.email }, config.jwtSecret, { expiresIn: "8h" });
        res.json({ token: token, type: user.type, email: user.email });
    } catch (err) {
        next(err)
    }
})

router.post("/signup/recruiter", async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, organization, position, contactNumber } = req.body;

    try {
        const existingUserWithSameEmail = await User.exists({ email });
        if (existingUserWithSameEmail) {
            next(new HttpError(400, 'User with this email already exists'));
            return;
        }

        const user = new User({ email, password, type: 'recruiter' });
        const { _id: userId } = await user.save();
        const recruiter = new Recruiter({ userId, name, organization, position, contactNumber });
        await recruiter.save();
        const token = jwt.sign({_id: userId, type: user.type, email }, config.jwtSecret, {expiresIn: "8h"});
        res.json({ token, type: user.type, email });
    }
    catch(err: any) {
        next(err);
    }
});


router.post("/login", async (req: Request, res: Response) => {

    try{
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user) {
        res.status(401).json({message: "Email does not exist"});
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        res.status(401).json({message: "Incorrect password"})
        return;
    }

    const token = jwt.sign({ _id: user._id, email: user.email, type: user.type}, JWT_SECRET);

    res.status(200).json({
        token,
        // user
        // type: user.type,
    });
} catch (err) {
    res.status(500).json({message: "Internal server error in login"});
}
});


export default module.exports = router;