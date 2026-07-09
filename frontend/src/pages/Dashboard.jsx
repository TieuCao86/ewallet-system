import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Gear } from '@phosphor-icons/react'

// Custom Hooks
import useFetchWalletData from '../hooks/useFetchWalletData'
import useCountdown from '../hooks/useCountdown'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import useTransactionFilter from "../hooks/useTransactionFilter"
import useExportCSV from "../hooks/useExportCSV"

// Components & Panels
import Sidebar from '../components/Sidebar'
import ToastAlert from '../components/ToastAlert'
import OverviewPanel from './dashboard/OverviewPanel'
import TransactionsPanel from './dashboard/TransactionsPanel'
import MyQRPanel from './dashboard/MyQRPanel'
import HistoryPanel from './dashboard/HistoryPanel'
import BankPanel from './dashboard/BankPanel'
import KycPanel from './dashboard/KycPanel'
import ProfilePanel from './dashboard/ProfilePanel'
import {
    TopupModal,
    WithdrawModal,
    PasswordModal,
    PinModal,
    UnlinkBankModal,
    TransferConfirmModal,
    QrScannerModal,
    TransactionSuccessModal
} from '../components/modals'
import './Dashboard.css'

const generateRandomId = (prefix = 'TX') => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
const parseNumberFromCommas = (val) => val ? parseFloat(String(val).replace(/,/g, '')) || 0 : 0
const formatNumberWithCommas = (val) => val ? parseInt(String(val).replace(/\D/g, ''), 10).toLocaleString('en-US') : ''

function Dashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)

    // Sử dụng Hook tối ưu mới
    const {
        userProfile,
        setUserProfile,
        wallet,
        setWallet,
        transactions,
        setTransactions,
        loading,
        isLive,
        refresh,
        loadAllTransactions
    } = useFetchWalletData()

    useKeyboardShortcuts(setActiveTab)

    // Quản lý toàn bộ Countdown đếm ngược OTP độc lập
    const [linkingCountdown, startLinkingCountdown] = useCountdown(0, 'linkingOtpExpiryTime')
    const [unlinkCountdown, startUnlinkCountdown] = useCountdown(0, 'unlinkOtpExpiryTime')
    const [transferCountdown, startTransferCountdown] = useCountdown(0)
    const [topupCountdown, startTopupCountdown] = useCountdown(0)
    const [withdrawCountdown, startWithdrawCountdown] = useCountdown(0)

    // Modals state tập trung
    const [modalType, setModalType] = useState(null)
    const [modalAmount, setModalAmount] = useState('')
    const [modalPassword, setModalPassword] = useState({ old: '', new: '', confirm: '' })
    const [modalPin, setModalPin] = useState({ old: '', new: '', confirm: '' })

    // Filters State & Export CSV
    const transactionFilter = useTransactionFilter(transactions)
    const exportCSV = useExportCSV(transactionFilter.filteredTransactions, wallet?.walletId)

    // Transfer Form State độc lập
    const [transferPhone, setTransferPhone] = useState('')
    const [transferAmount, setTransferAmount] = useState('')
    const [transferNote, setTransferNote] = useState('')
    const [transferError, setTransferError] = useState('')
    const [transferLoading, setTransferLoading] = useState(false)

    // Devices & Login History cố định
    const [devices, setDevices] = useState([
        { id: 1, name: 'Chrome - Windows (Thiết bị này)', type: 'desktop', lastLogin: '2026-06-25 00:47:26' },
        { id: 2, name: 'Safari - iPhone 14 Pro', type: 'mobile', lastLogin: '2026-06-24 15:30:10' }
    ])

    const [loginHistory] = useState([
        { ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-25 00:47:26', status: 'Thành công' },
        { ip: '113.190.233.12', device: 'Safari - iPhone 14 Pro', time: '2026-06-24 15:30:10', status: 'Thành công' }
    ])

    const [kycFiles, setKycFiles] = useState({ front: null, back: null, selfie: null })

    // Bank State độc lập
    const [linkedBanks, setLinkedBanks] = useState([])
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)
    const [bankAccountNo, setBankAccountNo] = useState('')
    const [bankPhone, setBankPhone] = useState('')
    const [bankOtp, setBankOtp] = useState('')
    const [linkingError, setLinkingError] = useState('')
    const [linkingStep, setLinkingStep] = useState(1)
    const [isLinkingLoading, setIsLinkingLoading] = useState(false)

    const [unlinkBankTarget, setUnlinkBankTarget] = useState(null)
    const [unlinkOtp, setUnlinkOtp] = useState('')
    const [unlinkError, setUnlinkError] = useState('')
    const [isUnlinkingLoading, setIsUnlinkingLoading] = useState(false)

    // Topup & Withdraw Flow States
    const [topupStep, setTopupStep] = useState(1)
    const [topupPin, setTopupPin] = useState('')
    const [topupOtp, setTopupOtp] = useState('')
    const [topupError, setTopupError] = useState('')
    const [isTopupLoading, setIsTopupLoading] = useState(false)

    const [withdrawStep, setWithdrawStep] = useState(1)
    const [withdrawPin, setWithdrawPin] = useState('')
    const [withdrawOtp, setWithdrawOtp] = useState('')
    const [withdrawError, setWithdrawError] = useState('')
    const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)

    // Transfer Confirm States
    const [showTransferConfirm, setShowTransferConfirm] = useState(false)
    const [successTx, setSuccessTx] = useState(null)
    const [transferPin, setTransferPin] = useState('')
    const [transferOtp, setTransferOtp] = useState('')
    const [transferOtpStep, setTransferOtpStep] = useState(false)
    const [transferConventionError, setTransferConfirmError] = useState('')
    const [isTransferConfirmLoading, setIsTransferConfirmLoading] = useState(false)

    const [isEditMode, setIsEditMode] = useState(false)
    const [editProfile, setEditProfile] = useState(null)
    const [qrFile, setQrFile] = useState(null)
    const [scanSuccess, setScanSuccess] = useState(false)

    const [securityToggles, setSecurityToggles] = useState({ smsOtp: true, emailOtp: false, biometrics: true })

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }, [])

    const formatCurrency = useCallback((val) => {
        return Math.abs(val).toLocaleString() + (wallet?.currency || 'đ')
    }, [wallet?.currency])

    // 🌟 ĐIỂM CHỐT 1: Lazy-load toàn bộ giao dịch khi chuyển tab lịch sử
    useEffect(() => {
        if (activeTab === 'history' || activeTab === 'transactions') {
            loadAllTransactions(1, 20)
        }
    }, [activeTab, loadAllTransactions])

    // Load danh sách ngân hàng hệ thống hỗ trợ
    useEffect(() => {
        let isMounted = true
        const initDashboardBankData = async () => {
            try {
                const [masterRes, linkedRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/banks/master', { withCredentials: true }),
                    axios.get('http://localhost:8080/api/banks', { withCredentials: true })
                ])
                if (isMounted) {
                    if (masterRes.data?.success) setBanks(masterRes.data.data)
                    if (linkedRes.data?.success && Array.isArray(linkedRes.data.data)) setLinkedBanks(linkedRes.data.data)
                }
            } catch (err) {
                console.error('Lỗi khởi tạo dữ liệu Bank:', err)
            }
        }
        initDashboardBankData()
        return () => { isMounted = false }
    }, [])

    // Xử lý chuyển khoản ví
    const handleTransfer = useCallback((e) => {
        e.preventDefault()
        setTransferError('')

        if (!transferPhone) return setTransferError('Vui lòng nhập số điện thoại người nhận.')
        if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(transferPhone)) return setTransferError('Số điện thoại không đúng định dạng.')

        const amountVal = parseNumberFromCommas(transferAmount)
        if (amountVal <= 0) return setTransferError('Vui lòng nhập số tiền hợp lệ.')
        if (amountVal > (wallet?.balance || 0)) return setTransferError('Số dư khả dụng không đủ.')

        setShowTransferConfirm(true)
        setTransferPin('')
        setTransferConfirmError('')
    }, [transferPhone, transferAmount, wallet?.balance])

    const handleConfirmTransfer = useCallback(async (e) => {
        e.preventDefault()
        setTransferConfirmError('')
        if (!transferPin || transferPin.length !== 6) {
            setTransferConfirmError('PIN phải gồm 6 chữ số.')
            return
        }

        try {
            setIsTransferConfirmLoading(true)
            const amountVal = parseNumberFromCommas(transferAmount)
            await axios.post(
                'http://localhost:8080/api/transactions/transfer',
                { receiverPhone: transferPhone, amount: amountVal, description: transferNote, pin: transferPin },
                { withCredentials: true }
            )

            setShowTransferConfirm(false)
            setTransferPhone(''); setTransferAmount(''); setTransferNote(''); setTransferPin('')
            showToast('Chuyển tiền thành công!', 'success')
            refresh() // 🌟 Đồng bộ cập nhật lại số dư ví và thống kê tháng từ API Dashboard mới
        } catch (err) {
            setTransferConfirmError(err.response?.data?.message || 'Chuyển tiền thất bại')
        } finally {
            setIsTransferConfirmLoading(false)
        }
    }, [transferAmount, transferPhone, transferNote, transferPin, showToast, refresh])

    // Xử lý rút tiền về bank liên kết
    const handleVerifyWithdrawPin = useCallback(async (e) => {
        e.preventDefault(); setWithdrawError('')
        if (!withdrawPin || withdrawPin.length !== 6 || isNaN(withdrawPin)) {
            return setWithdrawError('Mã PIN giao dịch phải gồm 6 chữ số.')
        }

        try {
            setIsWithdrawLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)
            await axios.post(
                'http://localhost:8080/api/banks/withdraw',
                { bankId: selectedBank?.id || linkedBanks[0]?.id, amount: amountVal, pin: withdrawPin },
                { withCredentials: true }
            )

            showToast(`Rút thành công ${amountVal.toLocaleString()}đ`, 'success')
            setModalAmount(''); setWithdrawPin(''); setWithdrawStep(1); setModalType(null)
            refresh() // 🌟 Tải lại số dư mới
        } catch (err) {
            setWithdrawError(err.response?.data?.message || 'Rút tiền thất bại')
        } finally {
            setIsWithdrawLoading(false)
        }
    }, [withdrawPin, modalAmount, selectedBank, linkedBanks, showToast, refresh])

    const handleLogout = useCallback(() => {
        localStorage.clear()
        showToast('Đăng xuất thành công!')
        setTimeout(() => navigate('/login'), 500)
    }, [navigate, showToast])

    const handleExportCSV = useCallback(() => {
        exportCSV()
        showToast("Xuất file sao kê báo cáo CSV thành công!")
    }, [exportCSV, showToast])

    // 🌟 ĐIỂM CHỐT 2: Bọc kết xuất giao diện vào useMemo để triệt tiêu re-render thừa
    const renderedPanel = useMemo(() => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewPanel
                        wallet={wallet} userProfile={userProfile} transactions={transactions} setModalType={setModalType}
                        setTopupStep={setTopupStep} setWithdrawStep={setWithdrawStep} setModalAmount={setModalAmount}
                        setTopupPin={setTopupPin} setTopupError={setTopupError} setActiveTab={setActiveTab}
                        setQrFile={setQrFile} setScanSuccess={setScanSuccess}
                    />
                )
            case 'transactions':
                return (
                    <TransactionsPanel
                        handleTransfer={handleTransfer} transferError={transferError} transferPhone={transferPhone} setTransferPhone={setTransferPhone}
                        transferAmount={transferAmount} setTransferAmount={setTransferAmount} transferNote={transferNote} setTransferNote={setTransferNote}
                        transferLoading={transferLoading} wallet={wallet} limitPerTransaction={50000000} limitPerDay={100000000}
                        filter={transactionFilter} formatCurrency={formatCurrency} formatNumberWithCommas={formatNumberWithCommas} handleExportCSV={handleExportCSV}
                    />
                )
            case 'myqr':
                return <MyQRPanel userProfile={userProfile} wallet={wallet} handleDownloadQR={() => {}} />
            case 'history':
                return <HistoryPanel wallet={wallet} filter={transactionFilter} handleExportCSV={handleExportCSV} formatCurrency={formatCurrency} />
            case 'bank':
                return (
                    <BankPanel
                        linkingStep={linkingStep} linkingError={linkingError} bankPhone={bankPhone} setBankPhone={setBankPhone}
                        bankAccountNo={bankAccountNo} setBankAccountNo={setBankAccountNo} selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                        isLinkingLoading={isLinkingLoading} handleLinkBankSubmit={() => {}} handleVerifyBankOtp={() => {}}
                        bankOtp={bankOtp} setBankOtp={setBankOtp} handleResendLinkingOtp={() => {}} setLinkingStep={setLinkingStep}
                        linkedBanks={linkedBanks} handleUnlinkBank={() => {}} userProfile={userProfile} banks={banks}
                    />
                )
            case 'kyc':
                return <KycPanel userProfile={userProfile} kycFiles={kycFiles} triggerKycUpload={() => {}} handleKycSubmit={() => {}} />
            case 'profile':
                return (
                    <ProfilePanel
                        userProfile={userProfile} wallet={wallet} isLive={isLive} isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                        editProfile={editProfile} setEditProfile={setEditProfile} handleCancelProfileEdit={() => {}}
                        handleSaveProfile={() => {}} securityToggles={securityToggles} setSecurityToggles={setSecurityToggles}
                        handleLogout={handleLogout} devices={devices} removeDevice={() => {}} loginHistory={loginHistory} setModalType={setModalType}
                    />
                )
            default:
                return null
        }
    }, [activeTab, wallet, userProfile, transactions, transferError, transferPhone, transferAmount, transferNote, transferLoading, transactionFilter, formatCurrency, handleExportCSV, handleTransfer, linkingStep, linkingError, bankPhone, bankAccountNo, selectedBank, isLinkingLoading, bankOtp, linkedBanks, banks, kycFiles, isLive, isEditMode, editProfile, securityToggles, handleLogout, devices, loginHistory])

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="btn-spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent)', borderWidth: '3px', margin: '0 auto 16px' }} />
                    <p style={{ fontWeight: 600, color: 'var(--muted)' }}>Đang tải dữ liệu ví VT Pay...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            <ToastAlert show={toast.show} message={toast.message} type={toast.type} />
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-title">
                        <h1>
                            {activeTab === 'overview' && 'Tổng quan tài chính'}
                            {activeTab === 'transactions' && 'Giao dịch chuyển tiền'}
                            {activeTab === 'myqr' && 'Mã QR nhận tiền'}
                            {activeTab === 'history' && 'Lịch sử giao dịch ví'}
                            {activeTab === 'bank' && 'Liên kết tài khoản ngân hàng'}
                            {activeTab === 'kyc' && 'Thông tin xác thực danh tính'}
                            {activeTab === 'profile' && 'Hồ sơ bảo mật'}
                        </h1>
                    </div>

                    <div className="header-actions">
                        <button className="header-icon-btn" onClick={() => setActiveTab('profile')}><Gear size={20} weight="bold" /></button>
                        <div className="header-user">
                            <div className="user-avatar">{userProfile?.fullName?.split(' ').pop().substring(0, 2).toUpperCase()}</div>
                            <div className="user-info"><strong>{userProfile?.fullName}</strong></div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {renderedPanel}
                </div>
            </main>

            {/* Modals Layer */}
            <TopupModal
                isOpen={modalType === 'topup'} topupStep={topupStep} topupError={topupError} modalAmount={modalAmount} setModalAmount={setModalAmount}
                handleTopupAmountSubmit={() => setTopupStep(2)} handleVerifyTopupPin={() => setTopupStep(3)} handleVerifyTopupOtp={() => {}}
                topupPin={topupPin} setTopupPin={setTopupPin} topupOtp={topupOtp} setTopupOtp={setTopupOtp} isTopupLoading={isTopupLoading}
                topupCountdown={topupCountdown} handleResendTopupOtp={() => {}} userProfile={userProfile}
                parseNumberFromCommas={parseNumberFromCommas} formatNumberWithCommas={formatNumberWithCommas} onBack={() => setTopupStep(1)} onClose={() => setModalType(null)}
                onReset={() => { setModalType(null); setTopupStep(1); }}
            />

            <WithdrawModal
                isOpen={modalType === 'withdraw'} withdrawStep={withdrawStep} withdrawError={withdrawError} modalAmount={modalAmount} setModalAmount={setModalAmount}
                handleWithdrawAmountSubmit={() => setWithdrawStep(2)} handleVerifyWithdrawPin={handleVerifyWithdrawPin} handleVerifyWithdrawOtp={() => {}}
                withdrawPin={withdrawPin} setWithdrawPin={setWithdrawPin} withdrawOtp={withdrawOtp} setWithdrawOtp={setWithdrawOtp} isWithdrawLoading={isWithdrawLoading}
                withdrawCountdown={withdrawCountdown} handleResendWithdrawOtp={() => {}} wallet={wallet} userProfile={userProfile} banks={banks} selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                parseNumberFromCommas={parseNumberFromCommas} formatNumberWithCommas={formatNumberWithCommas} onBack={() => setWithdrawStep(1)} onClose={() => setModalType(null)}
                onReset={() => { setModalType(null); setWithdrawStep(1); }}
            />

            <TransferConfirmModal
                isOpen={showTransferConfirm} transferOtpStep={transferOtpStep}
                onClose={() => setShowTransferConfirm(false)} onCancel={() => setShowTransferConfirm(false)}
                transferPhone={transferPhone} transferAmount={transferAmount} transferNote={transferNote} transferConfirmError={transferConventionError}
                transferPin={transferPin} setTransferPin={setTransferPin} transferOtp={transferOtp} setTransferOtp={setTransferOtp}
                isTransferConfirmLoading={isTransferConfirmLoading} transferCountdown={transferCountdown} onConfirm={handleConfirmTransfer}
                handleVerifyTransferOtp={() => {}} handleResendTransferOtp={() => {}} parseNumberFromCommas={parseNumberFromCommas} userProfile={userProfile}
            />
        </div>
    )
}

export default Dashboard;