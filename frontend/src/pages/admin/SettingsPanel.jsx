import React from 'react'
import { Users, Lock, ShieldCheck } from '@phosphor-icons/react'

export default function SettingsPanel({
  adminProfile,
  oldPassword,
  newPassword,
  confirmPassword,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
  handleAdminPasswordChange,
  oldPinChange,
  newPinChange,
  confirmPinChange,
  setOldPinChange,
  setNewPinChange,
  setConfirmPinChange,
  handleAdminPinChange
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
      {/* QTV Personal Profile Card */}
      <div className="settings-container" style={{ maxWidth: '100%' }}>
        <h3 className="settings-section-title">
          <Users size={18} /> Thông tin cá nhân QTV
        </h3>
        <div className="settings-grid">
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" className="settings-input" value={adminProfile.fullName} disabled />
          </div>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input type="text" className="settings-input" value={adminProfile.email} disabled />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" className="settings-input" value={adminProfile.phone} disabled />
          </div>
          <div className="form-group">
            <label>Vai trò hệ thống</label>
            <input type="text" className="settings-input" value={adminProfile.role} disabled />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Change Password form */}
        <div className="settings-container" style={{ maxWidth: '100%', margin: 0 }}>
          <h3 className="settings-section-title">
            <Lock size={18} /> Thay đổi mật khẩu
          </h3>
          <form onSubmit={handleAdminPasswordChange}>
            <div className="settings-grid">
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Từ 6 ký tự trở lên"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="settings-submit-btn">
              Cập nhật mật khẩu
            </button>
          </form>
        </div>

        {/* Change Admin PIN form */}
        <div className="settings-container" style={{ maxWidth: '100%', margin: 0 }}>
          <h3 className="settings-section-title">
            <ShieldCheck size={18} /> Thay đổi mã PIN bảo mật
          </h3>
          <form onSubmit={handleAdminPinChange}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '-8px', marginBottom: '16px' }}>
              Mã PIN bảo mật dùng để xác thực và phê duyệt mọi hoạt động thay đổi thông tin của người dùng.
            </p>
            <div className="settings-grid">
              <div className="form-group">
                <label>Mã PIN bảo mật hiện tại</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Mã PIN 6 số cũ"
                  maxLength="6"
                  value={oldPinChange}
                  onChange={(e) => setOldPinChange(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="form-group">
                <label>Mã PIN bảo mật mới</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Thiết lập 6 số mới"
                  maxLength="6"
                  value={newPinChange}
                  onChange={(e) => setNewPinChange(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mã PIN mới</label>
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Nhập lại 6 số mới"
                  maxLength="6"
                  value={confirmPinChange}
                  onChange={(e) => setConfirmPinChange(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <button type="submit" className="settings-submit-btn">
              Cập nhật mã PIN
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
