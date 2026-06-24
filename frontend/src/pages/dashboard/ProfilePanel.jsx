import { ShieldCheck, Lock, Copy, PencilSimple, X, SignOut, DeviceMobile, Laptop } from '@phosphor-icons/react'

function ProfilePanel({
  userProfile,
  wallet,
  isLive,
  isEditMode,
  setIsEditMode,
  editProfile,
  setEditProfile,
  handleCancelProfileEdit,
  handleSaveProfile,
  securityToggles,
  setSecurityToggles,
  handleLogout,
  devices,
  removeDevice,
  loginHistory,
  setModalType
}) {
  return (
    <div className="tab-panel">
      <div className="profile-container-grid">
        <div className="profile-header-cover">
          <div className="profile-header-details">
            <div className="profile-header-avatar">
              {userProfile.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-header-info">
              <h2>{userProfile.fullName}</h2>
              <div className="profile-badge-row">
                <span className="badge-kyc-tier">
                  <ShieldCheck size={14} weight="bold" /> Đã xác thực danh tính - Cấp 2
                </span>
                <span className="badge-vip-tier">
                  Thành viên {userProfile.vipLevel === 'Gold' ? 'Vàng' : userProfile.vipLevel}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-wallet-copy-box">
            <span>Số tài khoản ví VT Pay</span>
            <div className="copy-row-action">
              <strong>{wallet.walletId}</strong>
              <button
                type="button"
                className="copy-icon-btn"
                onClick={() => {
                  navigator.clipboard.writeText(wallet.walletId.toString())
                }}
                title="Copy số ví"
              >
                <Copy size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Thông tin tài khoản ví</h3>
            {!isEditMode ? (
              <button 
                type="button"
                className="secondary-button"
                style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem', gap: '6px', fontWeight: 700 }}
                onClick={() => setIsEditMode(true)}
              >
                <PencilSimple size={14} /> Chỉnh sửa
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button"
                  className="secondary-button"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem', gap: '4px', fontWeight: 700 }}
                  onClick={handleCancelProfileEdit}
                >
                  <X size={14} /> Hủy
                </button>
                <button 
                  type="button"
                  className="auth-btn"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem', minWidth: 'auto', fontWeight: 700 }}
                  onClick={handleSaveProfile}
                >
                  Lưu
                </button>
              </div>
            )}
          </div>

          <form className="auth-form" style={{ gap: '20px' }} onSubmit={handleSaveProfile}>
            <div className="profile-info-grid">
              <div className="profile-field">
                <label>Họ và tên (Chính chủ)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--ink)' }}>{userProfile.fullName}</span>
                  <Lock size={14} style={{ color: 'var(--muted)', opacity: 0.6 }} title="Thông tin đã KYC không thể chỉnh sửa" />
                </div>
              </div>
              <div className="profile-field">
                <label>Số điện thoại ví</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--ink)' }}>{userProfile.phone}</span>
                  <Lock size={14} style={{ color: 'var(--muted)', opacity: 0.6 }} title="Thông tin đã KYC không thể chỉnh sửa" />
                </div>
              </div>
              <div className="profile-field">
                <label>Số CCCD / Hộ chiếu</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--ink)' }}>{userProfile.citizenId.substring(0, 4)}********</span>
                  <Lock size={14} style={{ color: 'var(--muted)', opacity: 0.6 }} title="Thông tin đã KYC không thể chỉnh sửa" />
                </div>
              </div>
              <div className="profile-field">
                <label>Địa chỉ Email</label>
                {isEditMode ? (
                  <input
                    type="email"
                    className="profile-field-edit-input"
                    value={editProfile.email}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                  />
                ) : (
                  <span style={{ marginTop: '6px' }}>{userProfile.email}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Ngày sinh</label>
                {isEditMode ? (
                  <input
                    type="date"
                    className="profile-field-edit-input"
                    value={editProfile.dob}
                    onChange={(e) => setEditProfile({ ...editProfile, dob: e.target.value })}
                  />
                ) : (
                  <span style={{ marginTop: '6px' }}>{userProfile.dob}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Giới tính</label>
                {isEditMode ? (
                  <select
                    className="profile-field-edit-input profile-field-select"
                    value={editProfile.gender}
                    onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span style={{ marginTop: '6px' }}>{userProfile.gender}</span>
                )}
              </div>
              <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                <label>Địa chỉ thường trú</label>
                {isEditMode ? (
                  <input
                    type="text"
                    className="profile-field-edit-input"
                    value={editProfile.address}
                    onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                  />
                ) : (
                  <span style={{ marginTop: '6px' }}>{userProfile.address}</span>
                )}
              </div>
              <div className="profile-field" style={{ gridColumn: '1 / -1', borderBottom: 'none', paddingBottom: 0 }}>
                <label>Trạng thái tài khoản</label>
                <div className="status-pill active" style={{ marginTop: '6px' }}>ĐANG HOẠT ĐỘNG</div>
              </div>
            </div>
          </form>

          <button type="button" className="btn-logout-profile" onClick={handleLogout}>
            <SignOut size={18} /> Đăng xuất tài khoản ví
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="security-action-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Xác thực bảo mật</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0 0 20px', lineHeight: 1.4 }}>
              Quản lý các lớp bảo mật và phương thức xác thực khi nạp, chuyển, rút tiền.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="profile-switch-row">
                <div className="switch-label-group">
                  <strong>Xác thực vân tay / Face ID</strong>
                  <span>Đăng nhập nhanh và thanh toán sinh trắc học</span>
                </div>
                <label className="ios-switch">
                  <input
                    type="checkbox"
                    checked={securityToggles.biometrics}
                    onChange={(e) => setSecurityToggles({ ...securityToggles, biometrics: e.target.checked })}
                  />
                  <span className="ios-slider" />
                </label>
              </div>
              <div className="profile-switch-row">
                <div className="switch-label-group">
                  <strong>Bảo vệ OTP qua SMS</strong>
                  <span>Xác thực OTP khi liên kết ngân hàng & unlinking</span>
                </div>
                <label className="ios-switch">
                  <input
                    type="checkbox"
                    checked={securityToggles.smsOtp}
                    onChange={(e) => setSecurityToggles({ ...securityToggles, smsOtp: e.target.checked })}
                  />
                  <span className="ios-slider" />
                </label>
              </div>
              <div className="profile-switch-row">
                <div className="switch-label-group">
                  <strong>Thông báo giao dịch Email</strong>
                  <span>Nhận email sao kê sau mỗi giao dịch</span>
                </div>
                <label className="ios-switch">
                  <input
                    type="checkbox"
                    checked={securityToggles.emailOtp}
                    onChange={(e) => setSecurityToggles({ ...securityToggles, emailOtp: e.target.checked })}
                  />
                  <span className="ios-slider" />
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" className="secondary-button" style={{ flex: 1, minHeight: '44px', fontSize: '0.85rem', fontWeight: 700 }} onClick={() => setModalType('password')}>
                Đổi mật khẩu
              </button>
              <button type="button" className="secondary-button" style={{ flex: 1, minHeight: '44px', fontSize: '0.85rem', fontWeight: 700 }} onClick={() => setModalType('pin')}>
                Đổi mã PIN
              </button>
            </div>
          </div>

          <div className="security-action-card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Thiết bị đăng nhập</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: '0 0 20px', lineHeight: 1.4 }}>
              Quản lý và thu hồi các thiết bị đang đăng nhập tài khoản ví của bạn.
            </p>
            <div className="device-list">
              {devices.map(dev => (
                <div className="device-item" key={dev.id}>
                  <div className="device-info-wrapper">
                    <div className="device-icon">
                      {dev.type === 'desktop' ? <Laptop size={20} /> : <DeviceMobile size={20} />}
                    </div>
                    <div className="device-detail">
                      <strong style={{ fontSize: '0.85rem' }}>{dev.name}</strong>
                      <span>{dev.lastLogin}</span>
                    </div>
                  </div>
                  {dev.id !== 1 && (
                    <button className="device-remove-btn" onClick={() => removeDevice(dev.id, dev.name)}>
                      Thu hồi
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="security-action-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 700 }}>Lịch sử đăng nhập tài khoản</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 20px' }}>
              Danh sách chi tiết 3 lần đăng nhập gần nhất vào hệ thống ví VT Pay.
            </p>
            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Địa chỉ IP truy cập</th>
                    <th>Tên thiết bị đăng nhập</th>
                    <th>Thời gian kết nối</th>
                    <th>Trạng thái đăng nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((hist, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{hist.ip}</td>
                      <td>{hist.device}</td>
                      <td style={{ color: 'var(--muted)' }}>{hist.time}</td>
                      <td><span className="status-badge success">{hist.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePanel
