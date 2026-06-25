import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Warning } from '@phosphor-icons/react'
import ToastAlert from '../components/ToastAlert'

// Import Sub Panels
import OverviewPanel from './admin/OverviewPanel'
import UsersPanel from './admin/UsersPanel'
import KycPanel from './admin/KycPanel'
import WalletsPanel from './admin/WalletsPanel'
import TransactionsPanel from './admin/TransactionsPanel'
import AuditLogsPanel from './admin/AuditLogsPanel'
import SettingsPanel from './admin/SettingsPanel'

// Import Helper Components
import AdminSidebar from './admin/components/AdminSidebar'
import AdminHeader from './admin/components/AdminHeader'
import PinVerificationModal from './admin/components/PinVerificationModal'
import KycRejectionModal from './admin/components/KycRejectionModal'
import TransactionDetailsModal from './admin/components/TransactionDetailsModal'
import ImageInspectionModal from './admin/components/ImageInspectionModal'

import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()

  // Tab State: 'overview' | 'users' | 'kyc' | 'wallets' | 'transactions' | 'logs' | 'settings'
  const [activeTab, setActiveTab] = useState('overview')
  const [isLive, setIsLive] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true)

  // Shared Search & Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState('ALL')
  const [txStatusFilter, setTxStatusFilter] = useState('ALL')

  // Detailed Modal/Zoom overlay states
  const [selectedTx, setSelectedTx] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [rejectingKycId, setRejectingKycId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Toast Alerts State
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Core Admin Data States (Demo/Mock state)
  const [users, setUsers] = useState([
    { userId: 1, fullName: 'Nguyễn Bá Việt', email: 'vietnb@vtpay.local', phone: '0987654321', status: 'ACTIVE', kycStatus: 'APPROVED', vipLevel: 'Gold' },
    { userId: 2, fullName: 'Trần Thị Hoa', email: 'hoatt@gmail.com', phone: '0912345678', status: 'ACTIVE', kycStatus: 'PENDING', vipLevel: 'Silver' },
    { userId: 3, fullName: 'Lê Văn Nam', email: 'namlv@yahoo.com', phone: '0909876543', status: 'LOCKED', kycStatus: 'REJECTED', vipLevel: 'None' },
    { userId: 4, fullName: 'Phạm Minh Anh', email: 'anhtm@outlook.com', phone: '0977123456', status: 'ACTIVE', kycStatus: 'PENDING', vipLevel: 'None' }
  ])

  const [wallets, setWallets] = useState([
    { walletId: 86868686, userId: 1, balance: 42800000, status: 'ACTIVE' },
    { walletId: 10020033, userId: 2, balance: 1500000, status: 'ACTIVE' },
    { walletId: 44556677, userId: 3, balance: 0, status: 'FROZEN' },
    { walletId: 99887766, userId: 4, balance: 850000, status: 'ACTIVE' }
  ])

  const [kycRequests, setKycRequests] = useState([
    { kycId: 101, userId: 2, fullName: 'Trần Thị Hoa', citizenId: '001096001234', frontImage: 'https://picsum.photos/seed/kyc1/500/300', backImage: 'https://picsum.photos/seed/kyc2/500/300', selfieImage: 'https://picsum.photos/seed/kyc3/300/300', status: 'PENDING', date: '2026-06-25 10:30:15' },
    { kycId: 102, userId: 4, fullName: 'Phạm Minh Anh', citizenId: '002095009876', frontImage: 'https://picsum.photos/seed/kyc4/500/300', backImage: 'https://picsum.photos/seed/kyc5/500/300', selfieImage: 'https://picsum.photos/seed/kyc6/300/300', status: 'PENDING', date: '2026-06-25 14:15:22' }
  ])

  const [transactions, setTransactions] = useState([
    { transactionId: 'TX-1001', amount: -250000, type: 'TRANSFER', recipient: 'Số điện thoại 0912345678', senderWalletId: 86868686, date: '2026-06-25 15:45:00', status: 'SUCCESS', suspicious: false, note: 'Chuyển tiền ăn trưa' },
    { transactionId: 'TX-1002', amount: 1000000, type: 'TOPUP', recipient: 'Vietcombank', senderWalletId: 86868686, date: '2026-06-25 15:30:00', status: 'SUCCESS', suspicious: false, note: 'Nạp tiền vào ví' },
    { transactionId: 'TX-1003', amount: -5000000, type: 'WITHDRAW', recipient: 'BIDV Bank', senderWalletId: 86868686, date: '2026-06-25 12:15:00', status: 'SUCCESS', suspicious: true, note: 'Rút tiền ATM/Bank' },
    { transactionId: 'TX-1004', amount: -150000, type: 'TRANSFER', recipient: 'Số điện thoại 0909876543', senderWalletId: 10020033, date: '2026-06-25 11:00:00', status: 'SUCCESS', suspicious: false, note: 'Tieu vat' },
    { transactionId: 'TX-1005', amount: -20000000, type: 'TRANSFER', recipient: 'Số điện thoại 0987654321', senderWalletId: 44556677, date: '2026-06-24 09:12:00', status: 'FAILED', suspicious: true, note: 'Thử nghiệm giao dịch lớn' }
  ])

  const [auditLogs, setAuditLogs] = useState([
    { logId: 501, action: 'Đăng nhập hệ thống', actor: 'vietnb@vtpay.local (Admin)', date: '2026-06-25 15:00:00' },
    { logId: 502, action: 'Yêu cầu xác thực KYC mới', actor: 'hoatt@gmail.com (User)', date: '2026-06-25 10:30:15' },
    { logId: 503, action: 'Đóng băng tài khoản ví 44556677', actor: 'vietnb@vtpay.local (Admin)', date: '2026-06-24 10:00:00' }
  ])

  // Admin Security PIN Validation State
  const [pendingAction, setPendingAction] = useState(null)
  const [enteredPin, setEnteredPin] = useState('')
  const [pinVerifyError, setPinVerifyError] = useState('')
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('adminPin') || '868686')

  // QTV Settings Form State
  const [adminProfile, setAdminProfile] = useState({
    fullName: 'Nguyễn Bá Việt',
    email: 'vietnb@vtpay.local',
    phone: '0987654321',
    role: 'Quản trị viên hệ thống'
  })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [oldPinChange, setOldPinChange] = useState('')
  const [newPinChange, setNewPinChange] = useState('')
  const [confirmPinChange, setConfirmPinChange] = useState('')

  // Authentication & API live check
  useEffect(() => {
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('accessToken')

    if (!token || role !== 'ADMIN') {
      setIsAdminLoggedIn(false)
      navigate('/admin/login')
    } else {
      setIsAdminLoggedIn(true)
      probeLiveApi()
    }
  }, [navigate])

  const probeLiveApi = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setIsLive(true)
        fetchLiveAdminData()
      }
    } catch (err) {
      console.log('Backend API unreachable. Running in Demo Mock Mode.')
    }
  }

  const fetchLiveAdminData = async () => {
    const token = localStorage.getItem('accessToken')
    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      // 2. Fetch Transactions
      const txRes = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData)
      }

      // 3. Fetch Suspicious/Fraud Transactions
      const fraudRes = await fetch('/api/admin/fraud/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (fraudRes.ok) {
        const fraudData = await fraudRes.json()
        setTransactions(prev => prev.map(t => {
          const isFraud = fraudData.some(fd => fd.transactionId === t.transactionId)
          return { ...t, suspicious: isFraud }
        }))
      }

      // 4. Fetch Audit Logs
      const logsRes = await fetch('/api/admin/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setAuditLogs(logsData)
      }
    } catch (err) {
      console.error('Error fetching live data:', err)
    }
  }

  const handleLoginDemoAdmin = () => {
    localStorage.setItem('accessToken', 'mock-admin-token-8686')
    localStorage.setItem('role', 'ADMIN')
    localStorage.setItem('email', 'vietnb@vtpay.local')
    setIsAdminLoggedIn(true)
    showToast('Đăng nhập quản trị viên thành công (Tài khoản Demo)!')
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsAdminLoggedIn(false)
    navigate('/login')
  }

  // PIN Authorization Flow
  const requestPinAuthorization = (type, payload) => {
    setPendingAction({ type, payload })
    setEnteredPin('')
    setPinVerifyError('')
  }

  const handleConfirmPinVerification = (e) => {
    e.preventDefault()
    setPinVerifyError('')

    if (!enteredPin || enteredPin.length !== 6 || isNaN(enteredPin)) {
      setPinVerifyError('Mã PIN bảo mật phải gồm 6 chữ số.')
      return
    }

    if (enteredPin !== adminPin) {
      setPinVerifyError('Mã PIN bảo mật QTV không chính xác.')
      return
    }

    // Correct PIN: execute action
    const { type, payload } = pendingAction
    executeAuthorizedAction(type, payload)
    
    setPendingAction(null)
    setEnteredPin('')
  }

  const executeAuthorizedAction = (type, payload) => {
    switch (type) {
      case 'LOCK_UNLOCK_USER':
        executeLockUnlockUser(payload.userId, payload.status)
        break
      case 'FREEZE_UNFREEZE_WALLET':
        executeFreezeUnfreezeWallet(payload.walletId, payload.status)
        break
      case 'APPROVE_KYC':
        executeVerifyKyc(payload.kycId, payload.userId, true)
        break
      case 'REJECT_KYC':
        executeVerifyKyc(payload.kycId, payload.userId, false, payload.reason)
        break
      case 'TOGGLE_SUSPICIOUS_TX':
        executeToggleSuspiciousTx(payload.transactionId, payload.suspicious)
        break
      case 'FAIL_TRANSACTION':
        executeFailTransaction(payload.transactionId)
        break
      default:
        break
    }
  }

  // Admin Actions execution logic
  const executeLockUnlockUser = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
    const actionUrl = `/api/admin/users/${userId}/${currentStatus === 'ACTIVE' ? 'lock' : 'unlock'}`
    const token = localStorage.getItem('accessToken')

    try {
      if (isLive) {
        const response = await fetch(actionUrl, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) {
          showToast('Không thể thực hiện hành động trên API thực.', 'error')
          return
        }
      }

      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status: nextStatus } : u))
      
      if (nextStatus === 'LOCKED') {
        setWallets(prev => prev.map(w => w.userId === userId ? { ...w, status: 'FROZEN' } : w))
      }

      const newLog = {
        logId: Date.now(),
        action: `${nextStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản người dùng ID ${userId}`,
        actor: 'vietnb@vtpay.local (Admin)',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      setAuditLogs(prev => [newLog, ...prev])

      showToast(`Đã ${nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản người dùng thành công!`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi kết nối mạng.', 'error')
    }
  }

  const executeFreezeUnfreezeWallet = async (walletId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE'
    const actionUrl = `/api/admin/wallets/${currentStatus === 'ACTIVE' ? 'freeze' : 'unfreeze'}`
    const token = localStorage.getItem('accessToken')

    try {
      if (isLive) {
        const response = await fetch(actionUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ walletId })
        })
        if (!response.ok) {
          showToast('Không thể thực hiện đóng băng ví trên API thực.', 'error')
          return
        }
      }

      setWallets(prev => prev.map(w => w.walletId === walletId ? { ...w, status: nextStatus } : w))

      const newLog = {
        logId: Date.now(),
        action: `${nextStatus === 'FROZEN' ? 'Đóng băng' : 'Mở băng'} ví điện tử ${walletId}`,
        actor: 'vietnb@vtpay.local (Admin)',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      setAuditLogs(prev => [newLog, ...prev])

      showToast(`Đã ${nextStatus === 'FROZEN' ? 'đóng băng' : 'mở khóa'} ví thành công!`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi kết nối mạng.', 'error')
    }
  }

  const executeVerifyKyc = async (kycId, userId, approved, reason = '') => {
    const actionUrl = `/api/admin/kyc/${kycId}/${approved ? 'approve' : 'reject'}`
    const token = localStorage.getItem('accessToken')
    const finalReason = approved ? '' : (reason || rejectionReason)

    try {
      if (isLive) {
        const response = await fetch(actionUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: finalReason })
        })
        if (!response.ok) {
          showToast('Không thể thực hiện phê duyệt KYC trên API.', 'error')
          return
        }
      }

      setKycRequests(prev => prev.map(k => k.kycId === kycId ? { ...k, status: approved ? 'APPROVED' : 'REJECTED' } : k))
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, kycStatus: approved ? 'APPROVED' : 'REJECTED' } : u))

      const newLog = {
        logId: Date.now(),
        action: `${approved ? 'Phê duyệt' : 'Từ chối'} hồ sơ KYC ID ${kycId} (User ID ${userId})${!approved ? `. Lý do: ${finalReason}` : ''}`,
        actor: 'vietnb@vtpay.local (Admin)',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      setAuditLogs(prev => [newLog, ...prev])

      showToast(`Đã ${approved ? 'duyệt' : 'từ chối'} yêu cầu KYC thành công!`)
      setRejectingKycId(null)
      setRejectionReason('')
    } catch (err) {
      console.error(err)
      showToast('Lỗi kết nối mạng.', 'error')
    }
  }

  const executeToggleSuspiciousTx = async (transactionId, currentSuspicious) => {
    const token = localStorage.getItem('accessToken')
    const actionUrl = `/api/admin/fraud/${currentSuspicious ? 'unflag' : 'flag'}`

    try {
      if (isLive) {
        const response = await fetch(actionUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ transactionId })
        })
        if (!response.ok) {
          showToast('Lỗi khi thực hiện trên API.', 'error')
          return
        }
      }

      setTransactions(prev => prev.map(t => t.transactionId === transactionId ? { ...t, suspicious: !currentSuspicious } : t))

      const newLog = {
        logId: Date.now(),
        action: `${!currentSuspicious ? 'Đánh dấu nghi vấn' : 'Gỡ bỏ nghi vấn'} giao dịch ${transactionId}`,
        actor: 'vietnb@vtpay.local (Admin)',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      setAuditLogs(prev => [newLog, ...prev])

      showToast(`${!currentSuspicious ? 'Đã đánh dấu nghi vấn' : 'Đã gỡ bỏ nghi vấn'} giao dịch!`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi kết nối mạng.', 'error')
    }
  }

  const executeFailTransaction = async (transactionId) => {
    const token = localStorage.getItem('accessToken')
    const actionUrl = `/api/admin/transactions/${transactionId}/fail`

    try {
      if (isLive) {
        const response = await fetch(actionUrl, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) {
          showToast('Lỗi khi thực hiện trên API.', 'error')
          return
        }
      }

      setTransactions(prev => prev.map(t => t.transactionId === transactionId ? { ...t, status: 'FAILED' } : t))

      const newLog = {
        logId: Date.now(),
        action: `Đánh dấu thất bại giao dịch ${transactionId}`,
        actor: 'vietnb@vtpay.local (Admin)',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      setAuditLogs(prev => [newLog, ...prev])

      showToast(`Đã đánh dấu giao dịch ${transactionId} thất bại thành công!`)
      if (selectedTx) {
        setSelectedTx(prev => ({ ...prev, status: 'FAILED' }))
      }
    } catch (err) {
      console.error(err)
      showToast('Lỗi kết nối mạng.', 'error')
    }
  }

  // Settings modification handlers
  const handleAdminPasswordChange = (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng nhập đầy đủ mật khẩu.', 'warning')
      return
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải từ 6 ký tự trở lên.', 'warning')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp.', 'warning')
      return
    }

    showToast('Đổi mật khẩu tài khoản quản trị thành công!')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')

    const newLog = {
      logId: Date.now(),
      action: 'Thay đổi mật khẩu tài khoản quản trị',
      actor: 'vietnb@vtpay.local (Admin)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  const handleAdminPinChange = (e) => {
    e.preventDefault()
    if (!oldPinChange || !newPinChange || !confirmPinChange) {
      showToast('Vui lòng nhập đầy đủ mã PIN.', 'warning')
      return
    }
    if (oldPinChange !== adminPin) {
      showToast('Mã PIN bảo mật hiện tại không chính xác.', 'error')
      return
    }
    if (newPinChange.length !== 6 || isNaN(newPinChange)) {
      showToast('Mã PIN mới phải gồm 6 chữ số.', 'warning')
      return
    }
    if (newPinChange !== confirmPinChange) {
      showToast('Xác nhận mã PIN mới không trùng khớp.', 'warning')
      return
    }

    setAdminPin(newPinChange)
    localStorage.setItem('adminPin', newPinChange)
    showToast('Thay đổi mã PIN bảo mật quản trị thành công!')
    setOldPinChange('')
    setNewPinChange('')
    setConfirmPinChange('')

    const newLog = {
      logId: Date.now(),
      action: 'Thay đổi mã PIN bảo mật quản trị viên',
      actor: 'vietnb@vtpay.local (Admin)',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  // Locked out Access Denied view
  if (!isAdminLoggedIn) {
    return (
      <div className="auth-page" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#07172f' }}>
        <div className="auth-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '64px', height: '64px', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Warning size={32} weight="bold" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 12px' }}>
            Yêu cầu quyền truy cập
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 28px' }}>
            Bạn đang truy cập vào cổng quản lý VT Pay. Trang này chỉ dành riêng cho Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản có quyền Admin để tiếp tục.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/admin/login" className="auth-btn" style={{ minHeight: '48px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Đi tới trang Đăng nhập Admin
            </Link>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', marginTop: '8px' }}>
              Quay lại trang đăng nhập User
            </Link>
          </div>
        </div>
        {toast && <ToastAlert message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSearchTerm={setSearchTerm}
        setTxTypeFilter={setTxTypeFilter}
        setTxStatusFilter={setTxStatusFilter}
        kycRequests={kycRequests}
        transactions={transactions}
      />

      <main className="admin-main">
        <AdminHeader
          activeTab={activeTab}
          isLive={isLive}
          handleLogout={handleLogout}
        />

        <div className="admin-content">
          {activeTab === 'overview' && (
            <OverviewPanel
              users={users}
              kycRequests={kycRequests}
              wallets={wallets}
              transactions={transactions}
              auditLogs={auditLogs}
              setSelectedTx={setSelectedTx}
            />
          )}

          {activeTab === 'users' && (
            <UsersPanel
              users={users}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              requestPinAuthorization={requestPinAuthorization}
            />
          )}

          {activeTab === 'kyc' && (
            <KycPanel
              kycRequests={kycRequests}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              requestPinAuthorization={requestPinAuthorization}
              setZoomedImage={setZoomedImage}
              setRejectingKycId={setRejectingKycId}
            />
          )}

          {activeTab === 'wallets' && (
            <WalletsPanel
              wallets={wallets}
              users={users}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              requestPinAuthorization={requestPinAuthorization}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPanel
              transactions={transactions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              txTypeFilter={txTypeFilter}
              setTxTypeFilter={setTxTypeFilter}
              txStatusFilter={txStatusFilter}
              setTxStatusFilter={setTxStatusFilter}
              requestPinAuthorization={requestPinAuthorization}
              setSelectedTx={setSelectedTx}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogsPanel
              auditLogs={auditLogs}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              adminProfile={adminProfile}
              oldPassword={oldPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              setOldPassword={setOldPassword}
              setNewPassword={setNewPassword}
              setConfirmPassword={setConfirmPassword}
              handleAdminPasswordChange={handleAdminPasswordChange}
              oldPinChange={oldPinChange}
              newPinChange={newPinChange}
              confirmPinChange={confirmPinChange}
              setOldPinChange={setOldPinChange}
              setNewPinChange={setNewPinChange}
              setConfirmPinChange={setConfirmPinChange}
              handleAdminPinChange={handleAdminPinChange}
            />
          )}
        </div>
      </main>

      <ImageInspectionModal
        zoomedImage={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />

      <KycRejectionModal
        isOpen={rejectingKycId !== null}
        onClose={() => { setRejectingKycId(null); setRejectionReason(''); }}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={() => requestPinAuthorization('REJECT_KYC', { kycId: rejectingKycId.kycId, userId: rejectingKycId.userId, reason: rejectionReason })}
      />

      <TransactionDetailsModal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        selectedTx={selectedTx}
        requestPinAuthorization={requestPinAuthorization}
      />

      <PinVerificationModal
        isOpen={pendingAction !== null}
        onClose={() => { setPendingAction(null); setEnteredPin(''); setPinVerifyError(''); }}
        enteredPin={enteredPin}
        setEnteredPin={setEnteredPin}
        pinVerifyError={pinVerifyError}
        onSubmit={handleConfirmPinVerification}
      />

      {toast && <ToastAlert message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

