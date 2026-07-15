import { useState, useEffect } from 'react'
import Modal from '../layout/Modal.jsx'
import FormInput from '../ui/FormInput.jsx'
import OtpVerification from '../../features/security/components/modals/OtpVerification.jsx'
import transactionApi from '../../features/transaction/api/transactionApi.js'

const parseNumberFromCommas = (val) => val ? parseFloat(String(val).replace(/,/g, '')) || 0 : 0
const formatNumberWithCommas = (val) => val ? parseInt(String(val).replace(/\D/g, ''), 10).toLocaleString('en-US') : ''

export default function TopupModal({ isOpen, onClose, onSuccess, userProfile, linkedBanks = [] }) {
    const [topupStep, setTopupStep] = useState(1)
    const [modalAmount, setModalAmount] = useState('')
    const [topupPin, setTopupPin] = useState('')
    const [topupOtp, setTopupOtp] = useState('')
    const [topupError, setTopupError] = useState('')
    const [isTopupLoading, setIsTopupLoading] = useState(false)
    const [topupCountdown, setTopupCountdown] = useState(0)

    // Quản lý countdown độc lập bên trong modal
    useEffect(() => {
        if (topupCountdown > 0) {
            const timer = setTimeout(() => setTopupCountdown(topupCountdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [topupCountdown])

    const handleClose = () => {
        setTopupStep(1); setModalAmount(''); setTopupPin(''); setTopupOtp(''); setTopupError(''); setTopupCountdown(0);
        onClose()
    }

    const handleTopupAmountSubmit = (e) => {
        e.preventDefault()
        const amountVal = parseNumberFromCommas(modalAmount)
        if (amountVal < 1000) {
            setTopupError('Số tiền nạp tối thiểu là 1.000đ')
            return
        }
        setTopupError('')
        setTopupStep(2)
    }

    // Bước 1 Backend: Xác thực PIN -> Gửi OTP
    const handleVerifyTopupPin = async (e) => {
        e.preventDefault()
        setTopupError('')
        if (!topupPin || topupPin.length !== 6) {
            return setTopupError('Mã PIN phải gồm 6 chữ số.')
        }

        try {
            setIsTopupLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)

            await transactionApi.initiateDeposit({
                bankId: linkedBanks[0]?.id || 1,
                amount: amountVal,
                pin: topupPin
            })

            setTopupStep(3)
            setTopupCountdown(60)
            setTopupOtp('')
        } catch (err) {
            setTopupError(err.response?.data?.message || 'Khởi tạo nạp tiền thất bại')
        } finally {
            setIsTopupLoading(false)
        }
    }

    // Bước 2 Backend: Xác thực OTP -> Hoàn tất giao dịch
    const handleVerifyTopupOtp = async (e) => {
        e.preventDefault()
        setTopupError('')
        if (!topupOtp || topupOtp.length !== 6) {
            return setTopupError('Mã OTP phải gồm 6 chữ số.')
        }

        try {
            setIsTopupLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)

            await transactionApi.confirmDeposit({
                bankId: linkedBanks[0]?.id || 1,
                amount: amountVal,
                pin: topupPin
            }, topupOtp)

            onSuccess(`Nạp thành công ${amountVal.toLocaleString()}đ vào ví`)
            handleClose()
        } catch (err) {
            setTopupError(
                err.response?.data?.message || "OTP không chính xác"
            );
        } finally {
            setIsTopupLoading(false)
        }
    }

    const handleResendTopupOtp = async () => {
        setTopupError('')
        try {
            await transactionApi.initiateDeposit({
                bankId: linkedBanks[0]?.id || 1,
                amount: parseNumberFromCommas(modalAmount),
                pin: topupPin
            })
            setTopupCountdown(60)
            setTopupOtp('')
        } catch (err) {
            setTopupError('Không thể gửi lại mã OTP lúc này.')
        }
    }

    const displayAmount = parseNumberFromCommas(modalAmount).toLocaleString()

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nạp tiền vào ví VT Pay">
            {topupStep === 1 && (
                <form onSubmit={handleTopupAmountSubmit}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                        Nạp ví từ tài khoản ngân hàng Vietcombank đã liên kết (Số tài khoản: 1009*****686).
                    </p>

                    {topupError && <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{topupError}</div>}

                    <FormInput
                        label="Số tiền nạp (đ)" id="topAmt" type="text" placeholder="Ví dụ: 100,000"
                        value={modalAmount} onChange={(e) => setModalAmount(formatNumberWithCommas(e.target.value))}
                        style={{ marginBottom: '20px' }} required
                    />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={handleClose}>Hủy bỏ</button>
                        <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Tiếp tục</button>
                    </div>
                </form>
            )}

            {topupStep === 2 && (
                <form onSubmit={handleVerifyTopupPin}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                        Để xác nhận nạp số tiền <strong>{displayAmount}đ</strong> từ ngân hàng liên kết vào ví VT Pay, vui lòng nhập mã PIN giao dịch của bạn.
                    </p>

                    {topupError && <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{topupError}</div>}

                    <FormInput
                        label="Mã PIN giao dịch (6 số)" id="topupPin" type="password" placeholder="Nhập mã PIN giao dịch"
                        value={topupPin} onChange={(e) => setTopupPin(e.target.value.replace(/\D/g, ''))}
                        inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }} maxLength="6" required disabled={isTopupLoading}
                    />

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setTopupStep(1)} disabled={isTopupLoading}>Quay lại</button>
                        <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }} disabled={isTopupLoading}>Xác nhận</button>
                    </div>
                </form>
            )}

            {topupStep === 3 && (
                <OtpVerification
                    phone={userProfile?.phone} amount={displayAmount} action="nạp" otp={topupOtp} setOtp={setTopupOtp}
                    loading={isTopupLoading} countdown={topupCountdown} onSubmit={handleVerifyTopupOtp} onResend={handleResendTopupOtp}
                    onCancel={handleClose} error={topupError} confirmText="Xác nhận nạp"
                />
            )}
        </Modal>
    )
}