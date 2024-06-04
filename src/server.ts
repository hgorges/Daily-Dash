import dotenv from "dotenv";
dotenv.config({ path: "../secrets/.env" });
import https from "https";

import cors from "cors";
import express from "express";
import userRoutes from "./routes/userRoutes";
import sessionRouter from "./routes/sessionRoute";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import favicon from "serve-favicon";

const app = express();
const port = parseInt(process.env.PORT as string);

export const fileRoot = path.join(__dirname, "..");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(fileRoot, "public", "favicon.ico")));
app.use(express.static(path.join(fileRoot, "/public")));

app.use(cors(), sessionRouter);

app.use(userRoutes);

const privateKey = fs.readFileSync(
    path.join(__dirname, "..", "secrets", "cryptospace.key"),
    "utf8"
);
const certificate = fs.readFileSync(
    path.join(__dirname, "..", "secrets", "cryptospace.crt"),
    "utf8"
);

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

console.log(`Server is running on port ${port}`);

export {};
