import { Warning } from '@phosphor-icons/react'
import FormInput from '../../components/FormInput'

function BankPanel({
  linkingStep,
  linkingError,
  bankPhone,
  setBankPhone,
  bankAccountNo,
  setBankAccountNo,
  selectedBank,
  setSelectedBank,
  isLinkingLoading,
  handleLinkBankSubmit,
  handleVerifyBankOtp,
  bankOtp,
  setBankOtp,
  handleResendLinkingOtp,
  setLinkingStep,
  linkedBanks,
  handleUnlinkBank,
  userProfile
}) {
  return (
    <div className="tab-panel">
      <div className="transfer-grid">
        <div className="transfer-card">
          {linkingStep === 1 ? (
            <>
              <h3>Liên kết tài khoản mới</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Chọn ngân hàng đối tác và điền thông tin tài khoản cá nhân của bạn để thực hiện liên kết nạp rút.
              </p>

              {linkingError && (
                <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  <Warning size={16} /> {linkingError}
                </div>
              )}

              <form className="auth-form" onSubmit={handleLinkBankSubmit}>
                <div className="input-group">
                  <label className="input-label">Chọn ngân hàng đối tác</label>
                  <div className="bank-selection-grid">
                    {[
                      { code: 'VCB', name: 'Vietcombank', color: '#10b981' },
                      { code: 'TCB', name: 'Techcombank', color: '#ef4444' },
                      { code: 'BIDV', name: 'BIDV', color: '#3b82f6' },
                      { code: 'ACB', name: 'ACB', color: '#0ea5e9' },
                      { code: 'TPB', name: 'TPBank', color: '#a855f7' }
                    ].map(b => (
                      <button
                        key={b.code}
                        type="button"
                        className={`bank-select-btn ${selectedBank === b.code ? 'selected' : ''}`}
                        onClick={() => setSelectedBank(b.code)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 6px',
                          borderRadius: '12px',
                          border: selectedBank === b.code ? `2px solid ${b.color}` : '1.5px solid var(--line)',
                          background: selectedBank === b.code ? `${b.color}15` : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: selectedBank === b.code ? b.color : 'var(--ink)'
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.5px' }}>{b.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="Số tài khoản ngân hàng"
                  id="bankAccountNo"
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ''))}
                  disabled={isLinkingLoading}
                />

                <FormInput
                  label="Họ và tên chủ tài khoản (Không dấu)"
                  id="bankCardHolder"
                  type="text"
                  value={userProfile.fullName.toUpperCase()}
                  disabled={true}
                  style={{ opacity: 0.8 }}
                />

                <FormInput
                  label="Số điện thoại đăng ký ngân hàng"
                  id="bankPhone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={bankPhone}
                  onChange={(e) => setBankPhone(e.target.value)}
                  disabled={isLinkingLoading}
                />

                <button className="auth-btn" type="submit" disabled={isLinkingLoading}>
                  {isLinkingLoading ? <div className="btn-spinner" /> : 'Liên kết ngân hàng'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3>Xác thực liên kết</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Nhập mã xác thực OTP đã được gửi tới số điện thoại <strong>{bankPhone}</strong> để hoàn tất liên kết tài khoản ngân hàng.
              </p>

              {linkingError && (
                <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                  <Warning size={16} /> {linkingError}
                </div>
              )}

              <form className="auth-form" onSubmit={handleVerifyBankOtp}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <FormInput
                      label="Nhập mã xác thực OTP"
                      id="bankOtp"
                      type="password"
                      placeholder="Nhập OTP 6 số"
                      value={bankOtp}
                      onChange={(e) => setBankOtp(e.target.value.replace(/\D/g, ''))}
                      inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                      maxLength="6"
                      disabled={isLinkingLoading}
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResendLinkingOtp}
                    disabled={linkingStep !== 2 || isLinkingLoading}
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
                    Gửi mã
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    className="secondary-button"
                    type="button"
                    style={{ flex: 1, minHeight: '48px', fontWeight: 700 }}
                    onClick={() => setLinkingStep(1)}
                    disabled={isLinkingLoading}
                  >
                    Quay lại
                  </button>
                  <button
                    className="auth-btn"
                    type="submit"
                    style={{ flex: 1, minHeight: '48px' }}
                    disabled={isLinkingLoading}
                  >
                    {isLinkingLoading ? <div className="btn-spinner" /> : 'Xác thực OTP'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="recent-transactions-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>Ngân hàng liên kết của bạn</h3>
            {linkedBanks.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', border: '1.5px dashed var(--line)', borderRadius: '16px' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Bạn chưa liên kết tài khoản ngân hàng nào.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {linkedBanks.map(card => {
                  const gradients = {
                    VCB: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
                    TCB: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                    BIDV: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
                    ACB: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
                    TPB: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                  }
                  const bg = gradients[card.logo] || 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
                  return (
                    <div
                      key={card.id}
                      style={{
                        background: bg,
                        borderRadius: '16px',
                        padding: '20px',
                        color: '#ffffff',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '160px',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, fontSize: '6rem', fontWeight: 900, lineHeight: 1, pointerEvents: 'none' }}>
                        {card.logo}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>{card.bankName}</strong>
                          <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Thẻ nội bộ Debit</span>
                        </div>
                        <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                          ACTIVE
                        </span>
                      </div>

                      <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '2.5px', margin: '20px 0 10px', zIndex: 1 }}>
                        **** **** **** {card.accountNumber.slice(-4)}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', display: 'block', opacity: 0.8, textTransform: 'uppercase', marginBottom: '2px' }}>Chủ thẻ</span>
                          <strong style={{ fontSize: '0.88rem' }}>{card.cardHolder}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnlinkBank(card)}
                          style={{
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Hủy liên kết
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankPanel
