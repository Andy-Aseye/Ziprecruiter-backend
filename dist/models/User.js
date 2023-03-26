"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let UserSchema = new mongoose_1.default.Schema({
    email: {
        type: mongoose_1.default.SchemaTypes.String,
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
});
// For dev-sec purposes, I'd hash the password of the user before saving into the database
const salt = process.env.SALT || "";
// const saltOrRounds = parseInt(salt || '10', 10);
UserSchema.pre("save", function (next) {
    let user = this;
    // The next function should run if the password in the user schema has not been modified.
    if (!user.isModified("password")) {
        return next();
    }
    bcrypt_1.default.genSalt(10, function (err, salt) {
        if (err)
            return next(err);
        bcrypt_1.default.hash(user.password, salt, (err, hash) => {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});
const UserAuth = mongoose_1.default.model('UserAuth', UserSchema);
exports.default = UserAuth;
// At this point I'll hash the password since the password is still the same.
