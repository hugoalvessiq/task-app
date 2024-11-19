import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/userContext";

import "./UserDetail.css";
import Loading from "../Loading/Loading";
import { useEffect, useState } from "react";
import { useTaskContext } from "../../context/TaskContext";

import UpdateUser from "../UpdateUser/UpdateUser";
import { useAuthContext } from "../../context/AuthContext";
import UpdatePassword from "../UpdatePassword/UpdatePassword";
import capitalizeFirstLetter from "../../hook/capitalizerFirstLetter";
import DOMPurify from "dompurify";

const UserDetail = () => {
  const { getUser } = useAuthContext();
  const { user, deleteUser } = useUserContext();
  const { getAllTasks } = useTaskContext();
  const navigate = useNavigate();
  const [taskAlert, setTaskAlert] = useState(false);
  const [userData, setUserData] = useState({});
  const [dataCounter, setDataCounter] = useState(0);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => setIsUpdateModalOpen(false);
  const openUpdatePasswordModal = () => setIsUpdatePasswordModalOpen(true);
  const closeUpdatePasswordModal = () => setIsUpdatePasswordModalOpen(false);

  const openDeleteModal = (taskId) => {
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getUser();
      setUserData(data);
    };

    fetchTasks();
  }, [getUser, user]);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getAllTasks();

      setDataCounter(data.length);
      if (data.length > 0) {
        setTaskAlert(true);
      }
    };

    fetchTasks();
  }, [getAllTasks, getUser]);

  if (!user) {
    return <Loading />;
  }

  const handleDelete = async () => {
    try {
      await deleteUser();
      alert("User deleted successfully");
      navigate("/welcome");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="user-detail-container">
      <h1>User Details</h1>
      <div className="detail-container">
        <strong>Name: </strong>
        <p
          className="user-data"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              userData && userData
                ? capitalizeFirstLetter(userData.name)
                : "Loading..."
            ),
          }}
        ></p>
      </div>
      <div className="detail-container">
        <strong>Email: </strong>
        <p
          className="user-data"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              userData && userData ? userData.email : "Loading..."
            ),
          }}
        ></p>
      </div>
      <div className="detail-container">
        <strong>{dataCounter > 1 ? "Tasks:" : "Task:"}</strong>
        <p
          className="user-data"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              userData && dataCounter ? dataCounter : "0"
            ),
          }}
        ></p>
      </div>
      <div className="link-container">
        <button className="link-update update-user" onClick={openUpdateModal}>
          Update User Data?
        </button>
        <button className="link-update" onClick={openUpdatePasswordModal}>
          Update User Password?
        </button>
      </div>
      <button type="delete" className="delete-button" onClick={openDeleteModal}>
        Delete
      </button>
      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-layout">
            <h3>
              {!taskAlert
                ? "Are you sure you want to delete your account? This action cannot be undone!"
                : "The user still has saved tasks and wants to delete them anyway?"}
            </h3>
            <div className="btn-container-delete-task">
              <button
                type="delete"
                className="delete-button"
                onClick={handleDelete}
              >
                Deletar
              </button>
              <button
                className="primary-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {isUpdateModalOpen && (
        <div className="modal">
          <div className="modal-create">
            <UpdateUser closeUpdateModal={closeUpdateModal} />
          </div>
        </div>
      )}
      {isUpdatePasswordModalOpen && (
        <div className="modal">
          <div className="modal-create">
            <UpdatePassword
              closeUpdatePasswordModal={closeUpdatePasswordModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default UserDetail;
