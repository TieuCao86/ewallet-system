import { Warning } from '@phosphor-icons/react'
import Modal from '../Modal'
import FormInput from '../FormInput'

export default function WithdrawModal({
  isOpen,
  withdrawStep,
  withdrawError,
  modalAmount,
  setModalAmount,
  handleWithdrawAmountSubmit,
  handleVerifyWithdrawPin,
  handleVerifyWithdrawOtp,
  withdrawPin,
  setWithdrawPin,
  withdrawOtp,
  setWithdrawOtp,
  isWithdrawLoading,
  withdrawCountdown,
  handleResendWithdrawOtp,
  wallet,
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
      title="Rút tiền về tài khoản ngân hàng"
    >
      {withdrawStep === 1 && (
        <form onSubmit={handleWithdrawAmountSubmit}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Chuyển tiền từ tài khoản ví VT Pay về ngân hàng liên kết. Số dư khả dụng hiện tại: <strong style={{ color: 'var(--accent)' }}>{wallet.balance.toLocaleString()}đ</strong>.
          </p>

          {withdrawError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {withdrawError}
            </div>
          )}

          <FormInput
            label="Số tiền rút (đ)"
            id="withAmt"
            type="text"
            placeholder="Ví dụ: 50,000"
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

      {withdrawStep === 2 && (
        <form onSubmit={handleVerifyWithdrawPin}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Để xác nhận rút số tiền <strong>{displayAmount}đ</strong> về tài khoản ngân hàng liên kết, vui lòng nhập mã PIN giao dịch của bạn.
          </p>

          {withdrawError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {withdrawError}
            </div>
          )}

          <FormInput
            label="Mã PIN giao dịch (6 số)"
            id="withdrawPin"
            type="password"
            placeholder="Nhập mã PIN giao dịch"
            value={withdrawPin}
            onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
            disabled={isWithdrawLoading}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="secondary-button"
              type="button"
              style={{ flex: 1, minHeight: '46px' }}
              onClick={onBack}
              disabled={isWithdrawLoading}
            >
              Quay lại
            </button>
            <button
              className="auth-btn"
              type="submit"
              style={{ flex: 1, minHeight: '46px' }}
              disabled={isWithdrawLoading}
            >
              Xác nhận
            </button>
          </div>
        </form>
      )}

      {/*{withdrawStep === 3 && (*/}
      {/*  <form onSubmit={handleVerifyWithdrawOtp}>*/}
      {/*    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>*/}
      {/*      Để đảm bảo an toàn cho tài khoản ví, vui lòng xác nhận mã OTP gửi qua SMS tới số điện thoại <strong>{userProfile.phone}</strong> để hoàn tất rút <strong>{displayAmount}đ</strong> về ngân hàng.*/}
      {/*    </p>*/}

      {/*    {withdrawError && (*/}
      {/*      <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>*/}
      {/*        <Warning size={16} /> {withdrawError}*/}
      {/*      </div>*/}
      {/*    )}*/}

      {/*    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>*/}
      {/*      <div style={{ flex: 1 }}>*/}
      {/*        <FormInput*/}
      {/*          label="Mã xác thực OTP (6 chữ số)"*/}
      {/*          id="withdrawOtp"*/}
      {/*          type="password"*/}
      {/*          placeholder="Nhập mã OTP 6 số"*/}
      {/*          value={withdrawOtp}*/}
      {/*          onChange={(e) => setWithdrawOtp(e.target.value.replace(/\D/g, ''))}*/}
      {/*          inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}*/}
      {/*          maxLength="6"*/}
      {/*          required*/}
      {/*          disabled={isWithdrawLoading}*/}
      {/*          style={{ marginBottom: 0 }}*/}
      {/*        />*/}
      {/*      </div>*/}
      {/*      <button*/}
      {/*        type="button"*/}
      {/*        onClick={handleResendWithdrawOtp}*/}
      {/*        disabled={withdrawCountdown > 0 || isWithdrawLoading}*/}
      {/*        className="secondary-button"*/}
      {/*        style={{*/}
      {/*          height: '48px',*/}
      {/*          whiteSpace: 'nowrap',*/}
      {/*          padding: '0 16px',*/}
      {/*          fontSize: '0.88rem',*/}
      {/*          fontWeight: 700,*/}
      {/*          borderRadius: '14px',*/}
      {/*          display: 'flex',*/}
      {/*          alignItems: 'center',*/}
      {/*          justifyContent: 'center',*/}
      {/*          minWidth: '120px'*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        {withdrawCountdown > 0 ? `Gửi lại (${withdrawCountdown}s)` : 'Gửi mã'}*/}
      {/*      </button>*/}
      {/*    </div>*/}

      {/*    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>*/}
      {/*      <button*/}
      {/*        className="secondary-button"*/}
      {/*        type="button"*/}
      {/*        style={{ flex: 1, minHeight: '46px' }}*/}
      {/*        onClick={onReset}*/}
      {/*        disabled={isWithdrawLoading}*/}
      {/*      >*/}
      {/*        Hủy bỏ*/}
      {/*      </button>*/}
      {/*      <button*/}
      {/*        className="auth-btn"*/}
      {/*        type="submit"*/}
      {/*        style={{ flex: 1, minHeight: '46px' }}*/}
      {/*        disabled={isWithdrawLoading}*/}
      {/*      >*/}
      {/*        {isWithdrawLoading ? <div className="btn-spinner" /> : 'Xác nhận rút'}*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  </form>*/}
      {/*)}*/}
    </Modal>
  )
}
