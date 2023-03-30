"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
const authenticateToken = (req, res, next) => {
    // const authHeader = req.headers.authorization;
    const tokenBearer = req.headers.authorization;
    const token = tokenBearer.split(" ")[1];
    console.log(token);
    if (!tokenBearer) {
        return res.status(401).send('Missing authorization token');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        console.log(decoded);
        if (typeof decoded === "string") {
            throw new Error("Invalid JWT payload");
        }
        const userPayload = {
            id: decoded._id,
            email: decoded.email,
            type: decoded.type,
        };
        console.log(userPayload);
        req.user = userPayload;
        // console.log(req.user)
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(403).send('Invalid authorization token');
    }
};
exports.authenticateToken = authenticateToken;
