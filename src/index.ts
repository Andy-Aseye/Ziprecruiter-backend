// const express = require('express');
import express, { Express, Request, Response, NextFunction } from "express";
const app = express();
require("./DB");
import cors from "cors";

import bodyParser from 'body-parser';

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

import authRoute from './routes/authRoutes';
import apiRoutes from './routes/apiRoutes';
import uploadRoutes from "./routes/uploadRoutes";
import downloadRoutes from "./routes/downloadRoutes";





app.get("/", (req: Request, res: Response) => {
    res.send("Hello from typescripts")
//     const salt = process.env.SALT;
// console.log(salt);
});

app.get("/hi", (req: Request, res: Response) => {
    res.send("Hiii from typescript and java")
});


app.use("/auth", authRoute);
app.use("/api", apiRoutes);
app.use("/upload", uploadRoutes);
app.use("/host", downloadRoutes);


app.use("*", (req: Request, res: Response, next: NextFunction) => {
    console.info({
      scope: "Request",
      data: {
        ip: req.header("x-forwarded-for") || req.socket.remoteAddress,
        url: req.originalUrl,
        method: req.method,
        body: req?.body,
        date: new Date().toUTCString(),
      },
    });
    next();
  });




const port = 8080;

app.listen(port, () => {
    console.log("this is being listended")
})