import React from 'react';

export const ConfirmationDialog = ({ show, onConfirm, onCancel, message }) => {
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
};

export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <div className="error-message">{message}</div>;
};