import Modal from '../Modal'
import FormInput from '../FormInput'

export default function PasswordModal({
  isOpen,
  onClose,
  modalPassword,
  setModalPassword,
  handlePasswordChangeSubmit
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu tài khoản ví">
      <form onSubmit={handlePasswordChangeSubmit}>
        <div className="auth-form" style={{ gap: '16px', marginBottom: '24px' }}>
          <FormInput
            label="Mật khẩu hiện tại"
            id="oldPassword"
            type="password"
            placeholder="Mật khẩu cũ"
            value={modalPassword.old}
            onChange={(e) => setModalPassword({ ...modalPassword, old: e.target.value })}
            required
          />

          <FormInput
            label="Mật khẩu mới"
            id="newPassword"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={modalPassword.new}
            onChange={(e) => setModalPassword({ ...modalPassword, new: e.target.value })}
            required
          />

          <FormInput
            label="Xác nhận mật khẩu mới"
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={modalPassword.confirm}
            onChange={(e) => setModalPassword({ ...modalPassword, confirm: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={onClose}>Hủy bỏ</button>
          <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Cập nhật</button>
        </div>
      </form>
    </Modal>
  )
}
