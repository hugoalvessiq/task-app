import api from "../api/api";

const loginUser = async (userData) => {
  const { email, password } = userData;

  // Validation (replace with your backend validation logic)
  if (!email || !password) {
    throw new Error("Please fill all fields to log in.");
  }
  

  try {
    // Send login request using Axios
    const response = await api.post("/users/login", {
      email,
      password,
      credentials: "include",
    }); // User data sent in the request body

    return {
      token: response.data.token,
      name: response.data.name,
      userId: response.data.userId,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.response.data.message || "Login failed");
  }
};

export default loginUser;
