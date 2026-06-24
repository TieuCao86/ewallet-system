import Modal from '../Modal'
import FormInput from '../FormInput'

export default function PinModal({
  isOpen,
  onClose,
  modalPin,
  setModalPin,
  handlePinChangeSubmit
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mã PIN giao dịch ví">
      <form onSubmit={handlePinChangeSubmit}>
        <div className="auth-form" style={{ gap: '16px', marginBottom: '24px' }}>
          <FormInput
            label="Mã PIN giao dịch cũ"
            id="oldPin"
            type="password"
            placeholder="Nhập mã PIN cũ (6 số)"
            value={modalPin.old}
            onChange={(e) => setModalPin({ ...modalPin, old: e.target.value })}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
          />

          <FormInput
            label="Mã PIN mới"
            id="newPin"
            type="password"
            placeholder="Thiết lập 6 số PIN mới"
            value={modalPin.new}
            onChange={(e) => setModalPin({ ...modalPin, new: e.target.value })}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
          />

          <FormInput
            label="Xác nhận mã PIN mới"
            id="confirmPin"
            type="password"
            placeholder="Xác nhận lại 6 số PIN mới"
            value={modalPin.confirm}
            onChange={(e) => setModalPin({ ...modalPin, confirm: e.target.value })}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={onClose}>Hủy bỏ</button>
          <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Cập nhật PIN</button>
        </div>
      </form>
    </Modal>
  )
}
