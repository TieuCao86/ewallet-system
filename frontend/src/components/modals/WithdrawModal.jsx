import { useState, useEffect } from 'react'
import Modal from '../Modal'
import FormInput from '../FormInput'
import OtpVerification from '../OtpVerification'
import transactionApi from '../../api/transactionApi'

const parseNumberFromCommas = (val) => val ? parseFloat(String(val).replace(/,/g, '')) || 0 : 0
const formatNumberWithCommas = (val) => val ? parseInt(String(val).replace(/\D/g, ''), 10).toLocaleString('en-US') : ''

export default function WithdrawModal({ isOpen, onClose, onSuccess, wallet, userProfile, linkedBanks = [] }) {
    // --- BỐC TÁCH STATE TỪ DASHBOARD VÀO ĐÂY ---
    const [withdrawStep, setWithdrawStep] = useState(1)
    const [modalAmount, setModalAmount] = useState('')
    const [withdrawPin, setWithdrawPin] = useState('')
    const [withdrawOtp, setWithdrawOtp] = useState('')
    const [withdrawError, setWithdrawError] = useState('')
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
    const [withdrawCountdown, setWithdrawCountdown] = useState(0)

    // Quản lý countdown độc lập bên trong modal
    useEffect(() => {
        if (withdrawCountdown > 0) {
            const timer = setTimeout(() => setWithdrawCountdown(withdrawCountdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [withdrawCountdown])

    const handleClose = () => {
        setWithdrawStep(1); setModalAmount(''); setWithdrawPin(''); setWithdrawOtp(''); setWithdrawError(''); setWithdrawCountdown(0);
        onClose()
    }

    const handleWithdrawAmountSubmit = (e) => {
        e.preventDefault()
        const amountVal = parseNumberFromCommas(modalAmount)
        if (amountVal <= 0) return setWithdrawError('Vui lòng nhập số tiền hợp lệ.')
        if (amountVal > (wallet?.balance || 0)) return setWithdrawError('Số dư khả dụng không đủ.')
        setWithdrawError('')
        setWithdrawStep(2)
    }

    // Bước 1 Backend: Xác thực PIN -> Gửi OTP
    const handleVerifyWithdrawPin = async (e) => {
        e.preventDefault()
        setWithdrawError('')
        if (!withdrawPin || withdrawPin.length !== 6 || isNaN(withdrawPin)) {
            return setWithdrawError('Mã PIN giao dịch phải gồm 6 chữ số.')
        }

        try {
            setIsWithdrawLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)

            await transactionApi.initiateWithdraw({
                bankId: linkedBanks[0]?.id || 1,
                amount: amountVal,
                pin: withdrawPin
            })

            setWithdrawStep(3)
            setWithdrawCountdown(60)
            setWithdrawOtp('')
        } catch (err) {
            setWithdrawError(err.response?.data?.message || 'Khởi tạo rút tiền thất bại')
        } finally {
            setIsWithdrawLoading(false)
        }
    }

    // Bước 2 Backend: Xác thực OTP -> Hoàn tất giao dịch
    const handleVerifyWithdrawOtp = async (e) => {
        e.preventDefault()
        setWithdrawError('')
        if (!withdrawOtp || withdrawOtp.length !== 6) {
            return setWithdrawError('Mã OTP phải gồm 6 chữ số.')
        }

        try {
            setIsWithdrawLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)

            await transactionApi.confirmWithdraw({
                bankId: linkedBanks[0]?.id || 1,
                amount: amountVal,
                pin: withdrawPin
            }, withdrawOtp)

            onSuccess(`Rút thành công ${amountVal.toLocaleString()}đ về ngân hàng`)
            handleClose()
        } catch (err) {
            setWithdrawError(err.response?.data?.message || 'Mã OTP không chính xác')
        } finally {
            setIsWithdrawLoading(false)
        }
    }

    const handleResendWithdrawOtp = async () => {
        setWithdrawError('')
        try {
            await transactionApi.initiateWithdraw({
                bankId: linkedBanks[0]?.id || 1,
                amount: parseNumberFromCommas(modalAmount),
                pin: withdrawPin
            })
            setWithdrawCountdown(60)
            setWithdrawOtp('')
        } catch (err) {
            setWithdrawError('Không thể gửi lại mã OTP lúc này.')
        }
    }

    const displayAmount = parseNumberFromCommas(modalAmount).toLocaleString()

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Rút tiền về tài khoản ngân hàng">
            {withdrawStep === 1 && (
                <form onSubmit={handleWithdrawAmountSubmit}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                        Chuyển tiền từ tài khoản ví VT Pay về ngân hàng liên kết. Số dư khả dụng hiện tại: <strong style={{ color: 'var(--accent)' }}>{wallet?.balance?.toLocaleString()}đ</strong>.
                    </p>

                    {withdrawError && <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{withdrawError}</div>}

                    <FormInput
                        label="Số tiền rút (đ)" id="withAmt" type="text" placeholder="Ví dụ: 50,000"
                        value={modalAmount} onChange={(e) => setModalAmount(formatNumberWithCommas(e.target.value))}
                        style={{ marginBottom: '20px' }} required
                    />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={handleClose}>Hủy bỏ</button>
                        <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Tiếp tục</button>
                    </div>
                </form>
            )}

            {withdrawStep === 2 && (
                <form onSubmit={handleVerifyWithdrawPin}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
                        Để xác nhận rút số tiền <strong>{displayAmount}đ</strong> về tài khoản ngân hàng liên kết, vui lòng nhập mã PIN giao dịch của bạn.
                    </p>

                    {withdrawError && <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{withdrawError}</div>}

                    <FormInput
                        label="Mã PIN giao dịch (6 số)" id="withdrawPin" type="password" placeholder="Nhập mã PIN giao dịch"
                        value={withdrawPin} onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                        inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }} maxLength="6" required disabled={isWithdrawLoading}
                    />

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setWithdrawStep(1)} disabled={isWithdrawLoading}>Quay lại</button>
                        <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }} disabled={isWithdrawLoading}>Xác nhận</button>
                    </div>
                </form>
            )}

            {withdrawStep === 3 && (
                <OtpVerification
                    phone={userProfile?.phone} amount={displayAmount} action="rút" otp={withdrawOtp} setOtp={setWithdrawOtp}
                    loading={isWithdrawLoading} countdown={withdrawCountdown} onSubmit={handleVerifyWithdrawOtp} onResend={handleResendWithdrawOtp}
                    onCancel={handleClose} error={withdrawError} confirmText="Xác nhận rút"
                />
            )}
        </Modal>
    )
}