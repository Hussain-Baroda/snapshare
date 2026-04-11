import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import API from "../api/axios";

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-row">
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 10, width: "25%" }} />
      </div>
    </div>
    <div className="skeleton" style={{ height: 200, marginBottom: 12 }} />
    <div className="skeleton" style={{ height: 12, width: "70%" }} />
  </div>
);

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await API.get("/posts");
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return;
    setPosting(true);
    try {
      const { data } = await API.post("/posts", { caption, image });
      setPosts([data, ...posts]);
      setCaption("");
      setImage("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = (postId) => setPosts(posts.filter((p) => p._id !== postId));

  return (
    <div className="page">
      <Navbar />
      <div className="feed-layout">

        {/* Create post */}
        <div className="card create-post">
          <div className="create-post-header">
            <div className="avatar avatar-md">{user?.username?.[0]?.toUpperCase()}</div>
            <p className="create-post-placeholder">
              What's on your mind, <strong style={{ color: "var(--text-primary)" }}>{user?.username}</strong>?
            </p>
          </div>
          <form onSubmit={handlePost}>
            <textarea
              className="input"
              placeholder="Share something..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              style={{ marginBottom: 10 }}
            />
            <input
              className="input"
              type="text"
              placeholder="Image URL (optional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <div className="create-post-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={posting || !caption.trim()}
              >
                {posting ? "Posting..." : "Share Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Posts */}
        {loading ? (
          <>{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📸</div>
            <p className="title">No posts yet</p>
            <p className="subtitle">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;