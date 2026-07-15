import { CheckCircle, QrCode } from '@phosphor-icons/react'
import Modal from '../layout/Modal.jsx'

export default function QrScannerModal({
  isOpen,
  onClose,
  qrFile,
  setQrFile,
  scanSuccess,
  setScanSuccess,
  showToast,
  setTransferPhone,
  setTransferAmount,
  setTransferNote,
  setActiveTab,
  setModalType,
  userProfile
}) {
  const resetScanner = () => {
    setModalType(null)
    setQrFile(null)
    setScanSuccess(false)
  }

  const handleFileUpload = (file) => {
    setQrFile(file)

    setTimeout(() => {
      setScanSuccess(true)
      showToast('Giải mã QR thành công!')
      setTimeout(() => {
        setTransferPhone('0987654321')
        setTransferAmount('')
        setTransferNote('Chuyen khoan qua QR nhan tien')
        setActiveTab('transactions')
        resetScanner()
      }, 1200)
    }, 1500)
  }

  const handleSimulateScan = () => {
    setScanSuccess(true)
    showToast('Quét QR Nguyễn Bá Việt thành công!')
    setTimeout(() => {
      setTransferPhone('0987654321')
      setTransferAmount('')
      setTransferNote('Quet QR chuyen tien nhanh')
      setActiveTab('transactions')
      resetScanner()
    }, 1000)
  }

  return (
    <Modal isOpen={isOpen} onClose={resetScanner} title="Quét mã QR chuyển tiền">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.4, textAlign: 'center' }}>
          Giả lập quét mã QR để lấy thông tin tài khoản người nhận. Hỗ trợ quét qua camera hoặc tải ảnh từ thư viện.
        </p>

        <div
          style={{
            width: '240px',
            height: '240px',
            border: '2px solid var(--accent)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            background: '#090f1d',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 25px rgba(0, 106, 255, 0.1)',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #006aff, transparent)',
              boxShadow: '0 0 8px #006aff',
              animation: 'scanLineEffect 2s linear infinite'
            }}
          />

          {scanSuccess ? (
            <div style={{ color: '#22c55e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <CheckCircle size={44} weight="fill" />
              <strong style={{ fontSize: '0.9rem' }}>Quét mã thành công!</strong>
            </div>
          ) : qrFile ? (
            <div style={{ color: 'var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <div className="btn-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Đang giải mã QR...</span>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <QrCode size={48} weight="thin" />
              <span style={{ fontSize: '0.78rem' }}>Đặt mã QR vào khung hình</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="file"
              accept="image/*"
              style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer', zIndex: 5 }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0])
                }
              }}
            />
            <button
              className="secondary-button"
              type="button"
              style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}
            >
              {qrFile ? `Đã chọn: ${qrFile.name.substring(0, 15)}...` : 'Tải lên ảnh QR từ thiết bị'}
            </button>
          </div>

          <button
            className="auth-btn"
            type="button"
            style={{ width: '100%', minHeight: '44px' }}
            onClick={handleSimulateScan}
          >
            Simulate quét QR người nhận (0987654321)
          </button>
        </div>
      </div>
    </Modal>
  )
}
