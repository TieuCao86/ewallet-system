import React, { useState } from 'react'
import { Check, Copy, DownloadSimple } from '@phosphor-icons/react'

export default function TransactionSuccessModal({
  isOpen,
  tx,
  onClose,
  userProfile,
  showToast
}) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen || !tx) return null

  // Determine label and formatting details based on type
  const getTxTypeDetails = () => {
    switch (tx.type) {
      case 'TRANSFER':
        return {
          title: 'Chuyển khoản thành công',
          amountPrefix: '-',
          amountClass: 'type-outgoing',
          typeLabel: 'Chuyển tiền nhanh 24/7',
          recipientLabel: 'Người nhận',
          defaultNote: 'Chuyển tiền nhanh qua ví điện tử'
        }
      case 'TOPUP':
        return {
          title: 'Nạp tiền thành công',
          amountPrefix: '+',
          amountClass: 'type-incoming',
          typeLabel: 'Nạp tiền vào ví',
          recipientLabel: 'Nguồn tiền',
          defaultNote: 'Nạp tiền vào tài khoản ví'
        }
      case 'WITHDRAW':
        return {
          title: 'Rút tiền thành công',
          amountPrefix: '-',
          amountClass: 'type-outgoing',
          typeLabel: 'Rút tiền về tài khoản ngân hàng',
          recipientLabel: 'Tài khoản nhận',
          defaultNote: 'Rút tiền từ ví về tài khoản liên kết'
        }
      default:
        return {
          title: 'Giao dịch thành công',
          amountPrefix: '',
          amountClass: 'type-outgoing',
          typeLabel: 'Giao dịch ví',
          recipientLabel: 'Đối tác',
          defaultNote: 'Giao dịch ví điện tử'
        }
    }
  }

  const details = getTxTypeDetails()
  const displayAmount = Math.abs(tx.amount).toLocaleString()

  const handleCopyId = () => {
    navigator.clipboard.writeText(tx.id)
    setCopied(true)
    if (showToast) {
      showToast('Đã sao chép mã giao dịch thành công!')
    }
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      if (showToast) {
        showToast('Đã lưu biên lai giao dịch thành công vào thư viện ảnh!')
      }
    }, 1200)
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ cursor: 'pointer' }}>
      <div 
        className="success-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'default' }}
      >
        {/* Header - Success circle and amount */}
        <div className="success-modal-header">
          <div className="success-badge">
            <Check size={36} weight="bold" />
          </div>
          <h2 className="success-title">{details.title}</h2>
          <div className={`success-amount ${details.amountClass}`}>
            {details.amountPrefix}{displayAmount}đ
          </div>
        </div>

        {/* Tear-off Ticket Dividers */}
        <div className="ticket-divider-container">
          <div className="ticket-notch-left"></div>
          <div className="ticket-divider-line"></div>
          <div className="ticket-notch-right"></div>
        </div>

        {/* Body - Details grid */}
        <div className="success-modal-body">
          <div className="receipt-details-list">
            <div className="receipt-row">
              <span className="receipt-label">Loại giao dịch</span>
              <span className="receipt-value">{details.typeLabel}</span>
            </div>
            
            <div className="receipt-row">
              <span className="receipt-label">Mã giao dịch</span>
              <span className="receipt-value receipt-value-code">
                {tx.id}
                <button 
                  className="copy-btn" 
                  onClick={handleCopyId}
                  title="Sao chép mã giao dịch"
                >
                  <Copy size={14} weight={copied ? "fill" : "regular"} />
                </button>
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Thời gian</span>
              <span className="receipt-value">{tx.date}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Tài khoản nguồn</span>
              <span className="receipt-value">
                {userProfile.fullName} ({userProfile.phone.substring(0, 4)}***{userProfile.phone.substring(7)})
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">{details.recipientLabel}</span>
              <span className="receipt-value">
                {tx.recipient}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Nội dung</span>
              <span className="receipt-value">
                {tx.note || details.defaultNote}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Phí giao dịch</span>
              <span className="receipt-value" style={{ color: '#22c55e' }}>Miễn phí (0đ)</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Trạng thái</span>
              <span className="receipt-value" style={{ color: '#22c55e', fontWeight: 700 }}>
                Thành công
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="receipt-actions">
            <button 
              className="btn-receipt-share" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <div className="btn-spinner" style={{ borderLeftColor: 'var(--ink)' }} />
              ) : (
                <>
                  <DownloadSimple size={18} weight="bold" />
                  Tải biên lai
                </>
              )}
            </button>
            <button className="btn-receipt-confirm" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
