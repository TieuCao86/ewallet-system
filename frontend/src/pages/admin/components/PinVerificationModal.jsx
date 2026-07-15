import React from 'react'
import { Warning } from '@phosphor-icons/react'
import Modal from '../../../components/layout/Modal.jsx'
import FormInput from '../../../components/ui/FormInput.jsx'

export default function PinVerificationModal({
  isOpen,
  onClose,
  enteredPin,
  setEnteredPin,
  pinVerifyError,
  onSubmit
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác thực bảo mật QTV"
    >
      <form onSubmit={onSubmit}>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
          Vui lòng nhập mã PIN bảo mật 6 số của Quản trị viên để xác nhận và hoàn tất thao tác này.
        </p>

        {pinVerifyError && (
          <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Warning size={16} /> {pinVerifyError}
          </div>
        )}

        <FormInput
          label="Mã PIN xác thực QTV"
          id="adminVerifyPin"
          type="password"
          placeholder="Nhập mã PIN 6 số"
          value={enteredPin}
          onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
          inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
          maxLength="6"
          required
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            className="secondary-button"
            type="button"
            style={{ flex: 1, minHeight: '44px' }}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            className="settings-submit-btn"
            type="submit"
            style={{ flex: 1, minHeight: '44px' }}
          >
            Xác nhận PIN
          </button>
        </div>
      </form>
    </Modal>
  )
}
