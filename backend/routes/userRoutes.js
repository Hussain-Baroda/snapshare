import express from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import protect  from "../middleware/protect.js";

const router = express.Router();


// ── GET PERSONALISED FEED ────────────────────────────
// posts from people the logged-in user follows

router.get("/feed", protect, async (req, res) => {
    try {
        const currentUser = await User.findById(req.User._id);

        // get posts where the author is someone we follow
        const posts = await Post.find({
            user : { $in: currentUser.following },
        })
            .populate("user", "username profilePic")
            .populate("comments.user", "username profilePic")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET USER PROFILE
router.get("/:id", protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // get their post count at the same time
        const postCount =   await Post.countDocuments({ user: req.params.id });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePic: user.profilePic,
            followers: user.followers,
            following: user.following,
            followerCount: user.followers.length,
            followingCount: user.following.length,
            postCount,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── FOLLOW / UNFOLLOW A USER ─────────────────────────
router.put("/:id/follow", protect, async (req, res) => {
    try {
        if(req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: " You cannot Follow yourself" });
        }

        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === req.user._id
        );

        if (alreadyFollowing) {
            // unfollow -- remove from following and followers arrays
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== req.params.id
            );
            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== req.user._id.toString()
            );


        } else {
            // follow -- add to following and followers arrays
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }
        // save both users at the same time
        await Promise.all([ currentUser.save(), targetUser.save() ]);

        res.json({
            following: !alreadyFollowing,
            followerCount: targetUser.followers.length,
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── UPDATE PROFILE ───────────────────────────────────
router.put("/profile", protect, async (req, res) => {
    try {
        const { username, email, bio, profilePic  } = req.body;

        const user =  await User.findById(req.user._id);

    // only update fields that were actually sent
        if (username) user.username = username;
        if (email !== undefined) user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (profilePic !== undefined) user.profilePic = profilePic;

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePic: user.profilePic,
            followers: user.followers,
            following: user.following,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET FOLLOWERS LIST ───────────────────────────────
router.get("/:id/followers" , protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("followers")
            .populate("followers", "username profilePic bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.followers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET FOLLOWING LIST ───────────────────────────────
router.get("/:id/following" , protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("following")
            .populate("following", "username profilePic bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.following);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;