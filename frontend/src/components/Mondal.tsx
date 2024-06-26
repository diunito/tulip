// src/Modal.tsx
import React, { FC, ReactNode } from 'react';
import ReactDOM from 'react-dom';


interface ModalProps {
  show: boolean;
  title: string
  onClose?: () => void;
  children: ReactNode;
}

export function Modal({ show, title, onClose, children }: ModalProps) {
  if (!show) {
    return null;
  }

  const close = () => {
    if (onClose) {
      onClose()
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30 " onClick={onClose}>
      <div className="bg-white p-6 rounded shadow-lg min-w-[50%] max-w-[80%] max-h-[90%] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-1">
          <h4 className="text-xl font-semibold">{title}</h4>
          <button onClick={onClose} className="text-xl font-bold">&times;</button>
        </div>
        <div className="mb-4 overflow-auto">
          {children}
        </div>
        <div className="flex justify-end flex-1">
          <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>,
    document.getElementById("root") || document.body
  );
};

