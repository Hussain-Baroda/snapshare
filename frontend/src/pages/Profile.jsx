import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import API from "../api/axios";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");

  const isOwn = user?._id === id;

  useEffect(() => { fetchProfile(); fetchPosts(); }, [id]);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/users/${id}`);
      setProfile(data);
      setFollowerCount(data.followerCount);
      setBio(data.bio || "");
      setFollowing(
        data.followers.some((f) => (typeof f === "object" ? f._id : f) === user?._id)
      );
    } catch (err) { console.error(err); }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await API.get(`/posts/user/${id}`);
      setPosts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    try {
      const { data } = await API.put(`/users/${id}/follow`);
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    } catch (err) { console.error(err); }
  };

  const handleUpdateBio = async () => {
    try {
      await API.put("/users/profile", { bio });
      setProfile({ ...profile, bio });
      setEditMode(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = (postId) => setPosts(posts.filter((p) => p._id !== postId));

  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
        Loading profile...
      </div>
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="feed-layout">

        {/* Profile card */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar avatar-lg">{profile?.username?.[0]?.toUpperCase()}</div>

            <div className="profile-info">
              <div className="profile-top">
                <h2 className="profile-username">{profile?.username}</h2>
                {!isOwn && (
                  <button
                    className={`btn-follow ${following ? "following" : ""}`}
                    onClick={handleFollow}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                )}
                {isOwn && (
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: 13, padding: "6px 14px" }}
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? "Cancel" : "Edit Bio"}
                  </button>
                )}
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <p className="stat-number">{posts.length}</p>
                  <p className="stat-label">posts</p>
                </div>
                <div className="stat-item">
                  <p className="stat-number">{followerCount}</p>
                  <p className="stat-label">followers</p>
                </div>
                <div className="stat-item">
                  <p className="stat-number">{profile?.followingCount}</p>
                  <p className="stat-label">following</p>
                </div>
              </div>

              {editMode ? (
                <div className="bio-edit-row">
                  <input
                    className="input"
                    style={{ fontSize: 13 }}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write your bio..."
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                    onClick={handleUpdateBio}
                  >
                    Save
                  </button>
                </div>
              ) : (
                profile?.bio && <p className="profile-bio">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="posts-divider">Posts</div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📷</div>
            <p className="title">No posts yet</p>
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

export default Profile;