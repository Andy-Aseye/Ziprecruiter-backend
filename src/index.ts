// const express = require('express');
import express, { Express, Request, Response, NextFunction } from "express";
require("./DB");
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import authRoute from "./routes/authRoutes";
import apiRoutes from "./routes/apiRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import downloadRoutes from "./routes/downloadRoutes";
import HttpError from "./types";

const app = express();

// Parse incoming request bodies in a middleware before your handlers
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/public', express.static('public'))

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from typescripts");
});

app.use("/auth", authRoute);
app.use("/api", apiRoutes);
app.use("/upload", uploadRoutes);
app.use("/host", downloadRoutes);

// application error handler
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const message = err.message ?? "An unknown error has occurred";
  res.status(status).json({ message, status });
});

// not found handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 404, message: "Endpoint not found" });
});

const port = 8080;

app.listen(port, () => {
  console.log(`this is being listened on PORT - ${port}`);
});
