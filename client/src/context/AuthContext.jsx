/* eslint-disable react/prop-types */
import { createContext, useContext, useReducer, useState } from "react";
import loginUser from "../hook/loginUser";
import registerUser from "../hook/registerUser";
import api from "../api/api";

const initialState = {
  token: localStorage.getItem("token") || null,
  name: localStorage.getItem("username") || null, // Consider using a consistent key (e.g., "user")
  userId: localStorage.getItem("userId") || null, // Optional, for user identification
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        token: action.payload.token,
        name: action.payload.name,
        userId: action.payload.userId, // Optional, for user identification
      };
    case "LOGOUT":
      return {
        ...state,
        token: null,
        name: null,
        userId: null, // Optional, for user identification
      };
    default:
      return state;
  }
};

const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (userData) => {
    const response = await loginUser(userData);

    const { token, name, userId } = response; // Destructure the response data

    // Store data in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", userId);

    // Update state
    dispatch({ type: "LOGIN", payload: { token, name, userId } });

    // Update login flag after success
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      // Send request to backend to remove cookie
      await api.post("/users/logout", {
        credentials: "include", // Include cookies in the request
      });

      // Clear state and localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      const { token, name, userId } = response;
      dispatch({ type: "LOGIN", payload: { token, name, userId } });
    } catch (error) {
      console.error("registration failed", error);
      throw error;
    }
  };

  const getUser = async () => {
    try {
      if (!localStorage.getItem("token")) {
        console.log("No user logged, skipping user fetch.");
        return;
      }
      const response = await api.get("/users", {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error get User:", error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await api.put("/users", userData, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });

      localStorage.setItem("username", response.data.name);
      return response;
    } catch (error) {
      return error;
    }
  };

  const updatePassword = async (passwordData) => {
    const response = await api.patch("/users/password", passwordData, {
      headers: {
        Authorization: `${localStorage.getItem("token")}}`,
      },
    });

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        updatePassword,
        getUser,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export { AuthContext };
