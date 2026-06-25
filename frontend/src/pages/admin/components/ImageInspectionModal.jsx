import React from 'react'
import { X } from '@phosphor-icons/react'

export default function ImageInspectionModal({ zoomedImage, onClose }) {
  if (!zoomedImage) return null

  return (
    <div className="img-viewer-overlay" onClick={onClose}>
      <div className="img-viewer-content" onClick={(e) => e.stopPropagation()}>
        <img src={zoomedImage.src} alt="CCCD Zoomed" />
        <span className="img-viewer-title">{zoomedImage.title}</span>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-16px',
            right: '-16px',
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 'bold'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
