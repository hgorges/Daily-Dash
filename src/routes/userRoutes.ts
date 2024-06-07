import express from "express";
import {
    dashboardController,
    googleAuthController,
} from "../controller/dashboard";
import { castPromiseToVoid } from "../utils/utils";

const router = express.Router();

router.use((req, _res, next) => {
    console.log(`${req.method} ${req.url} called`);
    next();
});

router.get("/", castPromiseToVoid(dashboardController));
router.get("/google", castPromiseToVoid(googleAuthController));

router.get("/not-found", (_req, res) => {
    res.status(404).render("not-found", {
        pageTitle: "Page Not Found",
        path: "/not-found",
    });
});

router.use((req, res) => {
    console.log(`Redirecting from ${req.url} to /not-found`);
    res.redirect("/not-found");
});

export default router;
