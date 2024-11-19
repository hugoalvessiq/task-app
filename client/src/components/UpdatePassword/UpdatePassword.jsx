import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
// import { useUserContext } from "../../../context/userContext";

import "./UpdatePassword.css";

const UpdatePassword = ({ closeUpdatePasswordModal }) => {
  const { updatePassword } = useAuthContext();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updatePassword(passwordData);
      console.log(response);

      setSuccessMessage("Password updated successfully!");
      setErrorMessage("");
      setTimeout(() => {
        closeUpdatePasswordModal();
      }, 1000);
    } catch (error) {
      setErrorMessage("Error updating password.", error);
      setSuccessMessage("");
    }
  };
  return (
    <div>
      <div className="update-password-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit}>
          <label>
            current Password:
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
            />
          </label>
          <label>
            New Password:
            <input
              type="password"
              name="newPassword"
              id="password"
              value={passwordData.newPassword}
              onChange={handleInputChange}
            />
          </label>
          <div className="btn-container">
            <button type="submit" className="btn update">
              Update
            </button>
            <button className="btn close" onClick={closeUpdatePasswordModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdatePassword;
