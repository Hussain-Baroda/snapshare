import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/feed" className="navbar-logo">SnapShare</Link>
        <div className="navbar-links">
          <Link to="/feed" className="navbar-link">Feed</Link>
          <Link to={`/profile/${user?._id}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="avatar avatar-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="navbar-link">{user?.username}</span>
          </Link>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;