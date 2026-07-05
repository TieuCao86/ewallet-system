import { Warning } from '@phosphor-icons/react'
import FormInput from '../../components/FormInput'
import './BankPanel.css'

function BankPanel({
  linkingStep,
  linkingError,
  bankPhone,
  banks,
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
                    {banks.map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            className={`bank-select-btn ${
                                selectedBank?.id === b.id ? "active" : ""
                            }`}
                            onClick={() => setSelectedBank(b)}
                        >
                          <div className="bank-logo">
                            {b.logo ? (
                                <img
                                    src={`/logos/${b.logo}`}
                                    alt={b.name}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                />
                            ) : null}

                            <div
                                className="bank-logo-fallback"
                                style={{ display: b.logo ? "none" : "flex" }}
                            >
                              {b.code}
                            </div>
                          </div>

                          <span className="bank-name">{b.name}</span>
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

            {!linkedBanks || linkedBanks.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', border: '1.5px dashed var(--line)', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {linkedBanks.map(card => {
                    // 1. Ánh xạ tự động từ bankName thật sang mã ngắn và màu sắc gradient tương ứng
                    const nameLower = String(card.bankName || '').toLowerCase();
                    let shortCode = 'BANK';
                    let bg = 'linear-gradient(135deg, #64748b 0%, #334155 100%)'; // Màu xám mặc định

                    if (nameLower.includes('vietcombank')) {
                      bg = 'linear-gradient(135deg, #059669 0%, #064e3b 100%)';
                      shortCode = 'VCB';
                    } else if (nameLower.includes('techcombank')) {
                      bg = 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)';
                      shortCode = 'TCB';
                    } else if (nameLower.includes('bidv')) {
                      bg = 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)';
                      shortCode = 'BIDV';
                    } else if (nameLower.includes('acb')) {
                      bg = 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)';
                      shortCode = 'ACB';
                    } else if (nameLower.includes('mb')) {
                      bg = 'linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)';
                      shortCode = 'MB';
                    }

                    return (
                        <div
                            key={card.id} // ID số (1, 2, 3...) trả về từ DB
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
                          {/* Mã chữ chìm ở background phía sau */}
                          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, fontSize: '6rem', fontWeight: 900, lineHeight: 1, pointerEvents: 'none' }}>
                            {shortCode}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {/* Đổ dữ liệu động card.bankName ("Vietcombank") */}
                              <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>{card.bankName}</strong>
                              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Thẻ nội bộ Debit</span>
                            </div>
                            <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                  ACTIVE
                </span>
                          </div>

                          {/* Định dạng che bớt số tài khoản, chỉ hiện 4 số cuối ("9012") */}
                          <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '2.5px', margin: '20px 0 10px', zIndex: 1 }}>
                            **** **** **** {String(card.accountNumber || '').slice(-4)}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                            <div>
                              <span style={{ fontSize: '0.68rem', display: 'block', opacity: 0.8, textTransform: 'uppercase', marginBottom: '2px' }}>Chủ thẻ</span>
                              <strong style={{ fontSize: '0.88rem' }}>{card.accountHolder}</strong>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleUnlinkBank(card)} // Truyền nguyên object card để xử lý hàm DELETE nâng cao
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
