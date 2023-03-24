import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from "dotenv";

dotenv.config();

let UserSchema = new mongoose.Schema(
    {
        email: {
            type: mongoose.SchemaTypes.String,
            unique: true,
            lowercase: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["recruiter", "applicant"],
            required: true,
        },
    },
)


// For dev-sec purposes, I'd hash the password of the user before saving into the database

const salt = process.env.SALT || "";
// const saltOrRounds = parseInt(salt || '10', 10);

UserSchema.pre("save", function (next) {

    let user = this;

    // The next function should run if the password in the user schema has not been modified.

    if(!user.isModified("password")) {
    return next();}

    bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) return next(err);

        user.password = hash;
        next();
    })
});
 
const UserAuth = mongoose.model('UserAuth', UserSchema);

export default UserAuth;

// At this point I'll hash the password since the password is still the same.






