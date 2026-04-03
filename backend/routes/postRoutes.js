import express from "express";
import Post from "../models/post.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// ── CREATE A POST ────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { caption, image } = req.body;

    const post = new Post({
      user: req.user._id,
      caption,
      image,
    });
    await post.save();

    // populate fills in the actual user data instead of just the ID
    await post.populate("user", "username profilePic");

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET ALL POSTS (feed) ─────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .sort({ createdAt: -1 }); // newest first

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET POSTS BY A SPECIFIC USER ─────────────────────
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET SINGLE POST ──────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE A POST ────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ownership check — only the creator can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── LIKE / UNLIKE A POST ─────────────────────────────
router.put("/:id/like", protect, async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // unlike — remove their ID from likes array
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // like — add their ID to likes array
      post.likes.push(req.user._id);
    }

    // 🔥 ADD THIS LINE
    post.markModified("likes");

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ADD A COMMENT ────────────────────────────────────
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    // populate so we return username with the comment
    await post.populate("comments.user", "username profilePic");

    // return just the new comment (last one added)
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE A COMMENT ─────────────────────────────────
router.delete("/:id/comment/:commentId", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // only comment owner can delete their comment
    const comment = post.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;