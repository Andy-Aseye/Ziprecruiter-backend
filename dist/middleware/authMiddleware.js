"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("./config"));
const authenticateToken = (req, res, next) => {
    var _a;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('Missing authorization token');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        if (typeof decoded === "string") {
            throw new Error("Invalid JWT payload");
        }
        const userPayload = {
            id: decoded._id,
            email: decoded.email,
            type: (_a = req.user) === null || _a === void 0 ? void 0 : _a.type
        };
        req.user = userPayload;
        next();
    }
    catch (err) {
        return res.status(403).send('Invalid authorization token');
    }
};
exports.authenticateToken = authenticateToken;
