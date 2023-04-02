"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importStar(require("express"));
const mongoose_1 = __importStar(require("mongoose"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = __importDefault(require("../models/User"));
const JobApplicant_1 = __importDefault(require("../models/JobApplicant"));
const Recruiter_1 = __importDefault(require("../models/Recruiter"));
const Job_1 = __importDefault(require("../models/Job"));
const Application_1 = __importDefault(require("../models/Application"));
const validator_1 = __importDefault(require("../middleware/validator"));
const apiRoutesValidators_1 = require("../validators/apiRoutesValidators");
const router = express_1.default.Router();
// First let me create a route to add jobs. this should only be allow by recruiter type users.
router.post("/jobs", authMiddleware_1.authenticateToken, (0, validator_1.default)(apiRoutesValidators_1.postJobSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                message: "Unauthorized"
            });
            return;
        }
        if (user.type !== "recruiter") {
            res.status(401).json({
                message: "You don't have permission to add jobs",
            });
            return;
        }
        // This code runs meaning the user is a recruiter. We set the data to the inputs sent from the add job form in the frontend
        const data = req.body;
        console.log(data);
        let job = new Job_1.default({
            userId: user.id,
            title: data.title,
            description: data.description,
            skills: data.skills,
            jobType: data.jobType,
            duration: data.duration,
            salary: data.salary,
        });
        yield job.save();
        res.json({ message: "Job added successfully to the database" });
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
//Find jobs of a recruiter.
router.get("/jobs/recruiter", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const recruiterJobs = yield Job_1.default.find({ userId: user === null || user === void 0 ? void 0 : user.id });
        res.status(200).json(recruiterJobs);
    }
    catch (err) {
        res.status(400).json("Error while fetching recruiter jobs");
    }
}));
// Creating a route to acces all jobs.
router.get("/jobs", authMiddleware_1.authenticateToken, (req, res) => {
    try {
        const user = req.user;
        let findParams = {};
        let sortParams = {};
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type === "recruiter" && req.query.myjobs) {
            findParams = Object.assign(Object.assign({}, findParams), { userId: user.id });
        }
        if (req.query.q) {
            findParams = Object.assign(Object.assign({}, findParams), { title: {
                    $regex: new RegExp(req.query.q.toString(), "i"),
                } });
        }
        // This block handles a request that contains a filter
        if (req.query.jobType) {
            let jobTypes = [];
            if (Array.isArray(req.query.jobType)) {
                jobTypes = req.query.jobType;
            }
            else {
                jobTypes = [req.query.jobType];
            }
            console.log(jobTypes);
            findParams = Object.assign(Object.assign({}, findParams), { jobType: {
                    $in: jobTypes,
                } });
        }
        // Creating a function that handles job according to minimum and maximum salary.
        // This handles the max and min salary range
        if (req.query.salaryMin && req.query.salaryMax) {
            const salaryMin = parseInt(req.query.salaryMin.toString());
            const salaryMax = parseInt(req.query.salaryMax.toString());
            findParams = Object.assign(Object.assign({}, findParams), { $and: [
                    {
                        salary: {
                            $gte: salaryMin,
                        },
                    },
                    {
                        salary: {
                            $lte: salaryMax,
                        },
                    },
                ] });
        }
        else if (req.query.salaryMin) {
            findParams = Object.assign(Object.assign({}, findParams), { salary: {
                    $gte: parseInt(req.query.salaryMin.toString()),
                } });
        }
        else if (req.query.salaryMax) {
            findParams = Object.assign(Object.assign({}, findParams), { salary: {
                    $lte: parseInt(req.query.salaryMax.toString()),
                } });
        }
        // Setting a function that handles job search by job duration
        if (req.query.duration) {
            findParams = Object.assign(Object.assign({}, findParams), { duration: {
                    $lt: parseInt(req.query.duration.toString()),
                } });
        }
        // Let's handle job search request according to order
        if (req.query.asc) {
            if (Array.isArray(req.query.asc)) {
                req.query.asc.map((key) => {
                    sortParams = Object.assign(Object.assign({}, sortParams), { [key]: 1 });
                });
            }
            else {
                sortParams = Object.assign(Object.assign({}, sortParams), { [req.query.asc]: 1 });
            }
        }
        // Creating a block to handle a filtered request that states the minimum salary
        if (req.query.desc) {
            if (Array.isArray(req.query.desc)) {
                req.query.desc.map((key) => {
                    sortParams = Object.assign(Object.assign({}, sortParams), { [key]: -1 });
                });
            }
            else {
                sortParams = Object.assign(Object.assign({}, sortParams), { [req.query.desc]: -1 });
            }
        }
        console.log(findParams);
        console.log(sortParams);
        let arr = [
            {
                $lookup: {
                    from: "recruiterinfos",
                    localField: "userId",
                    foreignField: "userId",
                    as: "recruiter",
                },
            },
            { $unwind: "$recruiter" },
            { $match: findParams },
        ];
        if (Object.keys(sortParams).length > 0) {
            arr = [
                {
                    $lookup: {
                        from: "recruiteinfos",
                        localField: "userId",
                        foreignField: "userId",
                        as: "recruiter",
                    },
                },
                { $unwind: "$recruiter" },
                { $match: findParams },
                // {
                //     $sort: sortParams,
                // },
            ];
        }
        console.log(arr);
        Job_1.default.aggregate(arr)
            .then((posts) => {
            if (posts == null) {
                res.status(404).json({
                    message: "No job found",
                });
                return;
            }
            res.json(posts);
        })
            .catch((err) => {
            throw err;
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
});
// to get info about a particular job
router.get("/jobs/:id", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield Job_1.default.findOne({ _id: req.params.id });
        if (job == null) {
            res.status(400).json({
                message: "Job does not exist",
            });
            return;
        }
        res.json(job);
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// Update a job information
router.put("/jobs/:id", authMiddleware_1.authenticateToken, (0, validator_1.default)(apiRoutesValidators_1.editJobSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type !== "recruiter") {
            res.status(401).json({
                message: "You don't have permissions to update jobs",
            });
            return;
        }
        const job = yield Job_1.default.findOne({
            _id: req.params.id,
            userId: user.id,
        });
        if (!job) {
            res.status(404).json({
                message: "Job does not exist",
            });
            return;
        }
        const data = req.body;
        if (data.salary) {
            job.salary = data.salary;
        }
        if (data.duration) {
            job.duration = data.duration;
        }
        if (data.deadline) {
            job.title = data.title;
        }
        yield job.save();
        res.json({
            message: "Job details updated succesfully",
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// Delete a job
router.delete("/jobs/:id", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }
    try {
        if (user.type !== "recruiter") {
            res.status(401).json({
                message: "You don't have permissions to delete the job",
            });
            return;
        }
        const job = yield Job_1.default.findOneAndDelete({ _id: req.params.id, userId: user.id });
        if (!job) {
            res.status(404).json({
                message: "Job does not exist",
            });
            return;
        }
        res.json({
            message: "Job deleted successfully"
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// This route is used by recruiters to get a user's details
router.get("/user", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type === "recruiter") {
            const recruiter = yield Recruiter_1.default.findOne({ userId: user.id });
            if (!recruiter) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(recruiter);
        }
        else {
            const JobApplicant = yield JobApplicant_1.default.findOne({ userId: user.id });
            if (!JobApplicant) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(JobApplicant);
        }
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// Get user details from id
router.get("/user/:id", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield User_1.default.findOne({ _id: req.params.id });
        if (!userData) {
            res.status(404).json({
                message: "User does not exist",
            });
            return;
        }
        if (userData.type === "recruiter") {
            const recruiter = yield Recruiter_1.default.findOne({ userId: userData.id });
            if (!recruiter) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(recruiter);
        }
        else {
            const jobApplicant = yield JobApplicant_1.default.findOne({ userId: userData.id });
            if (!jobApplicant) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(jobApplicant);
        }
    }
    catch (err) {
        res.json(400).json(err);
    }
}));
// update user details
router.put("/user", authMiddleware_1.authenticateToken, (0, validator_1.default)(apiRoutesValidators_1.editUserSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // We set the user to the data from the user
        // We set the data to the data from the frontend in the form of body
        const user = req.user;
        const data = req.body;
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type == "recruiter") {
            // We find a user schema whose user id is equal to the id of the user from the frontend
            const recruiter = yield Recruiter_1.default.findOne({ userId: user.id });
            // If this returns null it means the user does not exist
            if (recruiter == null) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            if (data.name) {
                recruiter.name = data.name;
            }
            if (data.organization) {
                recruiter.organization = data.organization;
            }
            if (data.position) {
                recruiter.position = data.position;
            }
            if (data.contactNumber) {
                recruiter.contactNumber = data.contactNumber;
            }
            yield recruiter.save();
            res.json({
                message: "User details was updated successfully",
            });
        }
        else {
            //  The logic here is that if the user is not a recruiter, then he is a user.
            // We search through the Jobapplicant documents and find a document with the same id.
            const jobApplicant = yield JobApplicant_1.default.findOne({ userId: user.id });
            if (jobApplicant == null) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            // We set name to the incoming data name, education, skills
            if (data.name) {
                jobApplicant.name = data.name;
            }
            if (data.skills) {
                jobApplicant.skills = data.skills;
            }
            if (data.resume) {
                jobApplicant.resume = data.resume;
            }
            if (data.coverletter) {
                jobApplicant.coverletter = data.coverletter;
            }
            yield jobApplicant.save();
            res.json({
                message: "User information updated successfully",
            });
        }
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// apply for a job 
router.post("/jobs/:id/applications", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type !== "applicant") {
            return res.status(401).json({
                message: "Only job applicants can apply"
            });
        }
        const data = req.body;
        const jobId = req.params.id;
        // To check whether the user has applied to the job previously,
        const appliedApplication = yield Application_1.default.findOne({
            userId: user.id,
            jobId: jobId,
            status: {
                $nin: ["deleted", "accepted", "cancelled"],
            },
        });
        if (appliedApplication !== null) {
            return res.status(400).json({
                message: "You have already applied for this job",
            });
        }
        //  Find the job to apply for
        const job = yield Job_1.default.findOne({ _id: jobId });
        if (job === null) {
            return res.status(404).json({
                message: "Job does not exist",
            });
        }
        // Get the count of active applications for the job
        // const activeApplicationCount = await Application.countDocuments({
        //     jobId: jobId,
        //     status: {
        //       $nin: ["rejected", "deleted", "cancelled", "finished"],
        //     },
        //   });
        //   if(!job.maxApplicants) {
        //     res.json({
        //         message: "Max applicants is equal to null"
        //     });
        //     return;
        //   }
        //   if(activeApplicationCount >= job.maxApplicants) {
        //     return res.status(400).json({
        //         message: "The maximum number of applications has been reached",
        //     });
        //   }
        // Get the count of the user's active applications
        const myActiveApplicantCount = yield Application_1.default.countDocuments({
            userId: user.id,
            status: {
                $nin: ["rejected", "deleted", "cancelled", "finished"],
            },
        });
        if (myActiveApplicantCount >= 10) {
            return res.status(400).json({
                message: "Maximum number of applications reached."
            });
        }
        const acceptedJobs = yield Application_1.default.countDocuments({
            userId: user.id,
            status: "accepted",
        });
        if (acceptedJobs > 0) {
            return res.status(400).json({
                message: "Application already accpted. Browse page for more jobs."
            });
        }
        //Create a new job application
        const application = new Application_1.default({
            userId: user.id,
            recruiterId: job.userId,
            jobId: job.id,
            status: "applied",
            title: job.title,
            salary: job.salary,
            jobType: job.jobType,
        });
        yield application.save();
        res.json({
            message: "Job application successful",
        });
    }
    catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
}));
router.get("/jobs/:id/applications", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }
    if (user.type !== "recruiter") {
        return res.status(401).json({
            message: "You don't have permission to view job applications",
        });
    }
    const jobId = req.params.id;
    let findParams = {
        jobId: jobId,
        recruiterId: user.id,
    };
    let sortParams = {};
    const queryParams = req.query;
    if (queryParams.status) {
        findParams = Object.assign(Object.assign({}, findParams), { status: queryParams.status });
    }
    try {
        const applications = yield Application_1.default.find(findParams).collation({ locale: "en" }).sort(sortParams).exec();
        res.json(applications);
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// Trial route to get applicant's job applications
router.get("/applications-applicant", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const applications = yield Application_1.default.find({ userId: user === null || user === void 0 ? void 0 : user.id });
    if (!applications) {
        res.status(404).json({ message: "No job found for user" });
        return;
    }
    res.status(200).json(applications);
}));
// user gets all his applications depending on whether they are recruiter or applicant type
router.get("/applications", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let findParams = {};
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (user.type === "recruiter") {
            findParams = {
                recruiterId: user.id,
            };
        }
        else {
            findParams = {
                userId: user.id,
            };
        }
        const applications = yield Application_1.default.aggregate([
            {
                $lookup: {
                    from: "jobapplicantinfos",
                    localField: "userId",
                    foreignField: "userId",
                    as: "jobApplicant",
                },
            },
            { $unwind: "$jobApplicant" },
            { $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job",
                },
            },
            { $unwind: "$job" },
            {
                $lookup: {
                    from: "recruiterinfos",
                    localField: "recruiterId",
                    foreignField: "userId",
                    as: "recruiter",
                },
            },
            { $unwind: "$recruiter" },
            {
                $match: findParams,
            },
            // {
            //     $sort: {
            //         dateOfApplication: -1,
            //     },
            // },
        ]);
        console.log(applications);
        res.json(applications);
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// update status of application to a job
router.put("/appications/:id", (0, validator_1.default)(apiRoutesValidators_1.editApplicationSchema), authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const id = req.params.id;
    const status = req.body.status;
    const dateOfJoining = req.body.dateOfJoining;
    if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }
    try {
        if (user.type === "recriter") {
            if (status === "accepted") {
                const application = yield Application_1.default.findOne({
                    _id: new mongoose_1.Types.ObjectId(id),
                    recruiterId: user.id,
                }).exec();
                if (!application) {
                    res.status(404).json({
                        message: "Application not found",
                    });
                    return;
                }
                const job = yield Job_1.default.findOne({
                    _id: application.jobId,
                    userId: user.id,
                }).exec();
                if (!job) {
                    res.status(404).json({
                        message: "Job does not exist",
                    });
                    return;
                }
                // const activeApplicationCount = await Application.countDocuments({
                //     recruiterId: user.id,
                //     jobId: job._id,
                //     status: "accepted",
                // }).exec();
                // if (!job || job.maxPositions === undefined) {
                //     res.status(404).json({
                //         message: "Job does not exist or max positions is undefined",
                //     });
                //     return;
                // }
                // if(activeApplicationCount >= job.maxPositions) {
                //     res.status(400).json({
                //         message: "All positions for this job are already filled",
                //     });
                //     return;
                // }
                application.status = status;
                if (dateOfJoining) {
                    application.dateOfJoining = new Date(dateOfJoining);
                }
                yield application.save();
                yield Application_1.default.updateMany({
                    _id: {
                        $ne: application._id,
                    },
                    userId: application.userId,
                    status: {
                        $nin: [
                            "rejected",
                            "deleted",
                            "cancelled",
                            "accepted",
                            "finished",
                        ],
                    },
                }, {
                    $set: {
                        status: "cancelled",
                    },
                }, { multi: true }).exec();
                if (status === "accepted") {
                    yield Job_1.default.findByIdAndUpdate({
                        _id: job.id,
                        userId: user.id,
                    }
                    // {
                    //     $set: {
                    //         acceptedCandidates: activeApplicationCount + 1,
                    //     },
                    // }
                    ).exec();
                }
                res.json({
                    message: `Application ${status} successfully`,
                });
            }
            else {
                const appication = yield Application_1.default.findByIdAndUpdate({
                    _id: new mongoose_1.Types.ObjectId(id),
                    recruiterId: user.id,
                    status: {
                        $nin: ["rejected", "delete", "cancelled"],
                    },
                }, {
                    $set: {
                        status: status,
                    }
                }, { new: true }).exec();
                if (!appication) {
                    res.status(400).json({
                        message: "Application status cannot be updated"
                    });
                    return;
                }
                if (status === "finished") {
                    res.json({
                        message: `Job ${status} succesfully`,
                    });
                }
                else {
                    res.json({
                        message: `Application ${status} successfully`
                    });
                }
            }
        }
        else {
            if (status === "cancelled") {
                const appication = yield Application_1.default.findByIdAndUpdate({
                    _id: id,
                    userId: user.id
                }, {
                    $set: {
                        status: status,
                    },
                });
                res.json({
                    message: `Application ${status} successfully`,
                });
            }
            else {
                res.status(401).json({
                    message: "You don't have permissions to update job status",
                });
            }
        }
    }
    catch (err) {
        res.status(400).json(err);
    }
}));
// To get a list of final applicant for a recruiter's job
router.get("/applicants", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const jobId = (_a = req.query.jobId) === null || _a === void 0 ? void 0 : _a.toString();
    if (!user) {
        res.json({
            message: "User not found"
        });
        return;
    }
    try {
        if (user.type === "recruiter") {
            let findParams = {
                recruiterId: user === null || user === void 0 ? void 0 : user.id
            };
            if (req.query.jobId) {
                findParams = Object.assign(Object.assign({}, findParams), { jobId: new mongoose_1.default.Types.ObjectId(jobId) });
            }
            if (req.query.status) {
                if (Array.isArray(req.query.status)) {
                    findParams = Object.assign(Object.assign({}, findParams), { status: { $in: req.query.status } });
                }
            }
            let sortParams = {};
            if (!req.query.asc && !req.query.desc) {
                sortParams = { _id: 1 };
            }
            if (req.query.asc) {
                if (Array.isArray(req.query.asc)) {
                    req.query.asc.map((key) => {
                        sortParams = Object.assign(Object.assign({}, sortParams), { [key]: 1 });
                    });
                }
                else {
                    sortParams = Object.assign(Object.assign({}, sortParams), { [req.query.asc]: 1 });
                }
            }
            if (req.query.desc) {
                if (Array.isArray(req.query.desc)) {
                    req.query.desc.map((key) => {
                        sortParams = Object.assign(Object.assign({}, sortParams), { [key]: -1 });
                    });
                }
                else {
                    sortParams = Object.assign(Object.assign({}, sortParams), { [req.query.desc]: -1 });
                }
            }
            const applications = yield Application_1.default.aggregate([{
                    $lookup: {
                        from: "jobapplicantinfos",
                        localField: "userId",
                        foreignField: "userId",
                        as: "jobApplicant",
                    },
                },
                { $unwind: "$jobApplicant" },
                {
                    $lookup: {
                        from: "jobs",
                        localField: "jobId",
                        foreignField: "_id",
                        as: "job",
                    },
                },
                { $unwind: "$job" },
                { $match: findParams },
                { $sort: sortParams },
            ]);
            if (express_1.application.length === 0) {
                res.status(404).json({
                    message: "No applicants found",
                });
                return;
            }
            res.json(applications);
        }
        res.status(400).json({
            message: "Applicant list is only accessible to recruiters",
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
    2;
}));
exports.default = module.exports = router;
