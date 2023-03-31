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
        // education: [
        //     {
        //         institutionName: {
        //             type: String,
        //             // required: true,
        //         },
        //         startYear: {
        //             type: Number,
        //             // required: true,
        //             min: 1960,
        //             max: new Date().getFullYear(),
        //             validate: Number.isInteger,
        //         },
        //         endYear: {
        //             type: Number,
        //             // required: true,
        //             max: new Date().getFullYear(),
        //             // validate: [
        //             //     {
        //             //         validator: Number.isInteger, 
        //             //         msg: "Year value should be a number"
        //             //     },
        //             //     {
        //             //         // validator: function (value: any) {
        //             //         //     return this.StartYear <= value;
        //             //         // },
        //             //         msg: "End year value cannot be less than start year"
        //             //     },
        //             // ],
        //         },
        //     },
        // ],
        // education: Number,
        // I'm storing each skill as a string and returning skills as an array of strings of skills.
        skills: [String],
        // rating: {

        // }
        // yearsOfExperience: {
        //     type: Number,
        //     required: true,
        //     default: "Not specified"
        // },
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