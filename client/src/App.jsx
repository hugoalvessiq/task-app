import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import LoginForm from "./components/Login/LoginForm";
import Register from "./pages/Register";
import NoPage from "./pages/NoPage/NoPage";
import ProtectedRoute from "./hook/ProtectRoute";
import Welcome from "./pages/Welcome/Welcome";
import UserDetail from "./components/UserDetail/UserDetail";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="welcome" element={<Welcome />} />
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="user_info"
              element={
                <ProtectedRoute>
                  <UserDetail />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
