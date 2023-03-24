import mongoose from "mongoose";

let appicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: ["applied", "shortlisted", "rejected", "cancelled", "invited for interview", "on watchlist"],
        default: "applied",
        required: true,
    },
    dateApplied: {
        type: Date,
        default: Date.now,
    },
    dateOfJoining: {
        type: Date,
        // validate: [
        //     {
        //         // validator: function (value : Date) {
        //         //     return this.dateApplied <= value;
        //         // },
        //         msg: "dateApplied should be greater than dateOfApplication",
        //     },
        // ],
    }
},
{collation: {locale: "en"}}
)



const Application = mongoose.model("Applications", appicationSchema);

export default Application;