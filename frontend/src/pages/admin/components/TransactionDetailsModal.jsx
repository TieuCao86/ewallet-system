import React from 'react'
import Modal from '../../../components/Modal'

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  selectedTx,
  requestPinAuthorization
}) {
  if (!selectedTx) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết giao dịch hệ thống"
    >
      <div className="tx-detail-panel">
        <div className="tx-detail-row">
          <span className="tx-detail-label">Mã giao dịch:</span>
          <span className="tx-detail-value">{selectedTx.transactionId}</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Thời gian:</span>
          <span className="tx-detail-value">{selectedTx.date}</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Loại giao dịch:</span>
          <span className="tx-detail-value" style={{ textTransform: 'uppercase' }}>
            {selectedTx.type === 'TRANSFER' ? 'Chuyển tiền' : (selectedTx.type === 'TOPUP' ? 'Nạp tiền' : 'Rút tiền')}
          </span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Ví gửi (Nguồn):</span>
          <span className="tx-detail-value">#{selectedTx.senderWalletId}</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Nơi nhận/Đối tác:</span>
          <span className="tx-detail-value">{selectedTx.recipient}</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Số tiền:</span>
          <span className="tx-detail-value" style={{ color: selectedTx.amount > 0 ? '#22c55e' : 'var(--ink)' }}>
            {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount.toLocaleString()}đ
          </span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Phí dịch vụ:</span>
          <span className="tx-detail-value" style={{ color: '#22c55e' }}>Miễn phí (0đ)</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Nội dung ghi chú:</span>
          <span className="tx-detail-value" style={{ fontWeight: 'normal', color: 'var(--ink)' }}>{selectedTx.note || 'Không có'}</span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Nghi vấn gian lận:</span>
          <span className="tx-detail-value" style={{ color: selectedTx.suspicious ? '#ef4444' : '#22c55e' }}>
            {selectedTx.suspicious ? 'Có (Cảnh báo nghi vấn)' : 'Không (An toàn)'}
          </span>
        </div>
        <div className="tx-detail-row">
          <span className="tx-detail-label">Trạng thái:</span>
          <span className={`admin-badge ${selectedTx.status.toLowerCase()}`}>
            {selectedTx.status === 'SUCCESS' ? 'Giao dịch thành công' : 'Thất bại'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {selectedTx.status === 'SUCCESS' && (
            <button
              className="table-action-btn lock"
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', border: '1px solid #ef4444' }}
              onClick={() => requestPinAuthorization('FAIL_TRANSACTION', { transactionId: selectedTx.transactionId })}
            >
              Hủy / Hồi hoàn GD
            </button>
          )}
          <button
            className="secondary-button"
            style={{ flex: 1, minHeight: '44px' }}
            onClick={onClose}
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </Modal>
  )
}
