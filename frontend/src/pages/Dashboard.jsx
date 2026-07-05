import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Bell, Gear } from '@phosphor-icons/react'

// Custom Hooks
import { useFetchWalletData } from '../hooks/useFetchWalletData'
import { useCountdown } from '../hooks/useCountdown'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

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

const generateRandomId = (prefix = 'TX') => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}

function Dashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)

    // Hooks quản lý call dữ liệu và phím tắt ngầm
    const {
        userProfile,
        setUserProfile,
        wallet,
        setWallet,
        transactions,
        setTransactions,
        loading,
        isLive
    } = useFetchWalletData()

    useKeyboardShortcuts(setActiveTab)

    // Hooks quản lý toàn bộ Countdown đếm ngược OTP độc lập
    const [linkingCountdown, startLinkingCountdown] = useCountdown(0, 'linkingOtpExpiryTime')
    const [unlinkCountdown, startUnlinkCountdown] = useCountdown(0, 'unlinkOtpExpiryTime')
    const [transferCountdown, startTransferCountdown] = useCountdown(0)
    const [topupCountdown, startTopupCountdown] = useCountdown(0)
    const [withdrawCountdown, startWithdrawCountdown] = useCountdown(0)

    // Modals state
    const [modalType, setModalType] = useState(null)
    const [modalAmount, setModalAmount] = useState('')
    const [modalPassword, setModalPassword] = useState({ old: '', new: '', confirm: '' })
    const [modalPin, setModalPin] = useState({ old: '', new: '', confirm: '' })

    // Filters State
    const [filterType, setFilterType] = useState('ALL')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterDate, setFilterDate] = useState('ALL')
    const [filterSearch, setFilterSearch] = useState('')

    // Transfer Form State
    const [transferPhone, setTransferPhone] = useState('')
    const [transferAmount, setTransferAmount] = useState('')
    const [transferNote, setTransferNote] = useState('')
    const [transferError, setTransferError] = useState('')
    const [transferLoading] = useState(false)

    // Devices & Login History
    const [devices, setDevices] = useState([
        { id: 1, name: 'Chrome - Windows (Thiết bị này)', type: 'desktop', lastLogin: '2026-06-25 00:47:26' },
        { id: 2, name: 'Safari - iPhone 14 Pro', type: 'mobile', lastLogin: '2026-06-24 15:30:10' }
    ])

    const [loginHistory] = useState([
        { ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-25 00:47:26', status: 'Thành công' },
        { ip: '113.190.233.12', device: 'Safari - iPhone 14 Pro', time: '2026-06-24 15:30:10', status: 'Thành công' },
        { ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-23 18:22:45', status: 'Thành công' }
    ])

    // Document Upload State
    const [kycFiles, setKycFiles] = useState({ front: null, back: null, selfie: null })

    // Bank accounts linking & loading master state
    const [linkedBanks, setLinkedBanks] = useState([])
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null) // Khởi tạo null tránh lỗi crash Object.id
    const [bankAccountNo, setBankAccountNo] = useState('')
    const [bankPhone, setBankPhone] = useState('')
    const [bankOtp, setBankOtp] = useState('')
    const [linkingError, setLinkingError] = useState('')
    const [linkingStep, setLinkingStep] = useState(1)
    const [isLinkingLoading, setIsLinkingLoading] = useState(false)

    // Bank accounts unlinking state
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
    const [transferConfirmError, setTransferConfirmError] = useState('')
    const [isTransferConfirmLoading, setIsTransferConfirmLoading] = useState(false)

    // Profile Settings States
    const [isEditMode, setIsEditMode] = useState(false)
    const [editProfile, setEditProfile] = useState(null)

    // Transaction Limits & Security Toggles
    const [limitPerTransaction] = useState(50000000)
    const [limitPerDay] = useState(100000000)
    const [securityToggles, setSecurityToggles] = useState({ smsOtp: true, emailOtp: false, biometrics: true })

    // QR Scanner States
    const [qrFile, setQrFile] = useState(null)
    const [scanSuccess, setScanSuccess] = useState(false)


    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }

    // Load danh sách ngân hàng hệ thống hỗ trợ & Tải danh sách liên kết
    useEffect(() => {
        const initDashboardBankData = async () => {
            try {
                // Chạy song song cả 2 API để tối ưu tốc độ tải trang
                const [masterRes, linkedRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/banks/master', { withCredentials: true }),
                    axios.get('http://localhost:8080/api/banks', { withCredentials: true })
                ]);

                if (masterRes.data && masterRes.data.success) {
                    setBanks(masterRes.data.data);
                }

                if (linkedRes.data && linkedRes.data.success && Array.isArray(linkedRes.data.data)) {
                    setLinkedBanks(linkedRes.data.data);
                }
            } catch (err) {
                console.error('Lỗi khởi tạo dữ liệu Bank:', err);
                showToast('Không tải được danh sách dữ liệu ngân hàng', 'error');
            }
        };

        initDashboardBankData();
    }, []);

    // Xử lý liên kết tài khoản ngân hàng
    const handleLinkBankSubmit = async (e) => {
        e.preventDefault()
        setLinkingError('')

        if (!selectedBank) {
            setLinkingError('Vui lòng chọn ngân hàng.')
            return
        }
        if (!bankAccountNo || bankAccountNo.length < 8) {
            setLinkingError('Số tài khoản ngân hàng không hợp lệ.')
            return
        }
        if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(bankPhone)) {
            setLinkingError('Số điện thoại đăng ký không đúng định dạng.')
            return
        }

        try {
            setIsLinkingLoading(true)
            await axios.post(
                'http://localhost:8080/api/banks/link',
                { bankId: selectedBank.id, accountNumber: bankAccountNo, phone: bankPhone },
                { withCredentials: true }
            )
            showToast('Liên kết ngân hàng thành công!', 'success')
            setBankAccountNo('')
            setSelectedBank(null)
            // loadLinkedBanks() // Bạn có thể thêm hàm gọi tải lại list ngân hàng thật tại đây
        } catch (err) {
            setLinkingError(err.response?.data?.message || 'Liên kết ngân hàng thất bại.')
        } finally {
            setIsLinkingLoading(false)
        }
    }

    const handleResendLinkingOtp = () => {
        if (linkingCountdown > 0) return
        startLinkingCountdown(60)
        showToast('Đã gửi lại mã OTP xác thực liên kết ngân hàng!', 'warning')
    }

    const handleVerifyBankOtp = (e) => {
        e.preventDefault()
        setLinkingError('')
        if (!bankOtp || bankOtp.length !== 6 || isNaN(bankOtp)) {
            setLinkingError('Mã OTP xác thực phải gồm 6 chữ số.')
            return
        }

        setIsLinkingLoading(true)
        setTimeout(() => {
            setIsLinkingLoading(false)
            const newBank = {
                id: generateRandomId(selectedBank?.logo || 'BANK'),
                bankName: selectedBank?.bankName || 'Ngân hàng mới',
                logo: selectedBank?.logo || 'BANK',
                accountNumber: bankAccountNo,
                cardHolder: userProfile.fullName.toUpperCase(),
                linkedDate: new Date().toISOString().substring(0, 10)
            }
            setLinkedBanks(prev => [...prev, newBank])
            showToast(`Liên kết tài khoản ${newBank.bankName} thành công!`)
            setBankAccountNo('')
            setBankOtp('')
            setLinkingStep(1)
        }, 1500)
    }

    const handleUnlinkBank = (card) => {
        setUnlinkBankTarget(card)
        setUnlinkOtp('')
        setUnlinkError('')
    }

    const handleResendUnlinkOtp = () => {
        if (unlinkCountdown > 0) return
        startUnlinkCountdown(60)
        showToast('Mã OTP hủy liên kết đã được gửi qua SMS!', 'warning')
    }

    const handleVerifyUnlinkOtp = (e) => {
        e.preventDefault()
        setUnlinkError('')
        if (!unlinkOtp || unlinkOtp.length !== 6 || isNaN(unlinkOtp)) {
            setUnlinkError('Mã OTP xác thực phải gồm 6 chữ số.')
            return
        }

        setIsUnlinkingLoading(true)
        setTimeout(() => {
            setIsUnlinkingLoading(false)
            setLinkedBanks(prev => prev.filter(b => b.id !== unlinkBankTarget.id))
            showToast(`Đã hủy liên kết tài khoản ${unlinkBankTarget.bankName} thành công!`)
            setUnlinkBankTarget(null)
            setUnlinkOtp('')
        }, 1500)
    }

    const handleLogout = () => {
        localStorage.clear()
        showToast('Đăng xuất thành công!')
        setTimeout(() => navigate('/login'), 500)
    }

    const handleSaveProfile = (e) => {
        e.preventDefault()
        if (!editProfile.email || !editProfile.email.includes('@')) {
            showToast('Email không hợp lệ.', 'error')
            return
        }
        if (!editProfile.address.trim()) {
            showToast('Địa chỉ không được để trống.', 'error')
            return
        }
        setUserProfile(prev => ({ ...prev, ...editProfile }))
        setIsEditMode(false)
        showToast('Cập nhật thông tin cá nhân thành công!')
    }

    const handleCancelProfileEdit = () => {
        setEditProfile({ ...userProfile })
        setIsEditMode(false)
    }

    const handleDownloadQR = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 400; canvas.height = 550
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#006aff'); gradient.addColorStop(1, '#0c4a6e')
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.roundRect(30, 80, 340, 400, 20); ctx.fill()

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px system-ui, sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('VT PAY', canvas.width / 2, 45)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.font = '13px system-ui, sans-serif'
        ctx.fillText('QUÉT MÃ ĐỂ NHẬN TIỀN', canvas.width / 2, 65)

        const qrImg = new Image()
        qrImg.crossOrigin = 'anonymous'; qrImg.src = '/vtpay_qr_code.jpg'
        qrImg.onload = () => {
            ctx.drawImage(qrImg, canvas.width / 2 - 110, 110, 220, 220)
            ctx.fillStyle = '#0f172a'; ctx.font = 'bold 18px system-ui, sans-serif'
            ctx.fillText(userProfile.fullName.toUpperCase(), canvas.width / 2, 370)
            ctx.fillStyle = '#64748b'; ctx.font = '600 14px system-ui, sans-serif'
            ctx.fillText(`Số tài khoản ví: ${wallet.walletId}`, canvas.width / 2, 395)
            ctx.fillStyle = '#1e293b'; ctx.font = 'italic 12px system-ui, sans-serif'
            ctx.fillText('Chuyển tiền nhanh liên ngân hàng 24/7', canvas.width / 2, 440)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.font = 'bold 11px system-ui, sans-serif'
            ctx.fillText('www.vtpay.vn', canvas.width / 2, canvas.height - 25)

            const link = document.createElement('a')
            link.download = `VTPay_QR_${wallet.walletId}.jpg`; link.href = canvas.toDataURL('image/jpeg', 0.9); link.click()
        }
    }

    const handleExportCSV = () => {
        const headers = ['Ma giao dich', 'Nguoi nhan/Nguon', 'Loai giao dich', 'Thoi gian', 'Trang thai', 'So tien (dong)']
        const rows = filteredTransactions.map(tx => [
            tx.id, tx.recipient,
            tx.type === 'TRANSFER' ? 'Chuyen tien' : (tx.type === 'TOPUP' ? 'Nap vi' : 'Rut vi'),
            tx.date, tx.status === 'SUCCESS' ? 'Thanh cong' : (tx.status === 'PENDING' ? 'Cho xu ly' : 'That bai'), tx.amount
        ])
        const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.setAttribute('href', URL.createObjectURL(blob))
        link.setAttribute('download', `VTPay_GD_${wallet.walletId}_${new Date().toISOString().substring(0, 10)}.csv`)
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        showToast('Xuất file sao kê báo cáo CSV thành công!')
    }

    const handleTransfer = (e) => {
        e.preventDefault()
        setTransferError('')

        if (!transferPhone) return setTransferError('Vui lòng nhập số điện thoại người nhận.')
        if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(transferPhone)) return setTransferError('Số điện thoại không đúng định dạng.')

        const amountVal = parseNumberFromCommas(transferAmount)
        if (amountVal <= 0) return setTransferError('Vui lòng nhập số tiền hợp lệ.')
        if (amountVal > wallet.balance) return setTransferError('Số dư khả dụng không đủ.')

        setShowTransferConfirm(true)
        setTransferPin('')
        setTransferConfirmError('')
    }

    const handleConfirmTransfer = async (e) => {
        e.preventDefault()
        setTransferConfirmError('')
        if (!transferPin || transferPin.length !== 6) {
            setTransferConfirmError('PIN phải gồm 6 chữ số.')
            return
        }

        try {
            setIsTransferConfirmLoading(true)
            const amountVal = parseNumberFromCommas(transferAmount)
            const { data } = await axios.post(
                'http://localhost:8080/api/transactions/transfer',
                { receiverPhone: transferPhone, amount: amountVal, description: transferNote, pin: transferPin },
                { withCredentials: true }
            )

            const result = data.data
            setWallet(prev => ({ ...prev, balance: result.balance }))
            setTransactions(prev => [
                { id: result.transactionCode, recipient: transferPhone, amount: amountVal, direction: 'OUT', type: 'TRANSFER', status: 'SUCCESS', date: result.createdAt },
                ...prev
            ])

            setShowTransferConfirm(false)
            setTransferPhone(''); setTransferAmount(''); setTransferNote(''); setTransferPin('')
            showToast('Chuyển tiền thành công!', 'success')
        } catch (err) {
            setTransferConfirmError(err.response?.data?.message || 'Chuyển tiền thất bại')
        } finally {
            setIsTransferConfirmLoading(false)
        }
    }

    const handleVerifyTransferOtp = (e) => { e.preventDefault() }
    const handleResendTransferOtp = () => { if (transferCountdown <= 0) startTransferCountdown(60) }

    // Các hàm điều khiển luồng nạp tiền
    const handleTopupAmountSubmit = (e) => {
        e.preventDefault(); setTopupError('')
        if (parseNumberFromCommas(modalAmount) <= 0) return setTopupError('Vui lòng nhập số tiền hợp lệ.')
        setTopupStep(2); setTopupPin('')
    }

    const handleVerifyTopupPin = (e) => {
        e.preventDefault(); setTopupError('')
        if (!topupPin || topupPin.length !== 6 || isNaN(topupPin)) return setTopupError('Mã PIN gồm 6 chữ số.')
        setTopupStep(3); setTopupOtp(''); startTopupCountdown(60)
    }

    const handleVerifyTopupOtp = (e) => {
        e.preventDefault()
        setIsTopupLoading(true)
        setTimeout(() => {
            setIsTopupLoading(false)
            const amountVal = parseNumberFromCommas(modalAmount)
            setWallet(prev => ({ ...prev, balance: prev.balance + amountVal }))
            setTransactions(prev => [
                { id: generateRandomId('TX'), recipient: 'Nạp tiền liên kết', amount: amountVal, type: 'TOPUP', date: new Date().toISOString().replace('T', ' ').substring(0, 19), status: 'SUCCESS', note: 'Nạp tiền ví thành công' },
                ...prev
            ])
            showToast(`Nạp thành công ${amountVal.toLocaleString()}đ vào ví!`)
            setModalAmount(''); setModalType(null); setTopupStep(1)
        }, 1500)
    }

    const handleResendTopupOtp = () => { if (topupCountdown <= 0) startTopupCountdown(60) }

    // Các hàm điều khiển luồng rút tiền về ngân hàng liên kết
    const handleWithdrawAmountSubmit = (e) => {
        e.preventDefault(); setWithdrawError('')
        const amountVal = parseNumberFromCommas(modalAmount)
        if (amountVal <= 0) return setWithdrawError('Vui lòng nhập số tiền rút hợp lệ.')
        if (amountVal > wallet.balance) return setWithdrawError('Số dư tài khoản ví không đủ.')
        setWithdrawStep(2); setWithdrawPin('')
    }

    const handleVerifyWithdrawPin = async (e) => {
        e.preventDefault(); setWithdrawError('')
        if (!withdrawPin || withdrawPin.length !== 6 || isNaN(withdrawPin)) {
            setWithdrawError('Mã PIN giao dịch phải gồm 6 chữ số.')
            return
        }

        try {
            setIsWithdrawLoading(true)
            const amountVal = parseNumberFromCommas(modalAmount)
            const { data } = await axios.post(
                'http://localhost:8080/api/banks/withdraw',
                { bankId: selectedBank?.id || linkedBanks[0]?.id, amount: amountVal, pin: withdrawPin },
                { withCredentials: true }
            )

            const result = data.data
            setWallet(prev => ({ ...prev, balance: result.walletBalance }))
            setTransactions(prev => [
                { id: result.transactionCode || generateRandomId('TX'), recipient: 'Rút tiền ATM/Bank', amount: -amountVal, type: 'WITHDRAW', date: new Date().toISOString().replace('T', ' ').substring(0, 19), status: 'SUCCESS' },
                ...prev
            ])

            showToast(`Rút thành công ${amountVal.toLocaleString()}đ`, 'success')
            setModalAmount(''); setWithdrawPin(''); setWithdrawStep(1); setModalType(null)
        } catch (err) {
            setWithdrawError(err.response?.data?.message || 'Rút tiền thất bại')
        } finally {
            setIsWithdrawLoading(false)
        }
    }

    const handleVerifyWithdrawOtp = (e) => { e.preventDefault() }
    const handleResendWithdrawOtp = () => { if (withdrawCountdown <= 0) startWithdrawCountdown(60) }

    // Đổi mật khẩu/PIN bảo mật
    const handlePasswordChangeSubmit = (e) => {
        e.preventDefault()
        if (modalPassword.new !== modalPassword.confirm) return alert('Xác nhận mật khẩu không khớp.')
        showToast('Đã đổi mật khẩu ví thành công!')
        setModalPassword({ old: '', new: '', confirm: '' }); setModalType(null)
    }

    const handlePinChangeSubmit = (e) => {
        e.preventDefault()
        if (modalPin.new !== modalPin.confirm) return alert('Xác nhận mã PIN không khớp.')
        showToast('Đã thay đổi mã PIN giao dịch thành công!')
        setModalPin({ old: '', new: '', confirm: '' }); setModalType(null)
    }

    const triggerKycUpload = (type) => {
        setKycFiles(prev => ({ ...prev, [type]: 'https://picsum.photos/seed/document/400/250' }))
        showToast(`Đã tải ảnh lên thành công!`)
    }

    const handleKycSubmit = () => {
        if (!kycFiles.front || !kycFiles.back || !kycFiles.selfie) return alert('Vui lòng upload đầy đủ hồ sơ.')
        setUserProfile(prev => ({ ...prev, kycStatus: 'PENDING' }))
        showToast('Hồ sơ KYC đã được gửi đi duyệt.', 'warning')
    }

    const removeDevice = (id, name) => {
        setDevices(prev => prev.filter(d => d.id !== id))
        showToast(`Đã gỡ thiết bị: ${name}`)
    }

    // Khối filter lọc danh sách giao dịch
    const filteredTransactions = transactions.filter(t => {
        if (filterType !== 'ALL' && t.type !== filterType) return false
        if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
        if (filterDate !== 'ALL') {
            const diffDays = Math.ceil(Math.abs(new Date() - new Date(t.date)) / (1000 * 60 * 60 * 24))
            if (filterDate === 'TODAY' && diffDays > 1) return false
            if (filterDate === 'WEEK' && diffDays > 7) return false
            if (filterDate === 'MONTH' && diffDays > 30) return false
        }
        if (filterSearch.trim() !== '') {
            const q = filterSearch.toLowerCase().trim()
            return t.id.toLowerCase().includes(q) || t.recipient.toLowerCase().includes(q) || String(t.amount).includes(q)
        }
        return true
    })

    const formatCurrency = (val) => Math.abs(val).toLocaleString() + (wallet?.currency || 'đ')
    const formatNumberWithCommas = (val) => val ? parseInt(String(val).replace(/\D/g, ''), 10).toLocaleString('en-US') : ''
    const parseNumberFromCommas = (val) => val ? parseFloat(String(val).replace(/,/g, '')) || 0 : 0

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
                        <div style={{ position: 'relative' }}>
                            <button className="header-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={20} weight="bold" />
                                {notifications.some(n => !n.read) && <span className="header-icon-badge">1</span>}
                            </button>
                            {showNotifications && (
                                <div className="header-notifications-dropdown">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                                        <strong style={{ fontSize: '0.9rem' }}>Thông báo</strong>
                                        <button style={{ border: 'none', background: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Đọc tất cả</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {notifications.map(n => (
                                            <div key={n.id} style={{ fontSize: '0.82rem', paddingBottom: '8px', opacity: n.read ? 0.7 : 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>{n.title}</strong><span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{n.time}</span>
                                                </div>
                                                <p style={{ color: 'var(--muted)', margin: 0 }}>{n.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="header-icon-btn" onClick={() => setActiveTab('profile')}><Gear size={20} weight="bold" /></button>
                        <div className="header-user">
                            <div className="user-avatar">{userProfile?.fullName?.split(' ').pop().substring(0, 2).toUpperCase()}</div>
                            <div className="user-info"><strong>{userProfile?.fullName}</strong></div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {activeTab === 'overview' && (
                        <OverviewPanel
                            wallet={wallet} userProfile={userProfile} transactions={transactions} setModalType={setModalType}
                            setTopupStep={setTopupStep} setWithdrawStep={setWithdrawStep} setModalAmount={setModalAmount}
                            setTopupPin={setTopupPin} setTopupError={setTopupError} setActiveTab={setActiveTab}
                            setQrFile={setQrFile} setScanSuccess={setScanSuccess}
                        />
                    )}

                    {activeTab === 'transactions' && (
                        <TransactionsPanel
                            handleTransfer={handleTransfer} transferError={transferError} transferPhone={transferPhone} setTransferPhone={setTransferPhone}
                            transferAmount={transferAmount} setTransferAmount={setTransferAmount} transferNote={transferNote} setTransferNote={setTransferNote}
                            transferLoading={transferLoading} wallet={wallet} limitPerTransaction={limitPerTransaction} limitPerDay={limitPerDay}
                            filterDate={filterDate} setFilterDate={setFilterDate} filterType={filterType} setFilterType={setFilterType}
                            filterStatus={filterStatus} setFilterStatus={setFilterStatus} filteredTransactions={filteredTransactions}
                            formatCurrency={formatCurrency} formatNumberWithCommas={formatNumberWithCommas} handleExportCSV={handleExportCSV}
                        />
                    )}

                    {activeTab === 'myqr' && <MyQRPanel userProfile={userProfile} wallet={wallet} handleDownloadQR={handleDownloadQR} />}

                    {activeTab === 'history' && (
                        <HistoryPanel
                            wallet={wallet} filteredTransactions={filteredTransactions} filterSearch={filterSearch} setFilterSearch={setFilterSearch}
                            filterDate={filterDate} setFilterDate={setFilterDate} filterType={filterType} setFilterType={setFilterType}
                            filterStatus={filterStatus} setFilterStatus={setFilterStatus} handleExportCSV={handleExportCSV} formatCurrency={formatCurrency}
                        />
                    )}

                    {activeTab === 'bank' && (
                        <BankPanel
                            linkingStep={linkingStep} linkingError={linkingError} bankPhone={bankPhone} setBankPhone={setBankPhone}
                            bankAccountNo={bankAccountNo} setBankAccountNo={setBankAccountNo} selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                            isLinkingLoading={isLinkingLoading} handleLinkBankSubmit={handleLinkBankSubmit} handleVerifyBankOtp={handleVerifyBankOtp}
                            bankOtp={bankOtp} setBankOtp={setBankOtp} handleResendLinkingOtp={handleResendLinkingOtp} setLinkingStep={setLinkingStep}
                            linkedBanks={linkedBanks} handleUnlinkBank={handleUnlinkBank} userProfile={userProfile} banks={banks}
                        />
                    )}

                    {activeTab === 'kyc' && <KycPanel userProfile={userProfile} kycFiles={kycFiles} triggerKycUpload={triggerKycUpload} handleKycSubmit={handleKycSubmit} />}

                    {activeTab === 'profile' && (
                        <ProfilePanel
                            userProfile={userProfile} wallet={wallet} isLive={isLive} isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                            editProfile={editProfile} setEditProfile={setEditProfile} handleCancelProfileEdit={handleCancelProfileEdit}
                            handleSaveProfile={handleSaveProfile} securityToggles={securityToggles} setSecurityToggles={setSecurityToggles}
                            handleLogout={handleLogout} devices={devices} removeDevice={removeDevice} loginHistory={loginHistory} setModalType={setModalType}
                        />
                    )}
                </div>
            </main>

            {/* Toàn bộ hệ thống Modals */}
            <TopupModal
                isOpen={modalType === 'topup'} topupStep={topupStep} topupError={topupError} modalAmount={modalAmount} setModalAmount={setModalAmount}
                handleTopupAmountSubmit={handleTopupAmountSubmit} handleVerifyTopupPin={handleVerifyTopupPin} handleVerifyTopupOtp={handleVerifyTopupOtp}
                topupPin={topupPin} setTopupPin={setTopupPin} topupOtp={topupOtp} setTopupOtp={setTopupOtp} isTopupLoading={isTopupLoading}
                topupCountdown={topupCountdown} handleResendTopupOtp={handleResendTopupOtp} userProfile={userProfile}
                parseNumberFromCommas={parseNumberFromCommas} formatNumberWithCommas={formatNumberWithCommas} onBack={() => setTopupStep(1)} onClose={() => setModalType(null)}
                onReset={() => { setModalType(null); setTopupStep(1); setTopupPin(''); setTopupOtp(''); setTopupError('') }}
            />

            <WithdrawModal
                isOpen={modalType === 'withdraw'} withdrawStep={withdrawStep} withdrawError={withdrawError} modalAmount={modalAmount} setModalAmount={setModalAmount}
                handleWithdrawAmountSubmit={handleWithdrawAmountSubmit} handleVerifyWithdrawPin={handleVerifyWithdrawPin} handleVerifyWithdrawOtp={handleVerifyWithdrawOtp}
                withdrawPin={withdrawPin} setWithdrawPin={setWithdrawPin} withdrawOtp={withdrawOtp} setWithdrawOtp={setWithdrawOtp} isWithdrawLoading={isWithdrawLoading}
                withdrawCountdown={withdrawCountdown} handleResendWithdrawOtp={handleResendWithdrawOtp} wallet={wallet} userProfile={userProfile} banks={banks} selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                parseNumberFromCommas={parseNumberFromCommas} formatNumberWithCommas={formatNumberWithCommas} onBack={() => setWithdrawStep(1)} onClose={() => setModalType(null)}
                onReset={() => { setModalType(null); setWithdrawStep(1); setWithdrawPin(''); setWithdrawOtp(''); setWithdrawError('') }}
            />

            <PasswordModal isOpen={modalType === 'password'} onClose={() => setModalType(null)} modalPassword={modalPassword} setModalPassword={setModalPassword} handlePasswordChangeSubmit={handlePasswordChangeSubmit} />
            <PinModal isOpen={modalType === 'pin'} onClose={() => setModalType(null)} modalPin={modalPin} setModalPin={setModalPin} handlePinChangeSubmit={handlePinChangeSubmit} />

            <UnlinkBankModal
                isOpen={unlinkBankTarget !== null} onClose={() => { setUnlinkBankTarget(null); setUnlinkOtp(''); setUnlinkError('') }}
                userProfile={userProfile} unlinkBankTarget={unlinkBankTarget} unlinkError={unlinkError} unlinkOtp={unlinkOtp} setUnlinkOtp={setUnlinkOtp}
                isUnlinkingLoading={isUnlinkingLoading} handleResendUnlinkOtp={handleResendUnlinkOtp} handleVerifyUnlinkOtp={handleVerifyUnlinkOtp} unlinkCountdown={unlinkCountdown}
            />

            <TransferConfirmModal
                isOpen={showTransferConfirm} transferOtpStep={transferOtpStep}
                onClose={() => { if (!isTransferConfirmLoading) { setShowTransferConfirm(false); setTransferOtpStep(false); setTransferPin(''); setTransferOtp(''); setTransferConfirmError('') } }}
                onCancel={() => { if (!isTransferConfirmLoading) { setShowTransferConfirm(false); setTransferOtpStep(false); setTransferPin(''); setTransferOtp(''); setTransferConfirmError('') } }}
                transferPhone={transferPhone} transferAmount={transferAmount} transferNote={transferNote} transferConfirmError={transferConfirmError}
                transferPin={transferPin} setTransferPin={setTransferPin} transferOtp={transferOtp} setTransferOtp={setTransferOtp}
                isTransferConfirmLoading={isTransferConfirmLoading} transferCountdown={transferCountdown} onConfirm={handleConfirmTransfer}
                handleVerifyTransferOtp={handleVerifyTransferOtp} handleResendTransferOtp={handleResendTransferOtp} parseNumberFromCommas={parseNumberFromCommas} userProfile={userProfile}
            />

            <QrScannerModal
                isOpen={modalType === 'qrscanner'} onClose={() => { setModalType(null); setQrFile(null); setScanSuccess(false) }}
                qrFile={qrFile} setQrFile={setQrFile} scanSuccess={scanSuccess} setScanSuccess={setScanSuccess} showToast={showToast}
                setTransferPhone={setTransferPhone} setTransferAmount={setTransferAmount} setTransferNote={setTransferNote} setActiveTab={setActiveTab} setModalType={setModalType} userProfile={userProfile}
            />

            <TransactionSuccessModal isOpen={successTx !== null} tx={successTx} onClose={() => setSuccessTx(null)} userProfile={userProfile} showToast={showToast} />
        </div>
    )
}

export default Dashboard