import React, { useEffect, useState } from 'react';
import './styles/ToastMessage.css';

export const TOAST_MESSAGES = {
  saved: 'Wheel saved successfully',
  updated: 'Wheel updated successfully',
  deleted: 'Wheel deleted successfully',
  draft_deleted: 'Draft deleted',
};

const ToastMessage = ({ action }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!action?.type) return;

    const msg = TOAST_MESSAGES[action.type];
    if (!msg) return;

    setMessage(msg);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [action]); // IMPORTANT: id triggers re-show

  if (!visible) return null;

  return <div className="toast-message">{message}</div>;
};

export default ToastMessage;
