import mongoose from "mongoose";

let jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    skills: [String],
    description: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    duration: {
      type: String,
      min: 0,
    },
    salary: {
      type: String,
    },
   
  },
  // { collation: { locale: "en" } }
);

const Job =  mongoose.model("Job", jobSchema);

export default Job;







