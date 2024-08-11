import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));


app.use(express.json({ limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb"}))
app.use(express.static("public"));


import userRoutes from './routes/user.routes.js';
import serverCheckRoute from "./routes/servercheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/server-check", serverCheckRoute);
app.use("api/v1/tweets", tweetRouter);
app.use("api/v1/dashboard", dashboardRouter);



export { app };