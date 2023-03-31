"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editApplicationSchema = exports.editUserSchema = exports.idParamSchema = exports.editJobSchema = exports.postJobSchema = void 0;
const yup = __importStar(require("yup"));
exports.postJobSchema = yup.object({
    body: yup.object({
        title: yup.string().required(),
        description: yup.string().required(),
        skills: yup.array().of(yup.string()).required(),
        jobType: yup.string().required(),
        duration: yup.string().required(),
        salary: yup.string().required(),
    })
});
exports.editJobSchema = yup.object({
    body: yup.object({
        salary: yup.string().notRequired(),
        duration: yup.string().notRequired(),
        deadline: yup.string().notRequired()
    }),
    params: yup.object({
        id: yup.string().required()
    })
});
exports.idParamSchema = yup.object({
    params: yup.object({
        id: yup.string().required()
    })
});
exports.editUserSchema = yup.object({
    body: yup.object({
        name: yup.string().notRequired(),
        organization: yup.string().notRequired(),
        position: yup.string().notRequired(),
        contactNumber: yup.string().notRequired(),
        education: yup.string().notRequired(),
        skills: yup.string().notRequired(),
        resume: yup.string().notRequired(),
        profile: yup.string().notRequired(),
    })
});
exports.editApplicationSchema = yup.object({
    body: yup.object({
        status: yup.string().notRequired(),
        dateOfJoining: yup.string().notRequired(),
    }),
    params: yup.object({
        id: yup.string().required()
    })
});
