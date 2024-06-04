import express from "express";
import { basicAuth } from "../middleware/authMiddleware";
import { castPromiseToVoid } from "../utils/utils";

const sessionRouter = express.Router();

sessionRouter.use(castPromiseToVoid(basicAuth));

export default sessionRouter;
