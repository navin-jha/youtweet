import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// configure middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ credentials: true, limit: "16kb" }));

app.use(cookieParser());
app.use(express.static("public"));

// import routers
import { healthCheckRouter, userRouter } from "./routes/index.js";

// configure routes
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/user", userRouter);

export default app;
