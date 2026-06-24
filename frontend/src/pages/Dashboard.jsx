import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ArrowsLeftRight,
  TrendUp,
  TrendDown,
  Clock,
  User,
  Gear,
  Bell,
  DeviceMobile,
  Laptop,
  CheckCircle,
  Warning,
  UploadSimple
} from '@phosphor-icons/react'
import Sidebar from '../components/Sidebar'
import ToastAlert from '../components/ToastAlert'
import Modal from '../components/Modal'
import FormInput from '../components/FormInput'
import './Dashboard.css'

const calculateRemainingSeconds = (expiryTimeStr) => {
  if (!expiryTimeStr) return 0
  const remaining = Math.ceil((parseInt(expiryTimeStr, 10) - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}

function Dashboard() {
  const navigate = useNavigate()
  
  // App states
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Đăng nhập mới', content: 'Tài khoản ví của bạn đã được đăng nhập từ thiết bị Windows.', time: '5 phút trước', read: false },
    { id: 2, title: 'Nạp tiền thành công', content: 'Bạn vừa nạp thành công 2.000.000đ từ ngân hàng Vietcombank.', time: '2 giờ trước', read: true }
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  // Modals state
  const [modalType, setModalType] = useState(null) // 'topup', 'withdraw', 'password', 'pin'
  const [modalAmount, setModalAmount] = useState('')
  const [modalPassword, setModalPassword] = useState({ old: '', new: '', confirm: '' })
  const [modalPin, setModalPin] = useState({ old: '', new: '', confirm: '' })

  // Core Data States (Fallback to mock data if backend not active)
  const [userProfile, setUserProfile] = useState({
    fullName: 'Nguyễn Bá Việt',
    email: 'vietnb@vtpay.local',
    phone: '0987654321',
    citizenId: '001096008686',
    kycStatus: 'APPROVED', // APPROVED, PENDING, REJECTED
    status: 'ACTIVE'
  })

  const [wallet, setWallet] = useState({
    balance: 42800000,
    walletId: 86868686,
    currency: 'đ',
    lastLogin: '2026-06-25 00:47:26'
  })

  const [transactions, setTransactions] = useState([
    { id: 'TX-1092', recipient: 'Coffee Lab', amount: -48000, type: 'TRANSFER', date: '2026-06-24 22:15:30', status: 'SUCCESS' },
    { id: 'TX-1091', recipient: 'Nạp tiền Vietcombank', amount: 2000000, type: 'TOPUP', date: '2026-06-24 18:30:12', status: 'SUCCESS' },
    { id: 'TX-1090', recipient: 'Lê Hoàng Anh', amount: 500000, type: 'TRANSFER', date: '2026-06-24 14:12:05', status: 'SUCCESS' },
    { id: 'TX-1089', recipient: 'Thanh toán tiền điện', amount: -320000, type: 'WITHDRAW', date: '2026-06-23 09:45:00', status: 'SUCCESS' },
    { id: 'TX-1088', recipient: 'Trần Thị Thu', amount: -150000, type: 'TRANSFER', date: '2026-06-22 19:20:44', status: 'FAILED' }
  ])

  // Filters State
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterDate, setFilterDate] = useState('ALL')

  // Transfer Form State
  const [transferPhone, setTransferPhone] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferNote, setTransferNote] = useState('')
  const [transferError, setTransferError] = useState('')
  const [transferLoading] = useState(false)

  // Devices & Login History (Section 7)
  const [devices, setDevices] = useState([
    { id: 1, name: 'Chrome - Windows (Thiết bị này)', type: 'desktop', lastLogin: '2026-06-25 00:47:26' },
    { id: 2, name: 'Safari - iPhone 14 Pro', type: 'mobile', lastLogin: '2026-06-24 15:30:10' }
  ])

  const [loginHistory] = useState([
    { ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-25 00:47:26', status: 'Thành công' },
    { ip: '113.190.233.12', device: 'Safari - iPhone 14 Pro', time: '2026-06-24 15:30:10', status: 'Thành công' },
    { ip: '14.161.42.105', device: 'Chrome - Windows', time: '2026-06-23 18:22:45', status: 'Thành công' }
  ])

  // Document Upload State (Section 5)
  const [kycFiles, setKycFiles] = useState({
    front: null,
    back: null,
    selfie: null
  })

  // Bank accounts linking state
  const [linkedBanks, setLinkedBanks] = useState([
    { id: 'VCB-8686', bankName: 'Vietcombank', logo: 'VCB', accountNumber: '100986868686', cardHolder: 'NGUYEN BA VIET', linkedDate: '2026-06-20' }
  ])
  const [selectedBank, setSelectedBank] = useState('VCB') // 'VCB', 'TCB', 'BIDV', 'ACB', 'TPB'
  const [bankAccountNo, setBankAccountNo] = useState('')
  const [bankPhone, setBankPhone] = useState(userProfile ? userProfile.phone : '')
  const [bankOtp, setBankOtp] = useState('')
  const [linkingError, setLinkingError] = useState('')
  const [linkingStep, setLinkingStep] = useState(1) // 1: input info, 2: OTP verify
  const [isLinkingLoading, setIsLinkingLoading] = useState(false)

  // Bank accounts unlinking state
  const [unlinkBankTarget, setUnlinkBankTarget] = useState(null)
  const [unlinkOtp, setUnlinkOtp] = useState('')
  const [unlinkError, setUnlinkError] = useState('')
  const [isUnlinkingLoading, setIsUnlinkingLoading] = useState(false)

  // Bank OTP countdown states
  const [linkingCountdown, setLinkingCountdown] = useState(0)
  const [unlinkCountdown, setUnlinkCountdown] = useState(0)

  // Topup PIN States
  const [topupStep, setTopupStep] = useState(1) // 1: input amount, 2: verify PIN
  const [topupPin, setTopupPin] = useState('')
  const [topupError, setTopupError] = useState('')
  const [isTopupLoading, setIsTopupLoading] = useState(false)

  // Transfer Confirmation PIN States
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [transferPin, setTransferPin] = useState('')
  const [transferConfirmError, setTransferConfirmError] = useState('')
  const [isTransferConfirmLoading, setIsTransferConfirmLoading] = useState(false)

  // Trigger brief toast alert
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  // Fetch Live Data on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken')
      const userId = localStorage.getItem('userId')
      
      if (!token || !userId) {
        setLoading(false)
        return
      }

      try {
        // 1. Fetch Profile
        const profileRes = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const profileData = await profileRes.json()
        
        if (profileRes.ok && !profileData.errorCode) {
          setUserProfile({
            fullName: profileData.fullName || 'Nguyễn Bá Việt',
            email: profileData.email || 'vietnb@vtpay.local',
            phone: profileData.phone || '0987654321',
            citizenId: profileData.citizenId || '001096008686',
            kycStatus: profileData.kycStatus || 'APPROVED',
            status: 'ACTIVE'
          })
          setIsLive(true)
        }

        // 2. Fetch Wallet Balance
        const walletRes = await fetch('/api/wallets', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const walletData = await walletRes.json()
        
        if (walletRes.ok && !walletData.errorCode) {
          setWallet({
            balance: walletData.balance || 42800000,
            walletId: walletData.walletId || 86868686,
            currency: walletData.currency || 'đ',
            lastLogin: '2026-06-25 00:47:26'
          })
        }

        // 3. Fetch Transactions History
        const transRes = await fetch('/api/transactions/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const transData = await transRes.json()
        
        if (transRes.ok && !transData.errorCode && Array.isArray(transData.transactions)) {
          setTransactions(transData.transactions.map(t => ({
            id: t.transactionId || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
            recipient: t.type === 'TOPUP' ? 'Nạp tiền ngân hàng' : (t.type === 'WITHDRAW' ? 'Rút tiền ngân hàng' : t.recipientPhone || 'Ví VT Pay'),
            amount: t.type === 'TOPUP' ? t.amount : -t.amount,
            type: t.type,
            date: t.transactionDate || new Date().toISOString(),
            status: t.status || 'SUCCESS'
          })))
        }

      } catch (err) {
        console.warn('Backend server not connected. Running Dashboard on fully interactive Mock mode.', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Keyboard shortcuts listener for switching tabs (Alt + 1, Alt + 2, etc.)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        setActiveTab('overview')
      } else if (e.altKey && e.key === '2') {
        e.preventDefault()
        setActiveTab('transactions')
      } else if (e.altKey && e.key === '3') {
        e.preventDefault()
        setActiveTab('bank')
      } else if (e.altKey && e.key === '4') {
        e.preventDefault()
        setActiveTab('kyc')
      } else if (e.altKey && e.key === '5') {
        e.preventDefault()
        setActiveTab('profile')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Timer for linking bank OTP countdown
  useEffect(() => {
    if (linkingCountdown <= 0) return
    const timer = setInterval(() => {
      setLinkingCountdown(prev => {
        if (prev <= 1) {
          localStorage.removeItem('linkingOtpExpiryTime')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [linkingCountdown])

  // Timer for unlinking bank OTP countdown
  useEffect(() => {
    if (unlinkCountdown <= 0) return
    const timer = setInterval(() => {
      setUnlinkCountdown(prev => {
        if (prev <= 1) {
          localStorage.removeItem('unlinkOtpExpiryTime')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [unlinkCountdown])

  // Initialize and sync countdown timers from localStorage on mount
  useEffect(() => {
    const syncCountdown = (key, setCountdown) => {
      const expiry = localStorage.getItem(key)
      if (expiry) {
        setCountdown(calculateRemainingSeconds(expiry))
      }
    }
    syncCountdown('linkingOtpExpiryTime', setLinkingCountdown)
    syncCountdown('unlinkOtpExpiryTime', setUnlinkCountdown)
  }, [])

  // Handle bank accounts linking
  const handleLinkBankSubmit = (e) => {
    e.preventDefault()
    setLinkingError('')

    if (!bankAccountNo || bankAccountNo.length < 6) {
      setLinkingError('Số tài khoản ngân hàng không hợp lệ (tối thiểu 6 chữ số).')
      return
    }
    if (!bankPhone) {
      setLinkingError('Vui lòng nhập số điện thoại đăng ký.')
      return
    }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(bankPhone)) {
      setLinkingError('Số điện thoại đăng ký không đúng định dạng.')
      return
    }

    setIsLinkingLoading(true)
    setTimeout(() => {
      setIsLinkingLoading(false)
      setLinkingStep(2) // Move to OTP
      
      const expiryTime = Date.now() + 60 * 1000
      localStorage.setItem('linkingOtpExpiryTime', expiryTime.toString())
      setLinkingCountdown(60) // Start 60s countdown
      showToast('Đã gửi mã OTP xác thực liên kết ngân hàng!', 'warning')
    }, 1200)
  }

  const handleResendLinkingOtp = () => {
    if (linkingCountdown > 0) return
    const expiryTime = Date.now() + 60 * 1000
    localStorage.setItem('linkingOtpExpiryTime', expiryTime.toString())
    setLinkingCountdown(60)
    showToast('Đã gửi lại mã OTP xác thực liên kết ngân hàng!', 'warning')
  }

  const handleVerifyBankOtp = (e) => {
    e.preventDefault()
    setLinkingError('')

    const expiry = localStorage.getItem('linkingOtpExpiryTime')
    if (!expiry) {
      setLinkingError('Vui lòng click "Gửi mã" để nhận mã OTP trước.')
      return
    }

    if (!bankOtp || bankOtp.length !== 6 || isNaN(bankOtp)) {
      setLinkingError('Mã OTP xác thực phải gồm 6 chữ số.')
      return
    }

    setIsLinkingLoading(true)
    setTimeout(() => {
      setIsLinkingLoading(false)
      const bankNameMap = {
        VCB: 'Vietcombank',
        TCB: 'Techcombank',
        BIDV: 'BIDV Bank',
        ACB: 'ACB Bank',
        TPB: 'TPBank'
      }

      const newBank = {
        id: `${selectedBank}-${Math.floor(1000 + Math.random() * 9000)}`,
        bankName: bankNameMap[selectedBank] || 'Ngân hàng',
        logo: selectedBank,
        accountNumber: bankAccountNo,
        cardHolder: userProfile.fullName.toUpperCase(),
        linkedDate: new Date().toISOString().substring(0, 10)
      }

      setLinkedBanks(prev => [...prev, newBank])
      showToast(`Liên kết tài khoản ${newBank.bankName} thành công!`)
      
      // Reset form
      localStorage.removeItem('linkingOtpExpiryTime')
      setBankAccountNo('')
      setBankOtp('')
      setLinkingStep(1)
    }, 1500)
  }

  const handleUnlinkBank = (card) => {
    setUnlinkBankTarget(card)
    setUnlinkOtp('')
    setUnlinkError('')
    
    // OTP is not sent automatically on modal open anymore
    const expiry = localStorage.getItem('unlinkOtpExpiryTime')
    setUnlinkCountdown(calculateRemainingSeconds(expiry))
  }

  const handleResendUnlinkOtp = () => {
    if (unlinkCountdown > 0) return
    const expiryTime = Date.now() + 60 * 1000
    localStorage.setItem('unlinkOtpExpiryTime', expiryTime.toString())
    setUnlinkCountdown(60)
    showToast('Mã OTP hủy liên kết đã được gửi qua SMS!', 'warning')
  }

  const handleVerifyUnlinkOtp = (e) => {
    e.preventDefault()
    setUnlinkError('')

    const expiry = localStorage.getItem('unlinkOtpExpiryTime')
    if (!expiry) {
      setUnlinkError('Vui lòng click "Gửi mã" để nhận OTP qua SMS trước.')
      return
    }

    if (!unlinkOtp || unlinkOtp.length !== 6 || isNaN(unlinkOtp)) {
      setUnlinkError('Mã OTP xác thực phải gồm 6 chữ số.')
      return
    }

    setIsUnlinkingLoading(true)
    setTimeout(() => {
      setIsUnlinkingLoading(false)
      setLinkedBanks(prev => prev.filter(b => b.id !== unlinkBankTarget.id))
      showToast(`Đã hủy liên kết tài khoản ${unlinkBankTarget.bankName} thành công!`)
      
      localStorage.removeItem('unlinkOtpExpiryTime')
      setUnlinkBankTarget(null)
      setUnlinkOtp('')
    }, 1500)
  }

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear()
    showToast('Đăng xuất thành công!')
    setTimeout(() => {
      navigate('/login')
    }, 500)
  }

  // Handle Quick Transfer Submission (Triggers PIN Confirmation Modal)
  const handleTransfer = (e) => {
    e.preventDefault()
    setTransferError('')

    if (!transferPhone) {
      setTransferError('Vui lòng nhập số điện thoại người nhận.')
      return
    }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(transferPhone)) {
      setTransferError('Số điện thoại không đúng định dạng.')
      return
    }
    if (!transferAmount || isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
      setTransferError('Vui lòng nhập số tiền hợp lệ.')
      return
    }
    
    const amountVal = parseFloat(transferAmount)
    if (amountVal > wallet.balance) {
      setTransferError('Số dư khả dụng trong ví không đủ để thực hiện giao dịch.')
      return
    }

    // Input checks passed, open confirmation modal
    setShowTransferConfirm(true)
    setTransferPin('')
    setTransferConfirmError('')
  }

  // Handle Verify Transfer PIN Submission
  const handleVerifyTransferPin = async (e) => {
    e.preventDefault()
    setTransferConfirmError('')

    if (!transferPin || transferPin.length !== 6 || isNaN(transferPin)) {
      setTransferConfirmError('Mã PIN giao dịch phải gồm 6 chữ số.')
      return
    }

    setIsTransferConfirmLoading(true)
    const amountVal = parseFloat(transferAmount)

    try {
      const token = localStorage.getItem('accessToken')
      if (isLive && token) {
        const response = await fetch('/api/transactions/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            senderWalletId: wallet.walletId,
            receiverPhoneNumber: transferPhone,
            amount: amountVal,
            pin: transferPin
          })
        })
        const resData = await response.json()
        if (!response.ok || resData.errorCode) {
          setTransferConfirmError(resData.message || 'Chuyển tiền thất bại. Vui lòng kiểm tra lại mã PIN hoặc người nhận.')
          setIsTransferConfirmLoading(false)
          return
        }
      } else {
        // Mock PIN validation for demo: simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Successful Transfer
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        recipient: `Số điện thoại ${transferPhone}`,
        amount: -amountVal,
        type: 'TRANSFER',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS'
      }

      setWallet(prev => ({ ...prev, balance: prev.balance - amountVal }))
      setTransactions(prev => [newTx, ...prev])
      showToast(`Chuyển khoản thành công ${amountVal.toLocaleString()}đ tới ${transferPhone}!`)
      
      // Reset transfer inputs
      setTransferPhone('')
      setTransferAmount('')
      setTransferNote('')
      
      // Close confirmation modal
      setShowTransferConfirm(false)
      setTransferPin('')
    } catch (err) {
      console.error(err)
      setTransferConfirmError('Lỗi kết nối mạng. Không thể thực hiện chuyển tiền.')
    } finally {
      setIsTransferConfirmLoading(false)
    }
  }

  // Handle Topup 2-Step verification
  const handleTopupAmountSubmit = (e) => {
    e.preventDefault()
    setTopupError('')

    if (!modalAmount || isNaN(modalAmount) || parseFloat(modalAmount) <= 0) {
      setTopupError('Vui lòng nhập số tiền nạp hợp lệ.')
      return
    }

    setTopupStep(2)
    setTopupPin('')
  }

  const handleVerifyTopupPin = (e) => {
    e.preventDefault()
    setTopupError('')

    if (!topupPin || topupPin.length !== 6 || isNaN(topupPin)) {
      setTopupError('Mã PIN giao dịch phải gồm 6 chữ số.')
      return
    }

    setIsTopupLoading(true)
    setTimeout(() => {
      setIsTopupLoading(false)

      const amountVal = parseFloat(modalAmount)
      setWallet(prev => ({ ...prev, balance: prev.balance + amountVal }))
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        recipient: 'Nạp tiền Vietcombank',
        amount: amountVal,
        type: 'TOPUP',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS'
      }
      setTransactions(prev => [newTx, ...prev])
      showToast(`Nạp thành công ${amountVal.toLocaleString()}đ vào ví!`)

      setModalAmount('')
      setTopupPin('')
      setModalType(null)
      setTopupStep(1)
    }, 1500)
  }

  // Handle Quick Deposit / Withdrawal Modal actions
  const handleModalActionSubmit = (e) => {
    e.preventDefault()
    if (!modalAmount || isNaN(modalAmount) || parseFloat(modalAmount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ.')
      return
    }

    const amountVal = parseFloat(modalAmount)

    if (modalType === 'withdraw') {
      if (amountVal > wallet.balance) {
        alert('Số dư tài khoản ví không đủ.')
        return
      }
      setWallet(prev => ({ ...prev, balance: prev.balance - amountVal }))
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        recipient: 'Rút tiền ATM/Bank',
        amount: -amountVal,
        type: 'WITHDRAW',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS'
      }
      setTransactions(prev => [newTx, ...prev])
      showToast(`Rút thành công ${amountVal.toLocaleString()}đ về tài khoản!`)
    }

    setModalAmount('')
    setModalType(null)
  }

  // Handle mock Document KYC submission
  const triggerKycUpload = (type) => {
    // Generate simulated upload url
    setKycFiles(prev => ({
      ...prev,
      [type]: 'https://picsum.photos/seed/document/400/250'
    }))
    showToast(`Đã tải lên tệp ảnh tài liệu ${type === 'front' ? 'Mặt trước CCCD' : (type === 'back' ? 'Mặt sau CCCD' : 'Ảnh Selfie')}!`)
  }

  const handleKycSubmit = () => {
    if (!kycFiles.front || !kycFiles.back || !kycFiles.selfie) {
      alert('Vui lòng tải lên đầy đủ: Mặt trước CCCD, Mặt sau CCCD và Ảnh Selfie để gửi duyệt.')
      return
    }
    setUserProfile(prev => ({ ...prev, kycStatus: 'PENDING' }))
    showToast('Hồ sơ xác thực KYC đã được gửi đi và đang đợi phê duyệt.', 'warning')
  }

  // Handle mock Password / PIN reset
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault()
    if (!modalPassword.old || !modalPassword.new) {
      alert('Vui lòng điền đầy đủ các thông tin.')
      return
    }
    if (modalPassword.new !== modalPassword.confirm) {
      alert('Xác nhận mật khẩu mới không khớp.')
      return
    }
    showToast('Đã đổi mật khẩu ví thành công!')
    setModalPassword({ old: '', new: '', confirm: '' })
    setModalType(null)
  }

  const handlePinChangeSubmit = (e) => {
    e.preventDefault()
    if (!modalPin.old || !modalPin.new) {
      alert('Vui lòng điền đầy đủ thông tin.')
      return
    }
    if (modalPin.new !== modalPin.confirm) {
      alert('Xác nhận mã PIN không khớp.')
      return
    }
    showToast('Đã thay đổi mã PIN giao dịch thành công!')
    setModalPin({ old: '', new: '', confirm: '' })
    setModalType(null)
  }

  // Handle mock device removal
  const removeDevice = (id, name) => {
    setDevices(prev => prev.filter(d => d.id !== id))
    showToast(`Đã thu hồi quyền truy cập của thiết bị: ${name}`)
  }

  // Filter Transactions list dynamically
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
    
    if (filterDate !== 'ALL') {
      const today = new Date()
      const txDate = new Date(t.date)
      const diffTime = Math.abs(today - txDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (filterDate === 'TODAY' && diffDays > 1) return false
      if (filterDate === 'WEEK' && diffDays > 7) return false
      if (filterDate === 'MONTH' && diffDays > 30) return false
    }
    
    return true
  })

  // Format Helper for currency
  const formatCurrency = (val) => {
    return Math.abs(val).toLocaleString() + wallet.currency
  }

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
      {/* Toast Alert Notification */}
      <ToastAlert show={toast.show} message={toast.message} type={toast.type} />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Panel */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>
              {activeTab === 'overview' && 'Tổng quan tài chính'}
              {activeTab === 'transactions' && 'Giao dịch chuyển tiền'}
              {activeTab === 'bank' && 'Liên kết tài khoản ngân hàng'}
              {activeTab === 'kyc' && 'Thông tin xác thực danh tính'}
              {activeTab === 'profile' && 'Hồ sơ bảo mật'}
            </h1>
          </div>

          <div className="header-actions">
            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="header-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} weight="bold" />
                {notifications.some(n => !n.read) && <span className="header-icon-badge">1</span>}
              </button>
              
              {showNotifications && (
                <div style={{ position: 'absolute', top: '50px', right: 0, width: '320px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', zIndex: 10, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Thông báo mới nhất</strong>
                    <button style={{ border: 'none', background: 'none', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                      showToast('Đã đọc toàn bộ thông báo!')
                    }}>Đọc tất cả</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ fontSize: '0.82rem', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', opacity: n.read ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{n.title}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{n.time}</span>
                        </div>
                        <p style={{ color: 'var(--muted)', margin: 0 }}>{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="header-icon-btn" onClick={() => setActiveTab('profile')}>
              <Gear size={20} weight="bold" />
            </button>

            {/* Profile Avatar (Top Header) */}
            <div className="header-user">
              <div className="user-avatar">
                {userProfile.fullName.split(' ').pop().substring(0, 2).toUpperCase()}
              </div>
              <div className="user-info">
                <strong>{userProfile.fullName}</strong>
                <span>{isLive ? 'Live Connection' : 'Mock Mode'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content panels */}
        <div className="dashboard-content">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-panel">
              {/* Wallet overview grid (Section 1) */}
              <div className="wallet-overview-grid">
                <div className="wallet-card">
                  <div className="wallet-card-header">
                    <span className="wallet-label">Số dư khả dụng</span>
                    <div className="wallet-id">
                      <span>ID: {wallet.walletId}</span>
                    </div>
                  </div>
                  <div className="wallet-balance">
                    <h2>{wallet.balance.toLocaleString()}đ</h2>
                  </div>
                  <div className="wallet-card-footer">
                    <div>
                      <span style={{ fontSize: '0.78rem', display: 'block', opacity: 0.8, marginBottom: '2px' }}>Đăng nhập gần nhất</span>
                      <strong>{wallet.lastLogin}</strong>
                    </div>
                    <div className={`wallet-kyc ${userProfile.kycStatus === 'APPROVED' ? 'verified' : (userProfile.kycStatus === 'PENDING' ? 'pending' : 'rejected')}`}>
                      {userProfile.kycStatus === 'APPROVED' && 'Đã xác thực KYC'}
                      {userProfile.kycStatus === 'PENDING' && 'KYC Đang duyệt'}
                      {userProfile.kycStatus === 'REJECTED' && 'KYC Bị Từ Chối'}
                    </div>
                  </div>
                </div>

                <div className="quick-actions-panel">
                  <h3>Giao dịch nhanh</h3>
                  <div className="actions-grid">
                    <button className="action-btn" onClick={() => {
                      setModalType('topup')
                      setTopupStep(1)
                      setModalAmount('')
                      setTopupPin('')
                      setTopupError('')
                    }}>
                      <ArrowDownLeft size={22} weight="bold" />
                      Nạp tiền
                    </button>
                    <button className="action-btn" onClick={() => setModalType('withdraw')}>
                      <ArrowUpRight size={22} weight="bold" />
                      Rút tiền
                    </button>
                    <button className="action-btn" onClick={() => setActiveTab('transactions')}>
                      <ArrowsLeftRight size={22} weight="bold" />
                      Chuyển khoản
                    </button>
                    <button className="action-btn" onClick={() => alert('Quét QR: Tính năng giả lập quét camera trên thiết bị di động.')}>
                      <QrCode size={22} weight="bold" />
                      Quét QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Cards (Section 2) */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Wallet size={24} weight="fill" />
                  </div>
                  <div className="stat-info">
                    <span>Tổng số dư</span>
                    <strong>{wallet.balance.toLocaleString()}đ</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
                    <TrendDown size={24} weight="bold" />
                  </div>
                  <div className="stat-info">
                    <span>Chi tiêu tháng</span>
                    <strong>368.000đ</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <TrendUp size={24} weight="bold" />
                  </div>
                  <div className="stat-info">
                    <span>Thu nhập tháng</span>
                    <strong>2.500.000đ</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <Clock size={24} weight="bold" />
                  </div>
                  <div className="stat-info">
                    <span>Số giao dịch</span>
                    <strong>{transactions.length}</strong>
                  </div>
                </div>
              </div>

              {/* Analytics charts (Section 6) */}
              <div className="charts-grid">
                {/* Chart 1: Donut Spending Category */}
                <div className="chart-card">
                  <h3>Chi tiêu theo nhóm</h3>
                  <div className="donut-chart-wrapper">
                    {/* SVG pie donut */}
                    <svg width="120" height="120" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.2" />
                      {/* Coffee Lab - Food (45%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent)" strokeWidth="4.2" strokeDasharray="45 55" strokeDashoffset="25" />
                      {/* Electricity - Utilities (35%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4.2" strokeDasharray="35 65" strokeDashoffset="80" />
                      {/* Others (20%) */}
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="20 80" strokeDashoffset="115" />
                    </svg>
                    
                    <div className="donut-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: 'var(--accent)' }} />
                        <span>Ăn uống & Cà phê (45%)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#f97316' }} />
                        <span>Điện, nước & Sinh hoạt (35%)</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#ef4444' }} />
                        <span>Các chi tiêu khác (20%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Cash Flow Columns */}
                <div className="chart-card">
                  <h3>Dòng tiền hàng tháng</h3>
                  <div className="chart-flow-bars">
                    <div className="bar-column">
                      <div className="bar-stack">
                        <div className="bar-value" style={{ height: '70%', background: 'var(--accent)' }} />
                      </div>
                      <span className="bar-label">Th4</span>
                    </div>
                    <div className="bar-column">
                      <div className="bar-stack">
                        <div className="bar-value" style={{ height: '85%', background: 'var(--accent)' }} />
                      </div>
                      <span className="bar-label">Th5</span>
                    </div>
                    <div className="bar-column">
                      <div className="bar-stack">
                        <div className="bar-value" style={{ height: '55%', background: 'var(--accent)' }} />
                      </div>
                      <span className="bar-label">Th6</span>
                    </div>
                  </div>
                </div>

                {/* Chart 3: Wallet Activity */}
                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                  <h3>Hoạt động ví trong tuần</h3>
                  <div className="chart-activity-timeline">
                    <div className="activity-row">
                      <div className="activity-label-group">
                        <div className="activity-dot" style={{ background: 'var(--accent)' }} />
                        <span>Chuyển tiền nội bộ</span>
                      </div>
                      <div className="activity-progress-bar">
                        <div className="activity-progress-fill" style={{ width: '75%', background: 'var(--accent)' }} />
                      </div>
                      <strong style={{ fontStyle: 'normal' }}>75%</strong>
                    </div>

                    <div className="activity-row">
                      <div className="activity-label-group">
                        <div className="activity-dot" style={{ background: '#22c55e' }} />
                        <span>Nạp tiền ngân hàng</span>
                      </div>
                      <div className="activity-progress-bar">
                        <div className="activity-progress-fill" style={{ width: '50%', background: '#22c55e' }} />
                      </div>
                      <strong style={{ fontStyle: 'normal' }}>50%</strong>
                    </div>

                    <div className="activity-row">
                      <div className="activity-label-group">
                        <div className="activity-dot" style={{ background: '#f97316' }} />
                        <span>Rút tiền về thẻ</span>
                      </div>
                      <div className="activity-progress-bar">
                        <div className="activity-progress-fill" style={{ width: '25%', background: '#f97316' }} />
                      </div>
                      <strong style={{ fontStyle: 'normal' }}>25%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS & TRANSFER */}
          {activeTab === 'transactions' && (
            <div className="tab-panel">
              <div className="transfer-grid">
                {/* Money Transfer Form (Section 4) */}
                <div className="transfer-card">
                  <h3>Chuyển tiền nhanh</h3>
                  <form className="auth-form" onSubmit={handleTransfer}>
                    {transferError && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {transferError}</div>}

                    <FormInput
                      label="Số điện thoại nhận tiền"
                      id="recPhone"
                      type="tel"
                      placeholder="Nhập SĐT người nhận"
                      value={transferPhone}
                      onChange={(e) => setTransferPhone(e.target.value)}
                      disabled={transferLoading}
                      icon={User}
                    />

                    <FormInput
                      label="Số tiền chuyển (đ)"
                      id="transAmt"
                      type="number"
                      placeholder="Ví dụ: 50000"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      disabled={transferLoading}
                      icon={Wallet}
                    />

                    <div className="input-group">
                      <label className="input-label" htmlFor="transNote">Lời nhắn chuyển khoản</label>
                      <textarea
                        className="input-field"
                        id="transNote"
                        placeholder="Nhập nội dung chuyển tiền (không dấu)"
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        disabled={transferLoading}
                        style={{ minHeight: '80px', borderRadius: '14px', paddingLeft: '16px', resize: 'vertical' }}
                      />
                    </div>

                    <button className="auth-btn" type="submit" disabled={transferLoading}>
                      {transferLoading ? <div className="btn-spinner" /> : 'Thực hiện chuyển khoản'}
                    </button>
                  </form>
                </div>

                {/* Info summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="recent-transactions-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700 }}>Hạn mức giao dịch</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                      Tài khoản của bạn đã được xác thực KYC thành công. Hạn mức giao dịch ví hiện tại của bạn là:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <span>Hạn mức tối đa/giao dịch:</span>
                        <strong>50.000.000đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                        <span>Hạn mức tối đa/ngày:</span>
                        <strong>100.000.000đ</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Phí chuyển tiền nội bộ:</span>
                        <strong style={{ color: '#22c55e' }}>Miễn phí 100%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions List & Filters (Section 3) */}
              <div className="recent-transactions-card">
                <div className="section-header">
                  <h2>Lịch sử giao dịch ví</h2>
                  <div className="filters-row">
                    <select
                      className="filter-select"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    >
                      <option value="ALL">Tất cả thời gian</option>
                      <option value="TODAY">Hôm nay</option>
                      <option value="WEEK">7 ngày gần đây</option>
                      <option value="MONTH">Tháng này</option>
                    </select>

                    <select
                      className="filter-select"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">Mọi loại giao dịch</option>
                      <option value="TRANSFER">Chuyển khoản</option>
                      <option value="TOPUP">Nạp tiền</option>
                      <option value="WITHDRAW">Rút tiền</option>
                    </select>

                    <select
                      className="filter-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="SUCCESS">Thành công</option>
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="FAILED">Thất bại</option>
                    </select>
                  </div>
                </div>

                <div className="transaction-table-wrapper">
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Người nhận / Nguồn</th>
                        <th>Loại</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="no-data-row">
                            Không có giao dịch nào khớp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td>
                              <div className="recipient-cell">
                                <div className="recipient-avatar">
                                  {tx.recipient.substring(0, 1).toUpperCase()}
                                </div>
                                {tx.recipient}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--muted)' }}>
                                {tx.type === 'TRANSFER' && 'Chuyển tiền'}
                                {tx.type === 'TOPUP' && 'Nạp ví'}
                                {tx.type === 'WITHDRAW' && 'Rút ví'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{tx.date}</td>
                            <td>
                              <span className={`status-badge ${tx.status === 'SUCCESS' ? 'success' : (tx.status === 'PENDING' ? 'pending' : 'failed')}`}>
                                {tx.status === 'SUCCESS' && 'Thành công'}
                                {tx.status === 'PENDING' && 'Chờ xử lý'}
                                {tx.status === 'FAILED' && 'Thất bại'}
                              </span>
                            </td>
                            <td>
                              <span className={`transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LINK BANK */}
          {activeTab === 'bank' && (
            <div className="tab-panel">
              <div className="transfer-grid">
                {/* Form or Step Column */}
                <div className="transfer-card">
                  {linkingStep === 1 ? (
                    <>
                      <h3>Liên kết tài khoản mới</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                        Chọn ngân hàng đối tác và điền thông tin tài khoản cá nhân của bạn để thực hiện liên kết nạp rút.
                      </p>

                      {linkingError && (
                        <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                          <Warning size={16} /> {linkingError}
                        </div>
                      )}

                      <form className="auth-form" onSubmit={handleLinkBankSubmit}>
                        <div className="input-group">
                          <label className="input-label">Chọn ngân hàng đối tác</label>
                          <div className="bank-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                            {[
                              { code: 'VCB', name: 'Vietcombank', color: '#10b981' },
                              { code: 'TCB', name: 'Techcombank', color: '#ef4444' },
                              { code: 'BIDV', name: 'BIDV', color: '#3b82f6' },
                              { code: 'ACB', name: 'ACB', color: '#0ea5e9' },
                              { code: 'TPB', name: 'TPBank', color: '#a855f7' }
                            ].map(b => (
                              <button
                                key={b.code}
                                type="button"
                                className={`bank-select-btn ${selectedBank === b.code ? 'selected' : ''}`}
                                onClick={() => setSelectedBank(b.code)}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '12px 6px',
                                  borderRadius: '12px',
                                  border: selectedBank === b.code ? `2px solid ${b.color}` : '1.5px solid var(--line)',
                                  background: selectedBank === b.code ? `${b.color}15` : 'var(--surface)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  color: selectedBank === b.code ? b.color : 'var(--ink)'
                                }}
                              >
                                <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.5px' }}>{b.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <FormInput
                          label="Số tài khoản ngân hàng"
                          id="bankAccountNo"
                          type="text"
                          placeholder="Nhập số tài khoản"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ''))}
                          disabled={isLinkingLoading}
                        />

                        <FormInput
                          label="Họ và tên chủ tài khoản (Không dấu)"
                          id="bankCardHolder"
                          type="text"
                          value={userProfile.fullName.toUpperCase()}
                          disabled={true}
                          style={{ opacity: 0.8 }}
                        />

                        <FormInput
                          label="Số điện thoại đăng ký ngân hàng"
                          id="bankPhone"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={bankPhone}
                          onChange={(e) => setBankPhone(e.target.value)}
                          disabled={isLinkingLoading}
                        />

                        <button className="auth-btn" type="submit" disabled={isLinkingLoading}>
                          {isLinkingLoading ? <div className="btn-spinner" /> : 'Liên kết ngân hàng'}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <h3>Xác thực liên kết</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                        Nhập mã xác thực OTP đã được gửi tới số điện thoại <strong>{bankPhone}</strong> để hoàn tất liên kết tài khoản ngân hàng.
                      </p>

                      {linkingError && (
                        <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                          <Warning size={16} /> {linkingError}
                        </div>
                      )}

                      <form className="auth-form" onSubmit={handleVerifyBankOtp}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <FormInput
                              label="Nhập mã xác thực OTP"
                              id="bankOtp"
                              type="password"
                              placeholder="Nhập OTP 6 số"
                              value={bankOtp}
                              onChange={(e) => setBankOtp(e.target.value.replace(/\D/g, ''))}
                              inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                              maxLength="6"
                              disabled={isLinkingLoading}
                              style={{ marginBottom: 0 }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleResendLinkingOtp}
                            disabled={linkingCountdown > 0 || isLinkingLoading}
                            className="secondary-button"
                            style={{
                              height: '48px',
                              whiteSpace: 'nowrap',
                              padding: '0 16px',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              borderRadius: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '120px'
                            }}
                          >
                            {linkingCountdown > 0 ? `Gửi lại (${linkingCountdown}s)` : 'Gửi mã'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button
                            className="secondary-button"
                            type="button"
                            style={{ flex: 1, minHeight: '48px', fontWeight: 700 }}
                            onClick={() => setLinkingStep(1)}
                            disabled={isLinkingLoading}
                          >
                            Quay lại
                          </button>
                          <button
                            className="auth-btn"
                            type="submit"
                            style={{ flex: 1, minHeight: '48px' }}
                            disabled={isLinkingLoading}
                          >
                            {isLinkingLoading ? <div className="btn-spinner" /> : 'Xác thực OTP'}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>

                {/* Linked Cards Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="recent-transactions-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>Ngân hàng liên kết của bạn</h3>
                    
                    {linkedBanks.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', border: '1.5px dashed var(--line)', borderRadius: '16px' }}>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {linkedBanks.map(card => {
                          const gradients = {
                            VCB: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
                            TCB: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                            BIDV: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
                            ACB: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
                            TPB: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)'
                          }
                          const bg = gradients[card.logo] || 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
                          return (
                            <div
                              key={card.id}
                              style={{
                                background: bg,
                                borderRadius: '16px',
                                padding: '20px',
                                color: '#ffffff',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '160px',
                                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Overlay logo badge */}
                              <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, fontSize: '6rem', fontWeight: 900, lineHeight: 1, pointerEvents: 'none' }}>
                                {card.logo}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>{card.bankName}</strong>
                                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Thẻ nội bộ Debit</span>
                                </div>
                                <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                  ACTIVE
                                </span>
                              </div>

                              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '2.5px', margin: '20px 0 10px', zIndex: 1 }}>
                                **** **** **** {card.accountNumber.slice(-4)}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                                <div>
                                  <span style={{ fontSize: '0.68rem', display: 'block', opacity: 0.8, textTransform: 'uppercase', marginBottom: '2px' }}>Chủ thẻ</span>
                                  <strong style={{ fontSize: '0.88rem' }}>{card.cardHolder}</strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkBank(card)}
                                  style={{
                                    border: 'none',
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    color: '#ffffff',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
                                >
                                  Hủy liên kết
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KYC VERIFICATION (Section 5) */}
          {activeTab === 'kyc' && (
            <div className="tab-panel">
              <div className="kyc-card">
                {/* Banner Status Display */}
                {userProfile.kycStatus === 'APPROVED' && (
                  <div className="kyc-status-banner approved">
                    <div className="kyc-banner-icon">
                      <CheckCircle size={28} weight="fill" />
                    </div>
                    <div className="kyc-banner-content">
                      <h4>Tài khoản ví đã KYC thành công</h4>
                      <p>
                        Thông tin của bạn đã được bộ phận thẩm định phê duyệt thành công. Hạn mức giao dịch
                        tài khoản của bạn đã được nâng lên tối đa.
                      </p>
                    </div>
                  </div>
                )}

                {userProfile.kycStatus === 'PENDING' && (
                  <div className="kyc-status-banner pending">
                    <div className="kyc-banner-icon">
                      <Clock size={28} weight="bold" />
                    </div>
                    <div className="kyc-banner-content">
                      <h4>Hồ sơ KYC đang chờ duyệt</h4>
                      <p>
                        Yêu cầu xác thực tài khoản của bạn đang được bộ phận quản trị viên VT Pay kiểm tra.
                        Thời gian phản hồi thông thường trong vòng 24 giờ.
                      </p>
                    </div>
                  </div>
                )}

                {userProfile.kycStatus === 'REJECTED' && (
                  <div className="kyc-status-banner rejected">
                    <div className="kyc-banner-icon">
                      <Warning size={28} weight="fill" />
                    </div>
                    <div className="kyc-banner-content">
                      <h4>Yêu cầu KYC bị từ chối</h4>
                      <p>
                        Hình ảnh tài liệu nhận dạng của bạn không đạt yêu cầu (mờ, mất góc hoặc không rõ mặt).
                        Vui lòng tải lên và gửi lại hồ sơ ảnh mới.
                      </p>
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--ink)' }}>Tải tài liệu xác thực (Simulated upload)</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  Vui lòng tải lên ảnh chụp hai mặt của Căn cước công dân và một tấm ảnh chụp chân dung chân thực của bạn.
                </p>

                <div className="upload-zone-container">
                  {/* Front image card */}
                  <div className="upload-card" onClick={() => triggerKycUpload('front')}>
                    {kycFiles.front ? (
                      <img className="upload-preview" src={kycFiles.front} alt="Mặt trước CCCD" />
                    ) : (
                      <>
                        <UploadSimple size={32} />
                        <span>Mặt trước CCCD</span>
                        <small>Định dạng JPG, PNG tối đa 5MB</small>
                      </>
                    )}
                  </div>

                  {/* Back image card */}
                  <div className="upload-card" onClick={() => triggerKycUpload('back')}>
                    {kycFiles.back ? (
                      <img className="upload-preview" src={kycFiles.back} alt="Mặt sau CCCD" />
                    ) : (
                      <>
                        <UploadSimple size={32} />
                        <span>Mặt sau CCCD</span>
                        <small>Yêu cầu ảnh chụp rõ nét, không lóa sáng</small>
                      </>
                    )}
                  </div>

                  {/* Selfie image card */}
                  <div className="upload-card" onClick={() => triggerKycUpload('selfie')}>
                    {kycFiles.selfie ? (
                      <img className="upload-preview" src={kycFiles.selfie} alt="Selfie chân dung" />
                    ) : (
                      <>
                        <UploadSimple size={32} />
                        <span>Ảnh chân dung (Selfie)</span>
                        <small>Nhìn thẳng gương mặt, không đeo kính râm</small>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="auth-btn"
                    style={{ maxWidth: '240px' }}
                    onClick={handleKycSubmit}
                    disabled={userProfile.kycStatus === 'PENDING' || userProfile.kycStatus === 'APPROVED'}
                  >
                    Gửi yêu cầu phê duyệt KYC
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & PROFILE (Sections 7 & 8) */}
          {activeTab === 'profile' && (
            <div className="tab-panel">
              {/* Profile Details Display (Section 8) */}
              <div className="profile-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px' }}>
                  Thông tin cá nhân chủ ví
                </h3>
                
                <div className="profile-info-grid">
                  <div className="profile-field">
                    <label>Họ và tên</label>
                    <span>{userProfile.fullName}</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>Số điện thoại</label>
                    <span>{userProfile.phone}</span>
                  </div>

                  <div className="profile-field">
                    <label>Địa chỉ Email</label>
                    <span>{userProfile.email}</span>
                  </div>

                  <div className="profile-field">
                    <label>Số CCCD</label>
                    <span>{userProfile.citizenId}</span>
                  </div>

                  <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Trạng thái tài khoản</label>
                    <div className="status-pill active">
                      {userProfile.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Actions Cards (Section 7) */}
              <div className="security-grid">
                {/* Credentials updates */}
                <div className="security-action-card">
                  <h3>Cấu hình bảo mật</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                    Nâng cấp lớp bảo mật tài khoản định kỳ để giảm thiểu rủi ro bị tấn công tài chính.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      className="secondary-button"
                      style={{ width: '100%', minHeight: '48px', justifyContent: 'flex-start', padding: '0 16px', fontWeight: 700 }}
                      onClick={() => setModalType('password')}
                    >
                      Đổi mật khẩu tài khoản
                    </button>
                    
                    <button
                      className="secondary-button"
                      style={{ width: '100%', minHeight: '48px', justifyContent: 'flex-start', padding: '0 16px', fontWeight: 700 }}
                      onClick={() => setModalType('pin')}
                    >
                      Đổi mã PIN giao dịch tài chính
                    </button>
                  </div>
                </div>

                {/* Device management */}
                <div className="security-action-card">
                  <h3>Quản lý thiết bị đã đăng nhập</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                    Danh sách các thiết bị đã truy cập ví của bạn. Bạn có thể xóa quyền truy cập của thiết bị lạ.
                  </p>

                  <div className="device-list">
                    {devices.map(dev => (
                      <div className="device-item" key={dev.id}>
                        <div className="device-info-wrapper">
                          <div className="device-icon">
                            {dev.type === 'desktop' ? <Laptop size={22} /> : <DeviceMobile size={22} />}
                          </div>
                          <div className="device-detail">
                            <strong>{dev.name}</strong>
                            <span>Hoạt động: {dev.lastLogin}</span>
                          </div>
                        </div>
                        {dev.id !== 1 && (
                          <button className="device-remove-btn" onClick={() => removeDevice(dev.id, dev.name)}>
                            Thu hồi
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Login History */}
                <div className="security-action-card" style={{ gridColumn: '1 / -1' }}>
                  <h3>Lịch sử đăng nhập</h3>
                  <div className="transaction-table-wrapper">
                    <table className="transaction-table">
                      <thead>
                        <tr>
                          <th>Địa chỉ IP</th>
                          <th>Tên Thiết bị</th>
                          <th>Thời gian đăng nhập</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistory.map((hist, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>{hist.ip}</td>
                            <td>{hist.device}</td>
                            <td style={{ color: 'var(--muted)' }}>{hist.time}</td>
                            <td>
                              <span className="status-badge success">{hist.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={modalType === 'topup'} onClose={() => setModalType(null)} title="Nạp tiền vào ví VT Pay">
        {topupStep === 1 ? (
          <form onSubmit={handleTopupAmountSubmit}>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
              Nạp ví từ tài khoản ngân hàng Vietcombank đã liên kết (Số tài khoản: 1009*****686).
            </p>

            {topupError && (
              <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                {topupError}
              </div>
            )}

            <FormInput
              label="Số tiền nạp (đ)"
              id="topAmt"
              type="number"
              placeholder="Ví dụ: 100000"
              value={modalAmount}
              onChange={(e) => setModalAmount(e.target.value)}
              style={{ marginBottom: '20px' }}
              required
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setModalType(null)}>Hủy bỏ</button>
              <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Tiếp tục</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyTopupPin}>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
              Để xác nhận nạp số tiền <strong>{parseFloat(modalAmount).toLocaleString()}đ</strong> từ ngân hàng liên kết vào ví VT Pay, vui lòng nhập mã PIN giao dịch của bạn.
            </p>

            {topupError && (
              <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                {topupError}
              </div>
            )}

            <FormInput
              label="Mã PIN giao dịch (6 số)"
              id="topupPin"
              type="password"
              placeholder="Nhập mã PIN giao dịch"
              value={topupPin}
              onChange={(e) => setTopupPin(e.target.value.replace(/\D/g, ''))}
              inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
              maxLength="6"
              required
              disabled={isTopupLoading}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="secondary-button"
                type="button"
                style={{ flex: 1, minHeight: '46px' }}
                onClick={() => setTopupStep(1)}
                disabled={isTopupLoading}
              >
                Quay lại
              </button>
              <button
                className="auth-btn"
                type="submit"
                style={{ flex: 1, minHeight: '46px' }}
                disabled={isTopupLoading}
              >
                {isTopupLoading ? <div className="btn-spinner" /> : 'Xác nhận nạp'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={modalType === 'withdraw'} onClose={() => setModalType(null)} title="Rút tiền về tài khoản ngân hàng">
        <form onSubmit={handleModalActionSubmit}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Chuyển tiền từ tài khoản ví VT Pay về ngân hàng liên kết. Số dư khả dụng hiện tại: <strong style={{ color: 'var(--accent)' }}>{wallet.balance.toLocaleString()}đ</strong>.
          </p>

          <FormInput
            label="Số tiền rút (đ)"
            id="withAmt"
            type="number"
            placeholder="Ví dụ: 50000"
            value={modalAmount}
            onChange={(e) => setModalAmount(e.target.value)}
            style={{ marginBottom: '20px' }}
            required
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setModalType(null)}>Hủy bỏ</button>
            <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Xác nhận rút</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'password'} onClose={() => setModalType(null)} title="Đổi mật khẩu tài khoản ví">
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
            <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setModalType(null)}>Hủy bỏ</button>
            <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Cập nhật</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'pin'} onClose={() => setModalType(null)} title="Đổi mã PIN giao dịch ví">
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
            <button className="secondary-button" type="button" style={{ flex: 1, minHeight: '46px' }} onClick={() => setModalType(null)}>Hủy bỏ</button>
            <button className="auth-btn" type="submit" style={{ flex: 1, minHeight: '46px' }}>Cập nhật PIN</button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: CONFIRM UNLINK BANK WITH OTP */}
      <Modal
        isOpen={unlinkBankTarget !== null}
        onClose={() => setUnlinkBankTarget(null)}
        title={`Xác nhận hủy liên kết ${unlinkBankTarget ? unlinkBankTarget.bankName : ''}`}
      >
        <form onSubmit={handleVerifyUnlinkOtp}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Để đảm bảo an toàn cho tài khoản ví, vui lòng xác nhận mã OTP gửi qua SMS tới số điện thoại <strong>{userProfile.phone}</strong> để hủy liên kết tài khoản <strong>{unlinkBankTarget ? `${unlinkBankTarget.bankName} (STK: ...${unlinkBankTarget.accountNumber.slice(-4)})` : ''}</strong>.
          </p>

          {unlinkError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              <Warning size={16} /> {unlinkError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Mã xác thực OTP (6 chữ số)"
                id="unlinkOtp"
                type="password"
                placeholder="Nhập mã OTP 6 số"
                value={unlinkOtp}
                onChange={(e) => setUnlinkOtp(e.target.value.replace(/\D/g, ''))}
                inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                maxLength="6"
                required
                disabled={isUnlinkingLoading}
                style={{ marginBottom: 0 }}
              />
            </div>
            <button
              type="button"
              onClick={handleResendUnlinkOtp}
              disabled={unlinkCountdown > 0 || isUnlinkingLoading}
              className="secondary-button"
              style={{
                height: '48px',
                whiteSpace: 'nowrap',
                padding: '0 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '120px'
              }}
            >
              {unlinkCountdown > 0 ? `Gửi lại (${unlinkCountdown}s)` : 'Gửi mã'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="secondary-button"
              type="button"
              style={{ flex: 1, minHeight: '46px' }}
              onClick={() => setUnlinkBankTarget(null)}
              disabled={isUnlinkingLoading}
            >
              Hủy bỏ
            </button>
            <button
              className="auth-btn"
              type="submit"
              style={{ flex: 1, minHeight: '46px', background: '#ef4444' }}
              disabled={isUnlinkingLoading}
            >
              {isUnlinkingLoading ? <div className="btn-spinner" /> : 'Xác nhận hủy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 6: CONFIRM TRANSFER WITH PIN */}
      <Modal
        isOpen={showTransferConfirm}
        onClose={() => {
          if (!isTransferConfirmLoading) {
            setShowTransferConfirm(false)
            setTransferPin('')
            setTransferConfirmError('')
          }
        }}
        title="Xác nhận chuyển tiền"
      >
        <form onSubmit={handleVerifyTransferPin}>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.5 }}>
            Vui lòng kiểm tra kỹ thông tin giao dịch và nhập mã PIN của bạn để hoàn tất chuyển tiền.
          </p>

          <div className="recent-transactions-card" style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', marginBottom: '20px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Tài khoản nhận:</span>
              <strong style={{ color: 'var(--ink)' }}>{transferPhone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Số tiền chuyển:</span>
              <strong style={{ color: 'var(--ink)', fontSize: '1rem' }}>{parseFloat(transferAmount || 0).toLocaleString()}đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted)' }}>Phí chuyển tiền:</span>
              <strong style={{ color: '#22c55e' }}>Miễn phí (0đ)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Nội dung chuyển:</span>
              <span style={{ color: 'var(--ink)', maxWidth: '60%', textAlign: 'right', overflowWrap: 'break-word', fontWeight: 500 }}>{transferNote || 'Chuyen tien'}</span>
            </div>
          </div>

          {transferConfirmError && (
            <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              <Warning size={16} /> {transferConfirmError}
            </div>
          )}

          <FormInput
            label="Nhập mã PIN giao dịch (6 chữ số)"
            id="transferPin"
            type="password"
            placeholder="Nhập mã PIN gồm 6 số"
            value={transferPin}
            onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
            inputStyle={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
            maxLength="6"
            required
            disabled={isTransferConfirmLoading}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="secondary-button"
              type="button"
              style={{ flex: 1, minHeight: '46px' }}
              onClick={() => {
                setShowTransferConfirm(false)
                setTransferPin('')
                setTransferConfirmError('')
              }}
              disabled={isTransferConfirmLoading}
            >
              Hủy bỏ
            </button>
            <button
              className="auth-btn"
              type="submit"
              style={{ flex: 1, minHeight: '46px' }}
              disabled={isTransferConfirmLoading}
            >
              {isTransferConfirmLoading ? <div className="btn-spinner" /> : 'Xác nhận chuyển'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Dashboard
