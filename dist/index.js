"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require('express');
const express_1 = __importDefault(require("express"));
require("./DB");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const downloadRoutes_1 = __importDefault(require("./routes/downloadRoutes"));
const app = (0, express_1.default)();
// Parse incoming request bodies in a middleware before your handlers
if (process.env.NODE_ENV === "development")
    app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use('/public', express_1.default.static('public'));
app.get("/", (req, res) => {
    res.send("Hello from typescripts");
});
app.use("/auth", authRoutes_1.default);
app.use("/api", apiRoutes_1.default);
app.use("/upload", uploadRoutes_1.default);
app.use("/host", downloadRoutes_1.default);
// application error handler
app.use((err, _req, res, _next) => {
    var _a, _b;
    const status = (_a = err.status) !== null && _a !== void 0 ? _a : 500;
    const message = (_b = err.message) !== null && _b !== void 0 ? _b : "An unknown error has occurred";
    res.status(status).json({ message, status });
});
// not found handler
app.use((_req, res) => {
    res.status(404).json({ status: 404, message: "Endpoint not found" });
});
const port = 8080;
app.listen(port, () => {
    console.log(`this is being listened on PORT - ${port}`);
});
