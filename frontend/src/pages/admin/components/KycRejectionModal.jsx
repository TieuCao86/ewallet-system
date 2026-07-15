import React from 'react'
import Modal from '../../../components/layout/Modal.jsx'

export default function KycRejectionModal({
  isOpen,
  onClose,
  rejectionReason,
  setRejectionReason,
  onSubmit
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lý do từ chối hồ sơ KYC"
    >
      <div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 12px' }}>
          Vui lòng nhập lý do từ chối phê duyệt hồ sơ xác thực. Lý do này sẽ được gửi tới người dùng.
        </p>
        <textarea
          className="reject-textarea"
          placeholder="Ví dụ: Ảnh chân dung mờ, Mặt sau giấy tờ CCCD bị mất góc, thông tin không trùng khớp..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ flex: 1, minHeight: '44px' }}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            className="table-action-btn reject"
            type="button"
            style={{ flex: 1, minHeight: '44px', borderRadius: '12px', border: 'none' }}
            onClick={onSubmit}
            disabled={!rejectionReason.trim()}
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </Modal>
  )
}
