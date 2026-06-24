import { Warning } from '@phosphor-icons/react'
import Modal from '../Modal'
import FormInput from '../FormInput'

export default function TopupModal({
  isOpen,
  topupStep,
  topupError,
  modalAmount,
  setModalAmount,
  handleTopupAmountSubmit,
  handleVerifyTopupPin,
  handleVerifyTopupOtp,
  topupPin,
  setTopupPin,
  topupOtp,
  setTopupOtp,
  isTopupLoading,
  topupCountdown,
  handleResendTopupOtp,
  userProfile,
  parseNumberFromCommas,
  formatNumberWithCommas,
  onBack,
  onClose,
  onReset
}) {
  const displayAmount = parseNumberFromCommas(modalAmount).toLocaleString()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nạp tiền vào ví VT Pay"
    >
      {topupStep === 1 && (
        <form onSubmit={handleTopupAmountSubmit}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Nạp ví từ tài khoản ngân hàng Vietcombank đã liên kết (Số tài khoản: 1009*****686).
          </p>

          {topupError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {topupError}
            </div>
          )}

          <FormInput
            label="Số tiền nạp (đ)"
            id="topAmt"
            type="text"
            placeholder="Ví dụ: 100,000"
            value={modalAmount}
            onChange={(e) => setModalAmount(formatNumberWithCommas(e.target.value))}
            style={{ marginBottom: '20px' }}
            required
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={onClose}>Hủy bỏ</button>
            <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Tiếp tục</button>
          </div>
        </form>
      )}

      {topupStep === 2 && (
        <form onSubmit={handleVerifyTopupPin}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Để xác nhận nạp số tiền <strong>{displayAmount}đ</strong> từ ngân hàng liên kết vào ví VT Pay, vui lòng nhập mã PIN giao dịch của bạn.
          </p>

          {topupError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {topupError}
            </div>
          )}

          <FormInput
            label="Mã PIN giao dịch (6 số)"
            id="topupPin"
            type="password"
            placeholder="Nhập mã PIN giao dịch"
            value={topupPin}
            onChange={(e) => setTopupPin(e.target.value.replace(/\D/g, ''))}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
            disabled={isTopupLoading}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="secondary-button"
              type="button"
              style={{ flex: 1, minHeight: '46px' }}
              onClick={onBack}
              disabled={isTopupLoading}
            >
              Quay lại
            </button>
            <button
              className="auth-btn"
              type="submit"
              style={{ flex: 1, minHeight: '46px' }}
              disabled={isTopupLoading}
            >
              Xác nhận
            </button>
          </div>
        </form>
      )}

      {topupStep === 3 && (
        <form onSubmit={handleVerifyTopupOtp}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Để đảm bảo an toàn cho tài khoản ví, vui lòng xác nhận mã OTP gửi qua SMS tới số điện thoại <strong>{userProfile.phone}</strong> để hoàn tất nạp <strong>{displayAmount}đ</strong> vào ví.
          </p>

          {topupError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              <Warning size={16} /> {topupError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Mã xác thực OTP (6 chữ số)"
                id="topupOtp"
                type="password"
                placeholder="Nhập mã OTP 6 số"
                value={topupOtp}
                onChange={(e) => setTopupOtp(e.target.value.replace(/\D/g, ''))}
                inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                maxLength="6"
                required
                disabled={isTopupLoading}
                style={{ marginBottom: 0 }}
              />
            </div>
            <button
              type="button"
              onClick={handleResendTopupOtp}
              disabled={topupCountdown > 0 || isTopupLoading}
              className="secondary-button"
              style={{
                height: '48px',
                whiteSpace: 'nowrap',
                padding: '0 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '120px'
              }}
            >
              {topupCountdown > 0 ? `Gửi lại (${topupCountdown}s)` : 'Gửi mã'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="secondary-button"
              type="button"
              style={{ flex: 1, minHeight: '46px' }}
              onClick={onReset}
              disabled={isTopupLoading}
            >
              Hủy bỏ
            </button>
            <button
              className="auth-btn"
              type="submit"
              style={{ flex: 1, minHeight: '46px' }}
              disabled={isTopupLoading}
            >
              {isTopupLoading ? <div className="btn-spinner" /> : 'Xác nhận nạp'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
