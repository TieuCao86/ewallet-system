import { Warning } from '@phosphor-icons/react'
import Modal from '../Modal'
import FormInput from '../FormInput'

export default function UnlinkBankModal({
  isOpen,
  onClose,
  userProfile,
  unlinkBankTarget,
  unlinkError,
  unlinkOtp,
  setUnlinkOtp,
  isUnlinkingLoading,
  handleResendUnlinkOtp,
  handleVerifyUnlinkOtp,
  unlinkCountdown
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Xác nhận hủy liên kết ${unlinkBankTarget ? unlinkBankTarget.bankName : ''}`}>
      <form onSubmit={handleVerifyUnlinkOtp}>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
          Để đảm bảo an toàn cho tài khoản ví, vui lòng xác nhận mã OTP gửi qua SMS tới số điện thoại <strong>{userProfile.phone}</strong> để hủy liên kết tài khoản <strong>{unlinkBankTarget ? `${unlinkBankTarget.bankName} (STK: ...${unlinkBankTarget.accountNumber.slice(-4)})` : ''}</strong>.
        </p>

        {unlinkError && (
          <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            <Warning size={16} /> {unlinkError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <FormInput
              label="Mã xác thực OTP (6 chữ số)"
              id="unlinkOtp"
              type="password"
              placeholder="Nhập mã OTP 6 số"
              value={unlinkOtp}
              onChange={(e) => setUnlinkOtp(e.target.value.replace(/\D/g, ''))}
              inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
              maxLength="6"
              required
              disabled={isUnlinkingLoading}
              style={{ marginBottom: 0 }}
            />
          </div>

          <button
            type="button"
            onClick={handleResendUnlinkOtp}
            disabled={unlinkCountdown > 0 || isUnlinkingLoading}
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
            {unlinkCountdown > 0 ? `Gửi lại (${unlinkCountdown}s)` : 'Gửi mã'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ flex: 1, minHeight: '46px' }}
            onClick={onClose}
            disabled={isUnlinkingLoading}
          >
            Hủy bỏ
          </button>
          <button
            className="auth-btn"
            type="submit"
            style={{ flex: 1, minHeight: '46px', background: '#ef4444' }}
            disabled={isUnlinkingLoading}
          >
            {isUnlinkingLoading ? <div className="btn-spinner" /> : 'Xác nhận hủy'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
