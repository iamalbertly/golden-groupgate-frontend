import React from 'react';
import './global.css';

function ConfirmationDialog({ show, onConfirm, onCancel, message }) {
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ConfirmationDialog;