"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: '5h',
};
//   Set mysecret key to anything in a .env file
