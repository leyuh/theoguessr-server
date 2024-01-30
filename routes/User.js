import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { verifyToken } from "./Auth.js";
import UsersModel from "../UsersModel.js";

const router = express.Router();

router.get("/get-users", async (req, res) => {
    try {
        const users = await UsersModel.find({});

        res.header("Access-Control-Allow-Origin", "*");
        res.json(users);
    } catch (err) {
        res.json(err);
    }
})


router.put("/post-points", verifyToken, async (req, res) => {
    const {
        _id,
        newPoints
    } = req.body;

    try {
        const user = await UsersModel.findOne({ _id });
        if (user.points.length >= 50) user.points.shift();
        user.points.push(newPoints);
        await user.save();

        const result = await UsersModel.find({});
        res.header("Access-Control-Allow-Origin", "*");
        res.json(result);
    } catch (err) {
        res.json(err);
    }
})

export { router as userRouter };