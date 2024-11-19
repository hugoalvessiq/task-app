import { useEffect, useState } from "react";
import { useUserContext } from "../../context/userContext";
import "./UpdateUser.css";
import { useAuthContext } from "../../context/AuthContext";
import DOMPurify from "dompurify";

const UpdateUser = ({ closeUpdateModal }) => {
  const { getUser, updateUser } = useAuthContext();
  const { updateUserState } = useUserContext();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await getUser();

        setUserData({ name: userInfo.name, email: userInfo.email });
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUser();
  }, [getUser]);

  const handleInputChange = (e) => {
    setErrorMessage("");
    const { name, value } = e.target;

    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedName = DOMPurify.sanitize(userData.name);
    const sanitizedEmail = DOMPurify.sanitize(userData.email);

    setUserData({ name: sanitizedName, email: sanitizedEmail });

    const response = await updateUser(userData);

    if (response.status === 200) {
      setSuccessMessage("User information updated successfully!");
      updateUserState(userData);
      setErrorMessage("");
      setTimeout(() => {
        closeUpdateModal();
      }, 1000);
    }
    if (response.status === 400) {
      setErrorMessage(`${response.response.data.error}`);
      setSuccessMessage("");
    }
  };

  return (
    <div className="update-user-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <h2 className="update-title">Update User information</h2>
      <form onSubmit={handleSubmit} className="update-form">
        <label className="update-label">
          Name:
          <input
            type="text"
            name="name"
            value={DOMPurify.sanitize(userData.name)}
            onChange={handleInputChange}
            className="update-input"
          />
        </label>
        <label className="update-label">
          Email:
          <input
            type="email"
            name="email"
            id="email"
            value={DOMPurify.sanitize(userData.email)}
            onChange={handleInputChange}
            className="update-input"
          />
        </label>
        <div className="btn-container">
          <button type="submit" className="btn update">
            Update
          </button>
          <button className="btn close" onClick={closeUpdateModal}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
export default UpdateUser;
