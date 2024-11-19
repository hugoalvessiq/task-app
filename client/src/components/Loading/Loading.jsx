import ClipLoader from "react-spinners/ClipLoader";

import "./Loading.css";

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner">
        <ClipLoader color="#3498db" size={50} />
      </div>
    </div>
  );
};
export default Loading;
