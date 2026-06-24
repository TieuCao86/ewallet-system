import '../pages/Dashboard.css' // Import style dependencies

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {title && (
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
