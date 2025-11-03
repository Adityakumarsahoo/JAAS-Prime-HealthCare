import React from "react";

const number = import.meta.env.VITE_WHATSAPP_NUMBER || "918018389108"; // use full international format
const message = import.meta.env.VITE_WHATSAPP_MESSAGE || "I WANT TO CHECKUP";
const label = import.meta.env.VITE_WHATSAPP_LABEL || "Chat with us";

const buildUrls = () => {
  const encoded = encodeURIComponent(message);
  return {
    web: `https://wa.me/${number}?text=${encoded}`,
    app: `whatsapp://send?phone=${number}&text=${encoded}`,
  };
};

export default function WhatsAppFloat() {
  const { web, app } = buildUrls();

  const handleClick = (e) => {
    // Prefer deep link on mobile; fallback to web link
    try {
      const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(
        navigator.userAgent
      );
      const targetUrl = isMobile ? app : web;
      e.preventDefault();
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (_) {
      // Final fallback: navigate to web link in same tab
      window.location.href = web;
    }
  };

  return (
    <a
      href={web}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed left-4 bottom-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600"
    >
      <span>{label}</span>
    </a>
  );
}