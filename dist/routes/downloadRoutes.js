"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.get("/resume/:file", (req, res) => {
    try {
        const address = path_1.default.join(__dirname, `../public/resume/${req.params.file}`);
        fs_1.default.accessSync(address, fs_1.default.constants.F_OK);
        res.sendFile(address);
    }
    catch (err) {
        res.status(404).json({
            message: "File not found",
        });
    }
});
router.get("/profile/:file", (req, res) => {
    try {
        const address = path_1.default.join(__dirname, `../public/profile/${req.params.file}`);
        fs_1.default.accessSync(address, fs_1.default.constants.F_OK);
        res.sendFile(address);
    }
    catch (err) {
        res.status(404).json({
            message: "File not found",
        });
    }
});
exports.default = router;
