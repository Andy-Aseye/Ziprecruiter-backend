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





   
    // acceptedCandidates: {
    //   type: Number,
    //   default: 0,
    //   // validate: [
    //   //   {
    //   //     validator: Number.isInteger,
    //   //     msg: "acceptedCandidates should be an integer",
    //   //   },
    //   //   {
    //   //     validator: function (value: any) {
    //   //       return value >= 0;
    //   //     },
    //   //     msg: "acceptedCandidates should greater than equal to 0",
    //   //   },
    //   // ],
    // },
    // dateOfPosting: {
    //   type: Date,
    //   default: Date.now,
    // },
    


// Duration validator

// validate: [
      //   {
      //     validator: Number.isInteger,
      //     msg: "Duration should be an integer",
      //   },
      // ],


// Salary validator

 // validate: [
      //   // {
      //   //   validator: Number.isInteger,
      //   //   msg: "Salary should be an integer",
      //   // },
      //   // {
      //   //   validator: function (value: any) {
      //   //     return value >= 0;
      //   //   },
      //   //   msg: "Salary should be positive",
      //   // },
      // ],







