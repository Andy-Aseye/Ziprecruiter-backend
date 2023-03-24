import express, {Request, Response, application} from "express";
import mongoose, { Types } from "mongoose";
import { authenticateToken } from "../middleware/authMiddleware";
import User from "../models/User";
import JobApplicantInfo from "../models/JobApplicant";
import RecruiterInfo from "../models/Recruiter";
import Job from "../models/Job";
import Application from "../models/Application"
import UserAuth from "../models/User";
// import { QueryString } from 'qs';
import QueryString = require("qs")



const router = express.Router();

// First let me create a route to add jobs. this should only be allow by recruiter type users.

router.post("/jobs", authenticateToken, async (req: Request, res: Response) => {
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

        let job = new Job({
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

          await job.save();
        res.json({ message: "Job added successfully to the database" });
    } catch (error) {
        res.status(400).json(error);
      }

})


// Creating a route to acces all jobs.

router.get("/jobs", authenticateToken, (req: Request, res: Response) => {
    try{

        const user = req.user;
        let findParams = {};
        let sortParams = {};

        if (!user) {
            res.status(404).json({
              message: "User not found",
            });
            return;
          }


        if(user.type === "recruiter" && req.query.myjobs) {
            findParams = {
                ...findParams,
                userId: user.id,
            };
        }

        if(req.query.q) {
            findParams = {
                ...findParams,
                title: {
                    $regex: new RegExp(req.query.q.toString(), "i"),
                },
            };
        }

        // This block handles a request that contains a filter

        if (req.query.jobType) {
            let jobTypes = [];
            if(Array.isArray(req.query.jobType)) {
                jobTypes = req.query.jobType;
            } else {
                jobTypes = [req.query.jobType];
            }

            console.log(jobTypes);

            findParams = {
                ...findParams,
                jobType: {
                    $in: jobTypes,
                },
            };
        }

        // Creating a function that handles job according to minimum and maximum salary.

        // This handles the max and min salary range

        if(req.query.salaryMin && req.query.salaryMax) {
            const salaryMin = parseInt(req.query.salaryMin.toString());
            const salaryMax = parseInt(req.query.salaryMax.toString());
            findParams = {
                ...findParams,
                $and: [
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
                ],
            };
        } else if (req.query.salaryMin) {
          
            findParams = { ...findParams,
            salary: {
                $gte: parseInt(req.query.salaryMin.toString()),
            }, };

        }

        else if (req.query.salaryMax) {
            findParams = {
                ...findParams,
                salary: {
                    $lte: parseInt(req.query.salaryMax.toString()),
                },
            };
        }

        // Setting a function that handles job search by job duration

        if (req.query.duration) {
            findParams = {
                ...findParams,
                duration: {
                    $lt: parseInt(req.query.duration.toString()),
                },
            };
        }

        // Let's handle job search request according to order

        if (req.query.asc) {
            if (Array.isArray(req.query.asc)) {
                req.query.asc.map((key) => {
                    sortParams = {
                        ...sortParams,
                        [key as string]: 1,
                    };
                });
            } else {
                sortParams = {
                    ...sortParams,
                    [req.query.asc as string]: 1,
                };
            }
        }

        // Creating a block to handle a filtered request that states the minimum salary
        if (req.query.desc) {
            if (Array.isArray(req.query.desc)) {
                req.query.desc.map((key) => {
                    sortParams = {
                        ...sortParams,
                        [key as string]: -1,
                    };
                });
            } else{
                sortParams = {
                    ...sortParams,
                    [req.query.desc as string]: -1,
                };
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
            {$unwind: "$recruiter"},
            {$match: findParams},
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
                {$unwind: "$recruiter"},
                {$match: findParams},
                // {
                //     $sort: sortParams,
                // },
            ];
        } 

        console.log(arr);


    Job.aggregate(arr)
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
    catch(err) {
        res.status(400).json(err);
    }

} )

// to get info about a particular job

router.get("/jobs/:id", authenticateToken, async (req: Request, res: Response) => {

    try {
        const job = await Job.findOne({_id: req.params.id});

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
});

// Update a job information

router.put("/jobs/:id", authenticateToken, async (req: Request, res: Response) => {
    
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

        if(!job) {
            res.status(404).json({
                message: "Job does not exist",
            });
            return;
        }

        const data = req.body;
        if (data.maxApplicants) {
            job.maxApplicants = data.maxApplicants;
        }
        if (data.maxPositions) {
            job.maxPositions = data.maxPositions;
        }
        if (data.deadline) {
            job.deadline = data.deadline;
        }

        await job.save();

        res.json({
            message: "Job details updated succesfully",
        });
    }
    catch (err) {
        res.status(400).json(err);
    }
})

// Delete a job
router.delete("/jobs/:id", authenticateToken, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }
    try {
        if(user.type !== "recruiter") {
            res.status(401).json({
                message: "You don't have permissions to delete the job",
            });
            return;
        }

        const job = await Job.findOneAndDelete({_id: req.params.id, userId: user.id})

        if(!job) {
            res.status(404).json({
                message: "Job does not exist",
            });
            return;
        }

        res.json({
            message: "Job deleted successfully"
        })

    }
    catch(err) {
        res.status(400).json(err);
    }
})



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

        if(user.type === "recruiter") {
            const recruiter = await RecruiterInfo.findOne({ userId: user.id});

            if (!recruiter) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(recruiter);
        }
        else {
            const JobApplicant = await JobApplicantInfo.findOne({userId: user.id});

            if (!JobApplicant) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(JobApplicant);
        }
    }
    
    catch(err) {
        res.status(400).json(err)
    }
})


