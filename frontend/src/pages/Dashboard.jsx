import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Gear } from '@phosphor-icons/react'
import { useQueryClient } from '@tanstack/react-query'

// API & Custom Hooks
import transactionApi from '../api/transactionApi'
import useFetchWalletData from '../hooks/useFetchWalletData'
import useCountdown from '../hooks/useCountdown'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import useTransactionFilter from "../hooks/useTransactionFilter"
import useExportCSV from "../hooks/useExportCSV"
import { useTransactionsQuery } from '../hooks/useTransactionsQuery'

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
    TransferConfirmModal,
} from '../components/modals'
import './Dashboard.css'

const parseNumberFromCommas = (val) => val ? parseFloat(String(val).replace(/,/g, '')) || 0 : 0
const formatNumberWithCommas = (val) => val ? parseInt(String(val).replace(/\D/g, ''), 10).toLocaleString('en-US') : ''

function Dashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
    const [modalType, setModalType] = useState(null) // 'topup' | 'withdraw' | null

    const queryClient = useQueryClient();

    // 1. Dữ liệu Core
    const { userProfile, wallet, loading: isCoreLoading, isLive, refresh } = useFetchWalletData()
    const { data: txPageData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isTxLoading } = useTransactionsQuery();

    const transactions = useMemo(() => {
        return txPageData ? txPageData.pages.flatMap(page => page.data) : [];
    }, [txPageData]);

    const historyFilter = useTransactionFilter(transactions);
    const transactionFilter = useTransactionFilter(transactions);
    const exportCSV = useExportCSV(transactionFilter.filteredTransactions, wallet?.walletId)

    useKeyboardShortcuts(setActiveTab)

    // 2. Global Success Handler (Dùng chung cho Nạp, Rút, Chuyển)
    const handleTransactionSuccess = useCallback((message) => {
        setModalType(null)
        setToast({ show: true, message, type: 'success' })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        refresh()
    }, [queryClient, refresh])

    // ==========================================
    // 3. LUỒNG CHUYỂN TIỀN (TRANSFER)
    // ==========================================
    const [transferCountdown, startTransferCountdown] = useCountdown(0)
    const [transferPhone, setTransferPhone] = useState('')
    const [transferAmount, setTransferAmount] = useState('')
    const [transferNote, setTransferNote] = useState('')
    const [transferError, setTransferError] = useState('')

    const [showTransferConfirm, setShowTransferConfirm] = useState(false)
    const [transferPin, setTransferPin] = useState('')
    const [transferOtp, setTransferOtp] = useState('')
    const [transferOtpStep, setTransferOtpStep] = useState(false)
    const [transferConfirmError, setTransferConfirmError] = useState('')
    const [isTransferConfirmLoading, setIsTransferConfirmLoading] = useState(false)

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

    // Bước 1: Khởi tạo gửi OTP
    const handleConfirmTransfer = useCallback(async (e) => {
        e.preventDefault()
        setTransferConfirmError('')
        if (!transferPin || transferPin.length !== 6) return setTransferConfirmError('PIN phải gồm 6 chữ số.')

        try {
            setIsTransferConfirmLoading(true)
            await transactionApi.initiateTransfer({
                receiverPhone: transferPhone,
                amount: parseNumberFromCommas(transferAmount),
                description: transferNote || 'Chuyen tien',
                pin: transferPin
            })
            setTransferOtpStep(true)
            startTransferCountdown(60)
            setTransferOtp('')
        } catch (err) {
            setTransferConfirmError(err.response?.data?.message || 'Khởi tạo chuyển tiền thất bại')
        } finally { setIsTransferConfirmLoading(false) }
    }, [transferAmount, transferPhone, transferNote, transferPin, startTransferCountdown])

    // Bước 2: Xác nhận OTP
    const handleVerifyTransferOtp = useCallback(async (e) => {
        e.preventDefault()
        setTransferConfirmError('')
        if (!transferOtp || transferOtp.length !== 6) return setTransferConfirmError('Mã OTP phải gồm 6 chữ số.')

        try {
            setIsTransferConfirmLoading(true)
            await transactionApi.confirmTransfer({
                receiverPhone: transferPhone,
                amount: parseNumberFromCommas(transferAmount),
                description: transferNote || 'Chuyen tien',
                pin: transferPin
            }, transferOtp)

            setShowTransferConfirm(false)
            setTransferOtpStep(false)
            setTransferPhone(''); setTransferAmount(''); setTransferNote(''); setTransferPin(''); setTransferOtp('')
            handleTransactionSuccess('Chuyển tiền thành công!')
        } catch (err) {
            setTransferConfirmError(err.response?.data?.message || 'Mã OTP không chính xác')
        } finally { setIsTransferConfirmLoading(false) }
    }, [transferAmount, transferPhone, transferNote, transferPin, transferOtp, handleTransactionSuccess])

    const handleResendTransferOtp = useCallback(async () => {
        setTransferConfirmError('')
        try {
            await transactionApi.initiateTransfer({
                receiverPhone: transferPhone, amount: parseNumberFromCommas(transferAmount), description: transferNote, pin: transferPin
            })
            startTransferCountdown(60)
            setTransferOtp('')
        } catch (err) { setTransferConfirmError('Không thể gửi lại mã OTP lúc này.') }
    }, [transferAmount, transferPhone, transferNote, transferPin, startTransferCountdown])


    // ==========================================
    // 4. LUỒNG DỮ LIỆU KHÁC (Banks, Kyc, Profile)
    // ==========================================
    const [linkedBanks, setLinkedBanks] = useState([])
    const [banks, setBanks] = useState([])
    const [selectedBank, setSelectedBank] = useState(null)
    const [bankAccountNo, setBankAccountNo] = useState('')
    const [bankPhone, setBankPhone] = useState('')
    const [linkingStep, setLinkingStep] = useState(1)

    const [kycFiles, setKycFiles] = useState({ front: null, back: null, selfie: null })
    const [isEditMode, setIsEditMode] = useState(false)
    const [editProfile, setEditProfile] = useState(null)
    const [securityToggles, setSecurityToggles] = useState({ smsOtp: true, emailOtp: false, biometrics: true })

    const [devices] = useState([{ id: 1, name: 'Chrome - Windows', type: 'desktop', lastLogin: '2026-06-25' }])
    const [loginHistory] = useState([{ ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-25', status: 'Thành công' }])

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
            } catch (err) { console.error('Lỗi tải Bank:', err) }
        }
        initDashboardBankData()
        return () => { isMounted = false }
    }, [])

    const formatCurrency = useCallback((val) => {
        return Math.abs(val).toLocaleString() + (wallet?.currency || 'đ')
    }, [wallet?.currency])

    const handleLogout = useCallback(() => {
        localStorage.clear()
        navigate('/login')
    }, [navigate])


    // ==========================================
    // 5. RENDER CHÍNH
    // ==========================================
    const renderedPanel = useMemo(() => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewPanel
                        wallet={wallet} userProfile={userProfile} transactions={transactions.slice(0, 5)}
                        monthlyExpense={wallet?.monthExpense || 0} monthlyIncome={wallet?.monthIncome || 0}
                        setModalType={setModalType} setActiveTab={setActiveTab}
                    />
                )
            case 'transactions':
                return (
                    <TransactionsPanel
                        handleTransfer={handleTransfer} transferError={transferError}
                        transferPhone={transferPhone} setTransferPhone={setTransferPhone}
                        transferAmount={transferAmount} setTransferAmount={setTransferAmount}
                        transferNote={transferNote} setTransferNote={setTransferNote}
                        wallet={wallet} transactions={transactions} filter={transactionFilter}
                        formatCurrency={formatCurrency} formatNumberWithCommas={formatNumberWithCommas} handleExportCSV={() => exportCSV()}
                        hasMore={hasNextPage} onLoadMore={fetchNextPage} isLoading={isTxLoading} isFetchingNextPage={isFetchingNextPage}
                    />
                )
            case 'myqr':
                return <MyQRPanel userProfile={userProfile} wallet={wallet} />
            case 'history':
                return (
                    <HistoryPanel
                        wallet={wallet} transactions={transactions} filter={historyFilter}
                        handleExportCSV={() => exportCSV()} formatCurrency={formatCurrency}
                        hasMore={hasNextPage} onLoadMore={fetchNextPage} isLoading={isTxLoading} isFetchingNextPage={isFetchingNextPage}
                    />
                )
            case 'bank':
                return (
                    <BankPanel
                        linkingStep={linkingStep} setLinkingStep={setLinkingStep} bankPhone={bankPhone} setBankPhone={setBankPhone}
                        bankAccountNo={bankAccountNo} setBankAccountNo={setBankAccountNo} selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                        linkedBanks={linkedBanks} banks={banks} userProfile={userProfile}
                    />
                )
            case 'kyc':
                return <KycPanel userProfile={userProfile} kycFiles={kycFiles} />
            case 'profile':
                return (
                    <ProfilePanel
                        userProfile={userProfile} wallet={wallet} isLive={isLive} isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                        editProfile={editProfile} setEditProfile={setEditProfile} securityToggles={securityToggles} setSecurityToggles={setSecurityToggles}
                        handleLogout={handleLogout} devices={devices} loginHistory={loginHistory} setModalType={setModalType}
                    />
                )
            default:
                return null
        }
    }, [
        activeTab, wallet, userProfile, transactions, transferError, transferPhone, transferAmount, transferNote,
        transactionFilter, historyFilter, formatCurrency, exportCSV, handleTransfer, linkingStep, bankPhone, bankAccountNo,
        selectedBank, linkedBanks, banks, kycFiles, isLive, isEditMode, editProfile, securityToggles, handleLogout,
        devices, loginHistory, hasNextPage, fetchNextPage, isTxLoading, isFetchingNextPage
    ]);

    if (isCoreLoading) {
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

            {/* Modals Layer Tự Quản Lý */}
            <TopupModal
                isOpen={modalType === 'topup'}
                onClose={() => setModalType(null)}
                onSuccess={handleTransactionSuccess}
                userProfile={userProfile}
                linkedBanks={linkedBanks}
            />

            <WithdrawModal
                isOpen={modalType === 'withdraw'}
                onClose={() => setModalType(null)}
                onSuccess={handleTransactionSuccess}
                wallet={wallet}
                userProfile={userProfile}
                linkedBanks={linkedBanks}
            />

            <TransferConfirmModal
                isOpen={showTransferConfirm} transferOtpStep={transferOtpStep}
                onClose={() => { setShowTransferConfirm(false); setTransferOtpStep(false); }}
                onCancel={() => { setShowTransferConfirm(false); setTransferOtpStep(false); }}
                transferPhone={transferPhone} transferAmount={transferAmount} transferNote={transferNote} transferConfirmError={transferConfirmError}
                transferPin={transferPin} setTransferPin={setTransferPin} transferOtp={transferOtp} setTransferOtp={setTransferOtp}
                isTransferConfirmLoading={isTransferConfirmLoading} transferCountdown={transferCountdown} onConfirm={handleConfirmTransfer}
                handleVerifyTransferOtp={handleVerifyTransferOtp} handleResendTransferOtp={handleResendTransferOtp} parseNumberFromCommas={parseNumberFromCommas} userProfile={userProfile}
            />
        </div>
    )
}

export default Dashboard;