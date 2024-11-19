import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import api from "../api/api";
import { AuthContext, useAuthContext } from "./AuthContext";

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "CLEAR_USER":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export const UserContextProvider = ({ children }) => {
  const { token, login, logout } = useAuthContext();
  const { isLoggedIn } = useContext(AuthContext);

  const [user, dispatch] = useReducer(userReducer, {
    user: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!isLoggedIn || !localStorage.getItem("token")) {
          console.log("No user logged, skipping user fetch.");
          return;
        }

        const response = await api.get("/users");

        dispatch({ type: "SET_USER", payload: response.data });
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, [login, token, isLoggedIn]);

  const updateUserState = (updatedUserData) => {
    dispatch({ type: "SET_USER", payload: updatedUserData });
  };

  const deleteUser = async () => {
    try {
      const response = await api.delete("/users");

      if (response.status !== 200) {
        throw new Error(response.data?.error || "Failed to delete user.");
      }

      logout();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        dispatch,
        deleteUser,
        updateUserState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

// export { UserContext }; // only for tests components