// Get user details from id

router.get("/user/:id", authenticateToken, async(req: Request, res: Response) => {
    try {
        const userData = await User.findOne({_id: req.params.id});
        if(!userData) {
            res.status(404).json({
                message: "User does not exist",
            });
            return;
        }

        if(userData.type === "recruiter") {
            const recruiter = await RecruiterInfo.findOne({userId: userData.id});

            if(!recruiter) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(recruiter);
        } 
        else {
            const jobApplicant = await JobApplicantInfo.findOne({userId: userData.id});

            if(!jobApplicant) {
                res.status(404).json({
                    message: "User does not exist",
                });
                return;
            }
            res.json(jobApplicant);
        }
     }
    catch(err) {
        res.json(400).json(err);
    }
})


// update user details
router.put("/user", authenticateToken, async (req: Request, res: Response) => {
    try{
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

      if(data.name) {
        recruiter.name = data.name;
      }
      if(data.organization) {
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
      })
    }
    else {
        //  The logic here is that if the user is not a recruiter, then he is a user.
      // We search throughg the Jobapplicant documents and find a document with the same id.
      const jobApplicant = await JobApplicantInfo.findOne({ userId: user.id});
      if (jobApplicant == null) {
        res.status(404).json({
            message: "User does not exist",
        });
        return;
      }
       // We set name to the incoming data name, education, skills
        if(data.name) {
            jobApplicant.name = data.name;
        }

        if(data.education) {
            jobApplicant.education = data.education;
        }
        if(data.skills) {
            jobApplicant.skills = data.skills;
        }
        if(data.resume) {
            jobApplicant.resume = data.resume;
        }
        if(data.profile) {
            jobApplicant.profile = data.profile;
        }
        await jobApplicant.save();
        res.json({
            message: "User information updated successfully",
        });
      }
    }
    catch(err) {
        res.status(400).json(err);
    }
})


