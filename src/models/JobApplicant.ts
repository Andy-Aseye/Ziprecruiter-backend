import mongoose from "mongoose";

let applicantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        education: String,
        // I'm storing each skill as a string and returning skills as an array of strings of skills.
        skills: [String],
        yearsOfExperience: {
            type: Number,
            required: true,
            default: 0
        },
        resume: {
            type: String,
        },
        coverletter: {
            type: String,
        },
    },
    {collation: {locale: "en"}}
);

const JobApplicantInfo = mongoose.model("JobApplicantInfo", applicantSchema);

export default JobApplicantInfo;