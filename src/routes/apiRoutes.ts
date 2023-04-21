import express, { Request, Response, application } from "express";
import mongoose, { Types } from "mongoose";
import { authenticateToken } from "../middleware/authMiddleware";
import User from "../models/User";
import JobApplicantInfo from "../models/JobApplicant";
import RecruiterInfo from "../models/Recruiter";
import Job from "../models/Job";
import Application from "../models/Application";
import UserAuth from "../models/User";
import QueryString = require("qs");
import validate from "../middleware/validator";
import {
  editApplicationSchema,
  editJobSchema,
  editUserSchema,
  postJobSchema,
} from "../validators/apiRoutesValidators";
import { NextFunction } from "express-serve-static-core";

const router = express.Router();

// First let me create a route to add jobs. this should only be allow by recruiter type users.

router.post(
  "/jobs",
  authenticateToken,
  validate(postJobSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          message: "Unauthorized",
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

      let job = new Job({
        userId: user.id,
        title: data.title,
        description: data.description,
        skills: data.skills,
        jobType: data.jobType,
        duration: data.duration,
        salary: data.salary,
      });

      await job.save();
      res.json({ message: "Job added successfully to the database" });
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

//Find jobs of a recruiter.
router.get(
  "/jobs/recruiter",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const recruiterJobs = await Job.find({ userId: user?.id });
      res.status(200).json(recruiterJobs);
    } catch (err) {
      res.status(400).json("Error while fetching recruiter jobs");
    }
  }
);

// to get jobslist from a filtered search trial

router.get("/jobs", async (req: Request, res: Response) => {
  const { title, location, salary, jobType } = req.query;

  // Construct the query based on the query params
  const query: any = {};
  if (title && title !== "all") {
    const regex = new RegExp(`${title}`, "i");
    query.title = { $regex: regex };
  }
  if (location && location !== "all") {
    query.location = location;
  }
  if (jobType && jobType !== "all") {
    query.jobType = jobType;
  }
  if (salary && salary !== "all") {
    query.salary = { $gte: parseInt(salary as string, 10) };
  }

  console.log({ query });
  // Find jobs that match the query in the "jobs" collection
  const jobs = await Job.find(query).exec();

  console.log(jobs);

  // Return the jobs as JSON
  res.json(jobs);
});

// Creating a route to access all jobs (based on filter).

