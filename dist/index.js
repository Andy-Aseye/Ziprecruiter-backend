"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require('express');
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
require("./DB");
const body_parser_1 = __importDefault(require("body-parser"));
// Parse incoming request bodies in a middleware before your handlers
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
app.get("/", (req, res) => {
    res.send("Hello from typescripts");
    //     const salt = process.env.SALT;
    // console.log(salt);
});
app.get("/hi", (req, res) => {
    res.send("Hiii from typescript and java");
});
app.use("/auth", authRoutes_1.default);
app.use("/api", apiRoutes_1.default);
app.use("*", (req, res, next) => {
    console.info({
        scope: "Request",
        data: {
            ip: req.header("x-forwarded-for") || req.socket.remoteAddress,
            url: req.originalUrl,
            method: req.method,
            body: req === null || req === void 0 ? void 0 : req.body,
            date: new Date().toUTCString(),
        },
    });
    next();
});
const port = 8080;
app.listen(port, () => {
    console.log("this is being listended");
});
