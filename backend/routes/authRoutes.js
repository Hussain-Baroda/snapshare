import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// Register a new user

router.post("/register", async(req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use"});
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in db 
        const user = new User.create({
            username,
            email,
            password: hashedPassword,
        });

        // send back tokem +    user info
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token : generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

// Login user
router,post("/login", async(req, res) => {
    try {
        const { email, password } = req.body;

        // Find  user by email
        const user = await User.findOne({ email });
        if( !user) {
            return res.status(400).json({ message: "Invalid email or password"});
        }

        // Check password
        const isMatch = await bcrypt.compare(passsword, user.password); 
        if (!isMatch) {
            return res.status(400),json({ message: "Invalid email or password"});
        }
        // send back token + user info
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token : generateToken(user._id),
        });


    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

export default router;
