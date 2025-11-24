import React from "react";

const ImageZoomModal = ({ imgSrc, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <img
        src={imgSrc}
        alt="Zoomed"
        className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl border border-white/20"
      />
    </div>
  );
};

export default ImageZoomModal;
