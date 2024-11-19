import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Navbar.css";
import { useAuthContext } from "../../context/AuthContext";
import capitalizeFirstLetter from "../../hook/capitalizerFirstLetter";
import { useUserContext } from "../../context/userContext";
import { FaRegUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { GiNotebook } from "react-icons/gi";
import { CiLogin } from "react-icons/ci";

const NavBar = () => {
  const { token, name, logout, getUser, updateUser } = useAuthContext();
  const { user, updateUserState } = useUserContext();

  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!localStorage.getItem("token")) {
        console.log("No user logged, skipping user fetch.");
        return;
      }
      try {
        const userInfo = await getUser();
        setTimeout(() => {
          setUserName(userInfo.name);
        }, 1000);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUser();
  }, [getUser, user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">
          <Link to="/">
            <GiNotebook /> Tasks
          </Link>
        </h1>
        <div
          className={`menu-toggle ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <ul
          className={`nav-menu ${isOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          {!token && (
            <li className="nav-item">
              <Link to="/login" className="nav-links">
                <CiLogin className="login-icon" /> Login
              </Link>
            </li>
          )}
          {!token && (
            <li className="nav-item">
              <Link to="/register" className="nav-links">
                Register
              </Link>
            </li>
          )}
          {token && (
            <li className="nav-item">
              <Link to="/user_info" className="nav-links">
                <FaRegUser className="user-icon" />
                Hello,{" "}
                <span className="user-name">
                  {capitalizeFirstLetter(userName)}
                </span>
              </Link>
            </li>
          )}
          {token && (
            <li className="nav-item">
              <Link onClick={logout} className="nav-links">
                <FiLogOut className="user-icon" />
                Logout
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};
export default NavBar;
