import { Link } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  return (
    <div className="presentation-container">
      <h1>Welcome to Your Task Manager!</h1>
      <p>Organize your tasks, set priorities, and boost your productivity.</p>
      <div className="button-group">
        <Link to={`/login`} className="btn btn-primary">
          Login
        </Link>
        <Link to={`/register`} className="btn btn-secondary">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Welcome;
