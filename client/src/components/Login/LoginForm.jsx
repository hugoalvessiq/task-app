/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import "./LoginForm.css";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading/Loading";
import DOMPurify from "dompurify";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthContext();

  const navigate = useNavigate();

  // Using useRef to automatically focus the email field
  const emailInputRef = useRef(null);

  useEffect(() => {
    // Focus the email field on component loading
    emailInputRef.current.focus();
  }, []);

  const validateEmail = (email) => {
    const eamilRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return eamilRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Check for empty fields
    if (!email || !password || !validateEmail(email)) {
      setError("Please fill all fields to log in or a valid email!");
      return;
    } else {
      setError("");
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      console.error(error);
    }
  };

  const handleChangeEmail = (e) => {
    e.preventDefault();
    setError("");
    const sanitizedEmail = DOMPurify.sanitize(e.target.value);
    setEmail(sanitizedEmail);
  };
  const handleChangePassword = (e) => {
    e.preventDefault();
    setError("");
    setPassword(e.target.value);
  };

  return (
    <div className="login-form">
      {error && <p className="error-message">{error}</p>}
      {isLoading ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <h2>Login</h2>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={DOMPurify.sanitize(email)}
            onChange={(e) => handleChangeEmail(e)}
            ref={emailInputRef}
            maxLength={30}
          />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleChangePassword(e)}
            maxLength={30}
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};
export default LoginForm;
