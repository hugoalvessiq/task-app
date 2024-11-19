import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading/Loading";

import "./RegisterForm.css";

const RegisterForm = () => {
  const { register, login } = useAuthContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const nameInputRef = useRef(null);
  useEffect(() => {
    nameInputRef.current.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData);

      login({ email: formData.email, password: formData.password });
      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Failed to register");
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="register-form">
          <h2>Register</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                ref={nameInputRef}
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="password">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span>Min length 6 characters!</span>
            </div>
            <button type="submit">Register</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default RegisterForm;