router.get(
  "/jobs/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const job = await Job.findOne({ _id: req.params.id });

      if (job == null) {
        res.status(400).json({
          message: "Job does not exist",
        });
        return;
      }
      res.json(job);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Update a job information

router.put(
  "/jobs/:id",
  authenticateToken,
  validate(editJobSchema),
  async (req: Request, res: Response) => {
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

      const job = await Job.findOne({
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
      if (data.title) {
        job.title = data.title;
      }
      if (data.skills) {
        job.skills = data.skills;
      }
      if (data.description) {
        job.description = data.description;
      }
      if (data.location) {
        job.location = data.location;
      }
      if (data.duration) {
        job.duration = data.duration;
      }
      if (data.jobType) {
        job.jobType = data.jobType;
      }

      await job.save();

      res.json({
        message: "Job details updated successfully",
      });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Delete a job
router.delete(
  "/jobs/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
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

      const job = await Job.findOneAndDelete({
        _id: req.params.id,
        userId: user.id,
      });

      if (!job) {
        res.status(404).json({
          message: "Job does not exist",
        });
        return;
      }

      res.json({
        message: "Job deleted successfully",
      });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// This route is used by recruiters to get a user's details

router.get("/user", authenticateToken, async (req: Request, res: Response) => {
  const user = req.user;
  try {
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (user.type === "recruiter") {
      const recruiter = await RecruiterInfo.findOne({ userId: user.id });

      if (!recruiter) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }
      res.json(recruiter);
    } else {
      const JobApplicant = await JobApplicantInfo.findOne({ userId: user.id });

      if (!JobApplicant) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }
      res.json(JobApplicant);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// Get user details from id

router.get(
  "/user/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userData = await User.findOne({ _id: req.params.id });
      if (!userData) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }

      if (userData.type === "recruiter") {
        const recruiter = await RecruiterInfo.findOne({ userId: userData.id });

        if (!recruiter) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(recruiter);
      } else {
        const jobApplicant = await JobApplicantInfo.findOne({
          userId: userData.id,
        });

        if (!jobApplicant) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(jobApplicant);
      }
    } catch (err) {
      res.json(400).json(err);
    }
  }
);

// update user details
router.put(
  "/user",
  authenticateToken,
  validate(editUserSchema),
  async (req: Request, res: Response) => {
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
        const recruiter = await RecruiterInfo.findOne({ userId: user.id });
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

        await recruiter.save();
        res.json({
          message: "User details was updated successfully",
        });
      } else {
        //  The logic here is that if the user is not a recruiter, then he is a user.
        // We search through the Jobapplicant documents and find a document with the same id.
        const jobApplicant = await JobApplicantInfo.findOne({
          userId: user.id,
        });
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
        await jobApplicant.save();
        res.json({
          message: "User information updated successfully",
        });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// apply for a job
router.post(
  "/jobs/:id/applications",
  authenticateToken,
  async (req: Request, res: Response) => {
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
          message: "Only job applicants can apply",
        });
      }

      const data = req.body;
      const jobId = req.params.id;

      // To check whether the user has applied to the job previously,

      const appliedApplication = await Application.findOne({
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

      const job = await Job.findOne({ _id: jobId });

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

      const myActiveApplicantCount = await Application.countDocuments({
        userId: user.id,
        status: {
          $nin: ["rejected", "deleted", "cancelled", "finished"],
        },
      });

      if (myActiveApplicantCount >= 10) {
        return res.status(400).json({
          message: "Maximum number of applications reached.",
        });
      }

      const acceptedJobs = await Application.countDocuments({
        userId: user.id,
        status: "accepted",
      });

      if (acceptedJobs > 0) {
        return res.status(400).json({
          message: "Application already accpted. Browse page for more jobs.",
        });
      }

      //Create a new job application

      const application = new Application({
        userId: user.id,
        recruiterId: job.userId,
        jobId: job.id,
        status: "applied",
        title: job.title,
        salary: job.salary,
        jobType: job.jobType,
      });

      await application.save();
      res.json({
        message: "Job application successful",
      });
    } catch (err: any) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);

// In order for recruiter to get applications for a particular job

interface IQueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

router.get(
  "/jobs/:id/applications",
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
    const jobId = new mongoose.Types.ObjectId(req.params.id);
    const userId = new mongoose.Types.ObjectId(user.id);
    if (user.type !== "recruiter") {
      return res.status(401).json({
        message: "You don't have permission to view job applications",
      });
    }

    // const jobId = req.params.id;

    try {
      const applications = await Application.aggregate([
        {
          $match: {
            jobId: jobId,
            recruiterId: userId,
          },
        },
        {
          $lookup: {
            from: "jobapplicantinfos",
            localField: "userId",
            foreignField: "userId",
            as: "applicant",
          },
        },
      ]);

      res.json(applications);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Trial route to get applicant's job applications

router.get(
  "/applications-applicant",
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = req.user;

    const applications = await Application.find({ userId: user?.id });

    if (!applications) {
      res.status(404).json({ message: "No job found for user" });
      return;
    }

    res.status(200).json(applications);
  }
);

// user gets all his applications depending on whether they are recruiter or applicant type

router.get(
  "/applications",
  authenticateToken,
  async (req: Request, res: Response) => {
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
      } else {
        findParams = {
          userId: user.id,
        };
      }

      const applications = await Application.aggregate([
        {
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
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Update status of application trial
router.put(
  "/applications/:id",
  validate(editApplicationSchema),
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { status } = req.body;

    try {
      const updatedApplication = await Application.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }

      return res
        .status(200)
        .json({ message: "Application status updated successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

export default module.exports = router;
