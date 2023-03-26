import express, { Request, Response} from "express";
import jwt from "jsonwebtoken";
import authKeys from "../controllers2/authKeys";
import User from "../models/User";
import Recruiter from "../models/Recruiter";
import JobApplicant from "../models/JobApplicant";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const router = express.Router();

// Here we signup the user by storing req data into the schema model.

router.post("/signup", async (req: Request, res: Response) => {
    const data = req.body;

    try {
        const user = new User({
            email: data.email,
            password: data.password,
            type: data.type,
        });

        await user.save();

        const userDetails = user.type === "applicant"? new JobApplicant({
            userId: user._id,
            name: data.name,
            education: data.education,
            skills: data.skills,
            yearsOfExperience: data.yearsOfExperience,
            resume: data.resume.name,
            profile: data.profile.name,
        }) : new Recruiter({
            userId: user._id,
            name: data.name,
            organization: data.organization,
            position: data.position,
            contactNumber: data.contactNumber,
        });

        await userDetails.save();

        const token = jwt.sign({_id: user._id}, authKeys.jwtSecretKey, {expiresIn: "4h"});
        res.json({
            token: token,
            type: user.type,
            email: user.email
        });

    }
    catch(err: any) {

        if (err.code === 11000) {
            res.status(400).json({message: "Email already exists"});
        }
        else if (err.name === "ValidationError") {
            console.log(err)
            await User.deleteOne({ _id: err._id });
            res.status(400).json({ error: err.message });
          } else {
            res.status(500).json({ error: err.message });
          }
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