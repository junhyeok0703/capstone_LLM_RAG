import React from "react";
import "./Modal.css";

const Modal = ({ onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {children}
      <button onClick={onClose}>닫기</button>
    </div>
  </div>
);

export default Modal;