// apply for a job 
router.post("/jobs/:id/applications", authenticateToken, async (req: Request, res: Response) => {
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

        const job = await Job.findOne({_id: jobId});

        if (job === null) {
            return res.status(404).json({
                message: "Job does not exist",
            });
        }

        // Get the count of active applications for the job
    const activeApplicationCount = await Application.countDocuments({
        jobId: jobId,
        status: {
          $nin: ["rejected", "deleted", "cancelled", "finished"],
        },
      });

      if(!job.maxApplicants) {
        res.json({
            message: "Max applicants is equal to null"
        });
        return;
      }

      if(activeApplicationCount >= job.maxApplicants) {
        return res.status(400).json({
            message: "The maximum number of applications has been reached",
        });
      }

       // Get the count of the user's active applications

       const myActiveApplicantCount = await Application.countDocuments({
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

       const acceptedJobs = await Application.countDocuments({
        userId: user.id,
        status: "accepted",
       });

       if (acceptedJobs > 0) {
        return res.status(400).json({
            message: "Application already accpted. Browse page for more jobs."
        });
       }

    //Create a new job application

    const application = new Application({
        userId: user.id,
        recruiterId: job.userId,
        jobId: job.id,
        status: "applied",
    });

    await application.save();
    res.json({
        message: "Job application successful",
    });
    }
    catch(err: any) {
        res.status(400).json({
            message: err.message,
        })
    }
})


// In order for recruiter to get applications for a particular job

interface IQueryParams {
    status?: string;
    page?: number;
    limit?: number;
  }

router.get("/jobs/:id/applications", authenticateToken, async (req: Request, res: Response) => {
    const user = req.user;
     if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      interface IFindParams {
        jobId: string;
        recruiterId: string;
        status?: string;
      }

      if(user.type !== "recruiter") {
        return res.status(401).json({
            message: "You don't have permission to view job applications",
        });
      }
      const jobId = req.params.id;

      let findParams: IFindParams = {
        jobId: jobId,
        recruiterId: user.id,
      }

      let sortParams = {};

      const queryParams: IQueryParams = req.query;

      if (queryParams.status) {
        findParams = {
            ...findParams,
            status: queryParams.status,
        };
      }

      try {
        const applications = await Application.find(findParams).collation({locale: "en"}).sort(sortParams).exec();

        res.json(applications);
      } catch (err) {
        res.status(400).json(err);
      }
});


// user gets all his applications depending on whether they are recruiter or applicant type

router.get("/applications", authenticateToken, async(req: Request, res: Response) => {
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
        {$unwind: "$jobApplicant"},
        {$lookup: {
            from: "jobs",
            localField: "jobId",
            foreignField: "id",
            as: "job",
        },
        },
        {$unwind: "$job"},
        {
            $lookup: {
                from: "recruiterinfos",
                localField: "recruiterId",
                foreignField: "userId",
                as: "recruiter",
            },
        },
        {$unwind: "$recruiter"},
        {
            $match: findParams,
        },
        {
            $sort: {
                dateOfApplication: -1,
            },
        },
    ]);

    res.json(applications);
    }
    catch(err) {
        res.status(400).json(err);
    }
})


