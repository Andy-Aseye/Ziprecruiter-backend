import mongoose from "mongoose";

let recruiterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    organization: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },
    contactNumber: {
        type: String,
        // validate: function(v : string) {
        //     return v != "" ? /\+\d{1,3}\d{10}/.test(v) : true;
        // },
        // msg: "Review phone number format"
    },
},
{collation: {locale: "en"}}
);

const RecruiterInfo = mongoose.model("RecruiterInfo", recruiterSchema);

export default RecruiterInfo