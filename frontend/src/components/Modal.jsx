import { useEffect } from "react";

export default function Modal({
  title,
  onClose,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`modal-box modal-${size}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{title}</h2>
            <p>Configure the required information below.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close Modal"
          >
            ×
          </button>
        </div>

        <div className="modal-divider" />

        <div className="modal-body">{children}</div>

        {footer && (
          <>
            <div className="modal-divider" />

            <div className="modal-footer">
              {footer}
            </div>
          </>
        )}
      </div>
    </div>
  );
}