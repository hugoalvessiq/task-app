import { useState } from "react";

import "./Modal.css";

const Modal = ({ children, title, classCustom }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  return (
    <div className="btn-modal--container">
      <button className={`${classCustom}`} onClick={openModal}>
        {title}
      </button>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">{children}</div>
          <button className="btn-modal-close" onClick={closeModal}>
            X
          </button>
        </div>
      )}
    </div>
  );
};
export default Modal;
