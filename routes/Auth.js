import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UsersModel from "../UsersModel.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const {
        username,
        password
    } = req.body;

    const user = await UsersModel.findOne({ username });

    if ( user ) {
        res.json({ message: "User already exists." });
        return;
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new UsersModel({
        username,
        password: hashedPass,
        points: []
    })
    await newUser.save();

    res.header("Access-Control-Allow-Origin", "*");
    res.json({ message: "User created!" });
})

router.post("/login", async (req, res ) => {
    const {
        username,
        password
    } = req.body;

    const user = await UsersModel.findOne({ username });

    if (!user) {
        res.json({ message: "User does not exist" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.json({ message: "Incorrect username or password" });
        return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.header("Access-Control-Allow-Origin", "*");
    res.json({ token, userId: user._id });

})

export { router as authRouter };

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, err => {
            if (err) return res.sendStatus(403);
            next();
        });
    } else {
        res.send(401);
    }
}