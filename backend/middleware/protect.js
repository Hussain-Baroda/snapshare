import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token, not authorized"});
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request without password
        req.user =  await User.findById(decoded.id).select("-password");

        next(); // Move to next middleware or route handler

    } catch (error) {
        res.status(401).json({ message: "Invalid token, authorization denied"});
    }
};

export default protect;