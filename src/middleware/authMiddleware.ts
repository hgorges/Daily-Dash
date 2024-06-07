// import bcrypt from "bcrypt";
// import userModel from "../models/userModel";
import { Request, Response, NextFunction } from "express";

async function basicAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    next();

    // const authHeader = req.headers.authorization;
    // if (authHeader == null || !(authHeader ?? "").startsWith("Basic ")) {
    //     res.status(400).send({ error: "Wrong authentication method" });
    //     return;
    // }

    // const base64Credentials = authHeader.split(" ")[1];
    // const credentials = Buffer.from(base64Credentials, "base64").toString(
    //     "utf-8"
    // );
    // const [username, password] = credentials.split(":");

    // if (username.toLowerCase() === "system") {
    //     res.status(423).send({ error: "Locked account" });
    //     return;
    // }

    // try {
    //     const user = await userModel.getUserByUsername(username.toLowerCase());
    //     if (user == null || !(await bcrypt.compare(password, user.password))) {
    //         res.status(401).send({ error: "Invalid credentials" });
    //         return;
    //     }

    //     req.headers.user = user;
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).send({ error: "Internal Server Error" });
    //     return;
    // }

    // next();
}

export { basicAuth };
