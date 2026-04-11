import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const timeAgo = (date) => {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(
    post.likes.some((id) => (typeof id === "object" ? id._id : id) === user?._id)
  );
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const { data } = await API.put(`/posts/${post._id}/like`);
      setLikes(data.likes);
      setLiked(data.liked);
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: comment });
      setComments([...comments, data]);
      setComment("");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="card post-card">
      {/* Header */}
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`} className="post-user-info">
          <div className="avatar avatar-md">{post.user.username?.[0]?.toUpperCase()}</div>
          <div>
            <p className="post-username">{post.user.username}</p>
            <p className="post-time">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {user?._id === post.user._id && (
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="post-image"
          onError={(e) => (e.target.style.display = "none")}
        />
      )}

      {/* Caption */}
      {post.caption && (
        <p className="post-caption">
          <strong>{post.user.username}</strong>{post.caption}
        </p>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={`action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
          <span className="icon">{liked ? "♥" : "♡"}</span>
          {likes} {likes === 1 ? "like" : "likes"}
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          <span className="icon">💬</span>
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="comments-section">
          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
              No comments yet. Be the first!
            </p>
          )}
          <div style={{ maxHeight: 160, overflowY: "auto" }}>
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <div className="avatar avatar-sm">{c.user?.username?.[0]?.toUpperCase()}</div>
                <p className="comment-text">
                  <strong>{c.user?.username}</strong>{c.text}
                </p>
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={handleComment}>
            <input
              className="comment-input"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit" className="comment-btn">Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;