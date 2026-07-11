import { Warning } from '@phosphor-icons/react'
import Modal from '../Modal'
import FormInput from '../FormInput'
import OtpVerification from '../OtpVerification.jsx'

export default function TransferConfirmModal({
                                               isOpen,
                                               transferOtpStep,
                                               onClose,
                                               transferPhone,
                                               transferAmount,
                                               transferNote,
                                               transferConfirmError,
                                               transferPin,
                                               setTransferPin,
                                               transferOtp,
                                               setTransferOtp,
                                               isTransferConfirmLoading,
                                               transferCountdown,
                                               onConfirm,
                                               handleVerifyTransferOtp,
                                               handleResendTransferOtp,
                                               parseNumberFromCommas,
                                               userProfile,
                                               onCancel
                                             }) {
  const displayAmount = parseNumberFromCommas(transferAmount || 0).toLocaleString()

  return (
      <Modal isOpen={isOpen} onClose={onClose} title={transferOtpStep ? 'Xác thực OTP chuyển tiền' : 'Xác nhận chuyển tiền'}>
        {!transferOtpStep ? (
            <form onSubmit={onConfirm}>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                Vui lòng kiểm tra kỹ thông tin giao dịch và nhập mã PIN của bạn để tiếp tục.
              </p>

              <div className="recent-transactions-card" style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', marginBottom: '20px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Tài khoản nhận:</span>
                  <strong style={{ color: 'var(--ink)' }}>{transferPhone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Số tiền chuyển:</span>
                  <strong style={{ color: 'var(--ink)', fontSize: '1rem' }}>{displayAmount}đ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--muted)' }}>Phí chuyển tiền:</span>
                  <strong style={{ color: '#22c55e' }}>Miễn phí (0đ)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Nội dung chuyển:</span>
                  <span style={{ color: 'var(--ink)', maxWidth: '60%', textAlign: 'right', overflowWrap: 'break-word', fontWeight: 500 }}>{transferNote || 'Chuyen tien'}</span>
                </div>
              </div>

              {transferConfirmError && (
                  <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                    <Warning size={16} /> {transferConfirmError}
                  </div>
              )}

              <FormInput
                  label="Nhập mã PIN giao dịch (6 chữ số)"
                  id="transferPin"
                  type="password"
                  placeholder="Nhập mã PIN gồm 6 số"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                  inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                  maxLength="6"
                  required
                  disabled={isTransferConfirmLoading}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                    className="secondary-button"
                    type="button"
                    style={{ flex: 1, minHeight: '46px' }}
                    onClick={onCancel}
                    disabled={isTransferConfirmLoading}
                >
                  Hủy bỏ
                </button>
                <button
                    className="auth-btn"
                    type="submit"
                    style={{ flex: 1, minHeight: '46px' }}
                    disabled={isTransferConfirmLoading}
                >
                  Xác nhận
                </button>
              </div>
            </form>
        ) : (
            <OtpVerification
                phone={userProfile?.phone}
                amount={displayAmount}
                receiver={transferPhone}
                action="chuyển"
                otp={transferOtp}
                setOtp={setTransferOtp}
                loading={isTransferConfirmLoading}
                countdown={transferCountdown}
                onSubmit={handleVerifyTransferOtp}
                onResend={handleResendTransferOtp}
                onCancel={onCancel}
                error={transferConfirmError}
                confirmText="Xác nhận chuyển"
            />
        )}
      </Modal>
  )
}