// update status of application to a job
router.put("/appications/:id", authenticateToken, async (req: Request, res: Response) => {
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

  try{
    if(user.type === "recriter") {
        if(status === "accepted") {
            const application = await Application.findOne({
                _id: new Types.ObjectId(id),
                recruiterId: user.id,
            }).exec();

            if(!application) {
                res.status(404).json({
                    message: "Application not found",
                })
                return;
            }

            const job = await Job.findOne({
                _id: application.jobId,
                userId: user.id,
            }).exec();

            if(!job) {
                res.status(404).json({
                    message: "Job does not exist",
                });
                return;
            }

            const activeApplicationCount = await Application.countDocuments({
                recruiterId: user.id,
                jobId: job._id,
                status: "accepted",
            }).exec();

            if (!job || job.maxPositions === undefined) {
                res.status(404).json({
                    message: "Job does not exist or max positions is undefined",
                });
                return;
            }

            if(activeApplicationCount >= job.maxPositions) {
                res.status(400).json({
                    message: "All positions for this job are already filled",
                });
                return;
            }

            application.status = status;
            if (dateOfJoining) {
                application.dateOfJoining = new Date(dateOfJoining);
            }

            await application.save();

            await Application.updateMany(
                {
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
                },
                {
                    $set: {
                        status: "cancelled",
                    },
                },
                {multi: true}
            ).exec();

            if (status === "accepted") {
                await Job.findByIdAndUpdate({
                    _id: job.id,
                    userId: user.id,
                },
                {
                    $set: {
                        acceptedCandidates: activeApplicationCount + 1,
                    },
                }).exec();
            }

            res.json({
                message: `Application ${status} successfully`,
            });
        }
        else{
            const appication = await Application.findByIdAndUpdate({
                _id: new Types.ObjectId(id),
                recruiterId: user.id,
                status: {
                    $nin: ["rejected", "delete", "cancelled"],
                },
            },
            {
                $set: {
                    status: status,
                }
            }, {new: true}).exec();

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
            } else {
                res.json({
                    message: `Application ${status} successfully`
                });
            }
        }
    } else {
        if (status === "cancelled") {
            const appication = await Application.findByIdAndUpdate(
                {
                _id: id,
                userId: user.id
                }, 
                {
                $set: {
                    status: status,
                },
                 });

                 res.json({
                    message: `Application ${status} successfully`,
                 })
            }
            else {
                res.status(401).json({
                    message: "You don't have permissions to update job status",
                });
             }
         }

  }
  catch(err) {
    res.status(400).json(err);
  }
  
})

// To get a list of final applicant for a recruiter's job

router.get("/applicants", authenticateToken, async(req: Request, res: Response) => {
    const user = req.user;
    const jobId = req.query.jobId?.toString();

    if(!user) {
        res.json({
            message: "User not found"
        })
        return;
    }

    try {
        if(user.type === "recruiter") {
            let findParams: { recruiterId: string; jobId?: mongoose.Types.ObjectId; status?: { $in: string[] | QueryString.ParsedQs[] } | undefined } = {
                recruiterId: user?.id
            };

            if(req.query.jobId) {
                findParams = {
                    ...findParams,
                    jobId: new mongoose.Types.ObjectId(jobId),
                };
            }
            if(req.query.status) {
                if (Array.isArray(req.query.status)) {
                    findParams = {
                        ...findParams,
                        status: {$in: req.query.status},
                    };
                }
            }
            let sortParams = {};

            if(!req.query.asc && !req.query.desc) {
                sortParams = {_id: 1};
            }

            if(req.query.asc) {
                if(Array.isArray(req.query.asc)) {
                    req.query.asc.map((key) => {
                        sortParams = {
                            ...sortParams,
                            [key as string]: 1,
                        };
                    });
                } else {
                    sortParams = {
                        ...sortParams,
                        [req.query.asc as string]: 1,
                    };
                }
            }
            if(req.query.desc) {
                if(Array.isArray(req.query.desc)) {
                    req.query.desc.map((key) => {
                        sortParams = {
                            ...sortParams,
                            [key as string]: -1,
                        };
                    });
                } else {
                    sortParams = {
                    ...sortParams,
                    [req.query.desc as string]: -1,
                    };
                }
            }

            const applications = await Application.aggregate([{
                $lookup: {
                    from: "jobapplicantinfos",
                    localField: "userId",
                    foreignField: "userId",
                    as: "jobApplicant",
                },
            },
            {$unwind: "$jobApplicant"},
            {
                $lookup: {
                    from: "jobs",
                    localField: "jobId",
                    foreignField: "_id",
                    as: "job",
                },
            },
            { $unwind: "$job"},
            {$match: findParams},
            {$sort: sortParams},
        ]);

        if (application.length === 0) {
            res.status(404).json({
                message: "No applicants found",
            })
            return;
        }
        res.json(applications);
        }

        res.status(400).json({
            message: "Applicant list is only accessible to recruiters",
        })
    } catch(err) {
        res.status(400).json(err);
    }2
})

export default module.exports = router;