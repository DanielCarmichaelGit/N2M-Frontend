import { Link } from "react-router-dom";

function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("N2M-token");
  };
  return (
    <div className="Navbar">
      <h1>N2M</h1>
      <div>
        <Link className="NavLink" onClick={() => handleLogout()} to="/login">
          Logout
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
