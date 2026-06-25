import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Gear } from '@phosphor-icons/react'
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

const calculateRemainingSeconds = (expiryTimeStr) => {
  if (!expiryTimeStr) return 0
  const remaining = Math.ceil((parseInt(expiryTimeStr, 10) - Date.now()) / 1000)
  return remaining > 0 ? remaining : 0
}

const generateRandomId = (prefix = 'TX') => {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
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
    status: 'ACTIVE',
    dob: '1996-08-06',
    gender: 'Nam',
    address: '123 Đường Láng, Quận Đống Đa, Hà Nội',
    vipLevel: 'Gold'
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
  const [filterSearch, setFilterSearch] = useState('')

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

  // Topup PIN & OTP States
  const [topupStep, setTopupStep] = useState(1) // 1: input amount, 2: verify PIN, 3: verify OTP
  const [topupPin, setTopupPin] = useState('')
  const [topupOtp, setTopupOtp] = useState('')
  const [topupError, setTopupError] = useState('')
  const [isTopupLoading, setIsTopupLoading] = useState(false)
  const [topupCountdown, setTopupCountdown] = useState(0)

  // Withdraw PIN & OTP States
  const [withdrawStep, setWithdrawStep] = useState(1) // 1: input amount, 2: verify PIN, 3: verify OTP
  const [withdrawPin, setWithdrawPin] = useState('')
  const [withdrawOtp, setWithdrawOtp] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  const [withdrawCountdown, setWithdrawCountdown] = useState(0)

  // Transfer Confirmation PIN & OTP States
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [successTx, setSuccessTx] = useState(null)
  const [transferPin, setTransferPin] = useState('')
  const [transferOtp, setTransferOtp] = useState('')
  const [transferOtpStep, setTransferOtpStep] = useState(false) // false: PIN, true: OTP
  const [transferConfirmError, setTransferConfirmError] = useState('')
  const [isTransferConfirmLoading, setIsTransferConfirmLoading] = useState(false)
  const [transferCountdown, setTransferCountdown] = useState(0)

  // Profile Settings States
  const [isEditMode, setIsEditMode] = useState(false)
  const [editProfile, setEditProfile] = useState({
    fullName: 'Nguyễn Bá Việt',
    email: 'vietnb@vtpay.local',
    phone: '0987654321',
    citizenId: '001096008686',
    dob: '1996-08-06',
    gender: 'Nam',
    address: '123 Đường Láng, Quận Đống Đa, Hà Nội'
  })

  // Transaction Limits
  const [limitPerTransaction] = useState(50000000)
  const [limitPerDay] = useState(100000000)

  // Security Toggles
  const [securityToggles, setSecurityToggles] = useState({
    smsOtp: true,
    emailOtp: false,
    biometrics: true
  })

  // QR Scanner States
  const [qrFile, setQrFile] = useState(null)
  const [scanSuccess, setScanSuccess] = useState(false)

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
          const fetchedProfile = {
            fullName: profileData.fullName || 'Nguyễn Bá Việt',
            email: profileData.email || 'vietnb@vtpay.local',
            phone: profileData.phone || '0987654321',
            citizenId: profileData.citizenId || '001096008686',
            kycStatus: profileData.kycStatus || 'APPROVED',
            status: 'ACTIVE',
            dob: profileData.dob || '1996-08-06',
            gender: profileData.gender || 'Nam',
            address: profileData.address || '123 Đường Láng, Quận Đống Đa, Hà Nội',
            vipLevel: profileData.vipLevel || 'Gold'
          }
          setUserProfile(fetchedProfile)
          setEditProfile({
            fullName: fetchedProfile.fullName,
            email: fetchedProfile.email,
            phone: fetchedProfile.phone,
            citizenId: fetchedProfile.citizenId,
            dob: fetchedProfile.dob,
            gender: fetchedProfile.gender,
            address: fetchedProfile.address
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
            id: t.transactionId || generateRandomId('TX'),
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
        setActiveTab('myqr')
      } else if (e.altKey && e.key === '4') {
        e.preventDefault()
        setActiveTab('history')
      } else if (e.altKey && e.key === '5') {
        e.preventDefault()
        setActiveTab('bank')
      } else if (e.altKey && e.key === '6') {
        e.preventDefault()
        setActiveTab('kyc')
      } else if (e.altKey && e.key === '7') {
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

  // Timer for transfer OTP countdown
  useEffect(() => {
    if (transferCountdown <= 0) return
    const timer = setInterval(() => {
      setTransferCountdown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [transferCountdown])

  // Timer for topup OTP countdown
  useEffect(() => {
    if (topupCountdown <= 0) return
    const timer = setInterval(() => {
      setTopupCountdown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [topupCountdown])

  // Timer for withdraw OTP countdown
  useEffect(() => {
    if (withdrawCountdown <= 0) return
    const timer = setInterval(() => {
      setWithdrawCountdown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [withdrawCountdown])

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
        id: generateRandomId(selectedBank),
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

  // Handle Save Profile Info Changes
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

    setUserProfile(prev => ({
      ...prev,
      email: editProfile.email,
      dob: editProfile.dob,
      gender: editProfile.gender,
      address: editProfile.address
    }))
    setIsEditMode(false)
    showToast('Cập nhật thông tin cá nhân thành công!')
  }

  // Handle Cancel Profile Edit Mode
  const handleCancelProfileEdit = () => {
    setEditProfile({
      fullName: userProfile.fullName,
      email: userProfile.email,
      phone: userProfile.phone,
      citizenId: userProfile.citizenId,
      dob: userProfile.dob || '1996-08-06',
      gender: userProfile.gender || 'Nam',
      address: userProfile.address || '123 Đường Láng, Quận Đống Đa, Hà Nội'
    })
    setIsEditMode(false)
  }

  // Handle Download QR Card Image
  const handleDownloadQR = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 550
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#006aff')
    gradient.addColorStop(1, '#0c4a6e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. Draw card container (white background card in center)
    const cardX = 30
    const cardY = 80
    const cardW = 340
    const cardH = 400
    const radius = 20
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(cardX, cardY, cardW, cardH, radius)
    ctx.fill()

    // 3. Draw header text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VT PAY', canvas.width / 2, 45)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '13px system-ui, -apple-system, sans-serif'
    ctx.fillText('QUÉT MÃ ĐỂ NHẬN TIỀN', canvas.width / 2, 65)

    // 4. Load and draw QR code
    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    qrImg.src = '/vtpay_qr_code.jpg'
    qrImg.onload = () => {
      // Draw QR image in center of white card
      const qrSize = 220
      const qrX = canvas.width / 2 - qrSize / 2
      const qrY = 110
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

      // 5. Draw user details inside card
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText(userProfile.fullName.toUpperCase(), canvas.width / 2, 370)

      ctx.fillStyle = '#64748b'
      ctx.font = '600 14px system-ui, -apple-system, sans-serif'
      ctx.fillText(`Số tài khoản ví: ${wallet.walletId}`, canvas.width / 2, 395)

      // 6. Draw bank link info
      ctx.fillStyle = '#1e293b'
      ctx.font = 'italic 12px system-ui, -apple-system, sans-serif'
      ctx.fillText('Chuyển tiền nhanh liên ngân hàng 24/7', canvas.width / 2, 440)

      // 7. Draw bottom watermark info
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif'
      ctx.fillText('www.vtpay.vn', canvas.width / 2, canvas.height - 25)

      // 8. Trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const link = document.createElement('a')
      link.download = `VTPay_QR_${wallet.walletId}.jpg`
      link.href = dataUrl
      link.click()
    }
    qrImg.onerror = () => {
      // Fallback if image fails to load
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(90, 110, 220, 220)
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
      ctx.fillText('[Mã QR Nhận tiền]', canvas.width / 2, 220)

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText(userProfile.fullName.toUpperCase(), canvas.width / 2, 370)

      ctx.fillStyle = '#64748b'
      ctx.font = '600 14px system-ui, -apple-system, sans-serif'
      ctx.fillText(`Số tài khoản ví: ${wallet.walletId}`, canvas.width / 2, 395)

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const link = document.createElement('a')
      link.download = `VTPay_QR_${wallet.walletId}.jpg`
      link.href = dataUrl
      link.click()
    }
  }

  // Handle Export Transaction History to CSV
  const handleExportCSV = () => {
    // Generate CSV headers and rows
    const headers = ['Ma giao dich', 'Nguoi nhan/Nguon', 'Loai giao dich', 'Thoi gian', 'Trang thai', 'So tien (dong)']
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.recipient,
      tx.type === 'TRANSFER' ? 'Chuyen tien' : (tx.type === 'TOPUP' ? 'Nap vi' : 'Rut vi'),
      tx.date,
      tx.status === 'SUCCESS' ? 'Thanh cong' : (tx.status === 'PENDING' ? 'Cho xu ly' : 'That bai'),
      tx.amount
    ])

    // Convert data to CSV content (UTF-8 BOM for Microsoft Excel character support)
    const csvContent = "\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `VTPay_GD_${wallet.walletId}_${new Date().toISOString().substring(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Xuat file bao cao sao ke CSV thanh cong!')
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
    const amountVal = parseNumberFromCommas(transferAmount)
    if (!transferAmount || amountVal <= 0) {
      setTransferError('Vui lòng nhập số tiền hợp lệ.')
      return
    }

    if (amountVal > wallet.balance) {
      setTransferError('Số dư khả dụng trong ví không đủ để thực hiện giao dịch.')
      return
    }

    // Input checks passed, open confirmation modal
    setShowTransferConfirm(true)
    setTransferPin('')
    setTransferConfirmError('')
  }

  // Handle Verify Transfer PIN Submission (Transitions to OTP Step)
  const handleVerifyTransferPin = (e) => {
    e.preventDefault()
    setTransferConfirmError('')

    if (!transferPin || transferPin.length !== 6 || isNaN(transferPin)) {
      setTransferConfirmError('Mã PIN giao dịch phải gồm 6 chữ số.')
      return
    }

    setTransferOtpStep(true)
    setTransferOtp('')
    setTransferCountdown(60)
    showToast('Mã OTP xác thực chuyển tiền đã được gửi qua SMS!', 'warning')
  }

  // Handle Verify Transfer OTP Submission (Completes Transfer)
  const handleVerifyTransferOtp = async (e) => {
    e.preventDefault()
    setTransferConfirmError('')

    if (!transferOtp || transferOtp.length !== 6 || isNaN(transferOtp)) {
      setTransferConfirmError('Mã OTP phải gồm 6 chữ số.')
      return
    }

    setIsTransferConfirmLoading(true)
    const amountVal = parseNumberFromCommas(transferAmount)

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
            pin: transferPin,
            otp: transferOtp
          })
        })
        const resData = await response.json()
        if (!response.ok || resData.errorCode) {
          setTransferConfirmError(resData.message || 'Chuyển tiền thất bại. Vui lòng kiểm tra lại thông tin.')
          setIsTransferConfirmLoading(false)
          return
        }
      } else {
        // Mock PIN validation for demo: simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Successful Transfer
      const newTx = {
        id: generateRandomId('TX'),
        recipient: `Số điện thoại ${transferPhone}`,
        amount: -amountVal,
        type: 'TRANSFER',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS',
        note: transferNote || 'Chuyển tiền nhanh qua ví'
      }

      setWallet(prev => ({ ...prev, balance: prev.balance - amountVal }))
      setTransactions(prev => [newTx, ...prev])
      showToast(`Chuyển khoản thành công ${amountVal.toLocaleString()}đ tới ${transferPhone}!`)
      setSuccessTx(newTx)

      // Reset transfer inputs
      setTransferPhone('')
      setTransferAmount('')
      setTransferNote('')

      // Close confirmation modal
      setShowTransferConfirm(false)
      setTransferOtpStep(false)
      setTransferPin('')
      setTransferOtp('')
    } catch (err) {
      console.error(err)
      setTransferConfirmError('Lỗi kết nối mạng. Không thể thực hiện chuyển tiền.')
    } finally {
      setIsTransferConfirmLoading(false)
    }
  }

  // Handle Resend Transfer OTP
  const handleResendTransferOtp = () => {
    if (transferCountdown > 0) return
    setTransferCountdown(60)
    setTransferOtp('')
    showToast('Đã gửi lại mã OTP chuyển tiền (mô phỏng)!')
  }

  // Handle Topup 2-Step verification
  const handleTopupAmountSubmit = (e) => {
    e.preventDefault()
    setTopupError('')

    const amountVal = parseNumberFromCommas(modalAmount)
    if (!modalAmount || amountVal <= 0) {
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

    // PIN verified, move to OTP step
    setTopupStep(3)
    setTopupOtp('')
    setTopupCountdown(60)
    showToast('Mã OTP xác thực nạp tiền đã được gửi qua SMS!', 'warning')
  }

  const handleVerifyTopupOtp = (e) => {
    e.preventDefault()
    setTopupError('')

    if (!topupOtp || topupOtp.length !== 6 || isNaN(topupOtp)) {
      setTopupError('Mã OTP phải gồm 6 chữ số.')
      return
    }

    setIsTopupLoading(true)
    setTimeout(() => {
      setIsTopupLoading(false)

      const amountVal = parseNumberFromCommas(modalAmount)
      setWallet(prev => ({ ...prev, balance: prev.balance + amountVal }))
      const newTx = {
        id: generateRandomId('TX'),
        recipient: 'Nạp tiền Vietcombank',
        amount: amountVal,
        type: 'TOPUP',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS',
        note: 'Nạp tiền từ ngân hàng Vietcombank liên kết'
      }
      setTransactions(prev => [newTx, ...prev])
      showToast(`Nạp thành công ${amountVal.toLocaleString()}đ vào ví!`)
      setSuccessTx(newTx)

      setModalAmount('')
      setTopupPin('')
      setTopupOtp('')
      setModalType(null)
      setTopupStep(1)
    }, 1500)
  }

  const handleResendTopupOtp = () => {
    if (topupCountdown > 0) return
    setTopupCountdown(60)
    setTopupOtp('')
    showToast('Đã gửi lại mã OTP nạp tiền!', 'warning')
  }

  // Handle Withdraw 2-Step verification
  const handleWithdrawAmountSubmit = (e) => {
    e.preventDefault()
    setWithdrawError('')

    const amountVal = parseNumberFromCommas(modalAmount)
    if (!modalAmount || amountVal <= 0) {
      setWithdrawError('Vui lòng nhập số tiền rút hợp lệ.')
      return
    }

    if (amountVal > wallet.balance) {
      setWithdrawError('Số dư tài khoản ví không đủ.')
      return
    }

    setWithdrawStep(2)
    setWithdrawPin('')
  }

  const handleVerifyWithdrawPin = (e) => {
    e.preventDefault()
    setWithdrawError('')

    if (!withdrawPin || withdrawPin.length !== 6 || isNaN(withdrawPin)) {
      setWithdrawError('Mã PIN giao dịch phải gồm 6 chữ số.')
      return
    }

    // PIN verified, move to OTP step
    setWithdrawStep(3)
    setWithdrawOtp('')
    setWithdrawCountdown(60)
    showToast('Mã OTP xác thực rút tiền đã được gửi qua SMS!', 'warning')
  }

  const handleVerifyWithdrawOtp = (e) => {
    e.preventDefault()
    setWithdrawError('')

    if (!withdrawOtp || withdrawOtp.length !== 6 || isNaN(withdrawOtp)) {
      setWithdrawError('Mã OTP phải gồm 6 chữ số.')
      return
    }

    setIsWithdrawLoading(true)
    setTimeout(() => {
      setIsWithdrawLoading(false)

      const amountVal = parseNumberFromCommas(modalAmount)
      if (amountVal > wallet.balance) {
        setWithdrawError('Số dư tài khoản ví không đủ.')
        return
      }

      setWallet(prev => ({ ...prev, balance: prev.balance - amountVal }))
      const newTx = {
        id: generateRandomId('TX'),
        recipient: 'Rút tiền ATM/Bank',
        amount: -amountVal,
        type: 'WITHDRAW',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'SUCCESS',
        note: 'Rút tiền về tài khoản ngân hàng liên kết'
      }
      setTransactions(prev => [newTx, ...prev])
      showToast(`Rút thành công ${amountVal.toLocaleString()}đ về tài khoản!`)
      setSuccessTx(newTx)

      setModalAmount('')
      setWithdrawPin('')
      setWithdrawOtp('')
      setModalType(null)
      setWithdrawStep(1)
    }, 1500)
  }

  const handleResendWithdrawOtp = () => {
    if (withdrawCountdown > 0) return
    setWithdrawCountdown(60)
    setWithdrawOtp('')
    showToast('Đã gửi lại mã OTP rút tiền!', 'warning')
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

    if (filterSearch.trim() !== '') {
      const q = filterSearch.toLowerCase().trim()
      const matchesId = t.id.toLowerCase().includes(q)
      const matchesRecipient = t.recipient.toLowerCase().includes(q)
      const matchesAmount = String(Math.abs(t.amount)).includes(q)
      const matchesType = (
        t.type === 'TRANSFER' ? 'chuyển tiền transfer' :
          t.type === 'TOPUP' ? 'nạp ví topup' :
            'rút ví withdraw'
      ).includes(q)

      if (!matchesId && !matchesRecipient && !matchesAmount && !matchesType) return false
    }

    return true
  })

  // Format Helper for currency
  const formatCurrency = (val) => {
    return Math.abs(val).toLocaleString() + wallet.currency
  }

  const formatNumberWithCommas = (val) => {
    if (val === undefined || val === null) return ''
    const clean = String(val).replace(/\D/g, '')
    if (!clean) return ''
    return parseInt(clean, 10).toLocaleString('en-US')
  }

  const parseNumberFromCommas = (val) => {
    if (!val) return 0
    const clean = String(val).replace(/,/g, '')
    return parseFloat(clean) || 0
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
              {activeTab === 'myqr' && 'Mã QR nhận tiền'}
              {activeTab === 'history' && 'Lịch sử giao dịch ví'}
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
                <div className="header-notifications-dropdown">
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
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content panels */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <OverviewPanel
              wallet={wallet}
              userProfile={userProfile}
              transactions={transactions}
              setModalType={setModalType}
              setTopupStep={setTopupStep}
              setWithdrawStep={setWithdrawStep}
              setModalAmount={setModalAmount}
              setTopupPin={setTopupPin}
              setTopupError={setTopupError}
              setActiveTab={setActiveTab}
              setQrFile={setQrFile}
              setScanSuccess={setScanSuccess}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPanel
              handleTransfer={handleTransfer}
              transferError={transferError}
              transferPhone={transferPhone}
              setTransferPhone={setTransferPhone}
              transferAmount={transferAmount}
              setTransferAmount={setTransferAmount}
              transferNote={transferNote}
              setTransferNote={setTransferNote}
              transferLoading={transferLoading}
              wallet={wallet}
              limitPerTransaction={limitPerTransaction}
              limitPerDay={limitPerDay}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filteredTransactions={filteredTransactions}
              formatCurrency={formatCurrency}
              formatNumberWithCommas={formatNumberWithCommas}
              handleExportCSV={handleExportCSV}
            />
          )}

          {activeTab === 'myqr' && (
            <MyQRPanel
              userProfile={userProfile}
              wallet={wallet}
              handleDownloadQR={handleDownloadQR}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPanel
              wallet={wallet}
              filteredTransactions={filteredTransactions}
              filterSearch={filterSearch}
              setFilterSearch={setFilterSearch}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              handleExportCSV={handleExportCSV}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === 'bank' && (
            <BankPanel
              linkingStep={linkingStep}
              linkingError={linkingError}
              bankPhone={bankPhone}
              setBankPhone={setBankPhone}
              bankAccountNo={bankAccountNo}
              setBankAccountNo={setBankAccountNo}
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
              isLinkingLoading={isLinkingLoading}
              handleLinkBankSubmit={handleLinkBankSubmit}
              handleVerifyBankOtp={handleVerifyBankOtp}
              bankOtp={bankOtp}
              setBankOtp={setBankOtp}
              handleResendLinkingOtp={handleResendLinkingOtp}
              setLinkingStep={setLinkingStep}
              linkedBanks={linkedBanks}
              handleUnlinkBank={handleUnlinkBank}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'kyc' && (
            <KycPanel
              userProfile={userProfile}
              kycFiles={kycFiles}
              triggerKycUpload={triggerKycUpload}
              handleKycSubmit={handleKycSubmit}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePanel
              userProfile={userProfile}
              wallet={wallet}
              isLive={isLive}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              editProfile={editProfile}
              setEditProfile={setEditProfile}
              handleCancelProfileEdit={handleCancelProfileEdit}
              handleSaveProfile={handleSaveProfile}
              securityToggles={securityToggles}
              setSecurityToggles={setSecurityToggles}
              handleLogout={handleLogout}
              devices={devices}
              removeDevice={removeDevice}
              loginHistory={loginHistory}
              setModalType={setModalType}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <TopupModal
        isOpen={modalType === 'topup'}
        topupStep={topupStep}
        topupError={topupError}
        modalAmount={modalAmount}
        setModalAmount={setModalAmount}
        handleTopupAmountSubmit={handleTopupAmountSubmit}
        handleVerifyTopupPin={handleVerifyTopupPin}
        handleVerifyTopupOtp={handleVerifyTopupOtp}
        topupPin={topupPin}
        setTopupPin={setTopupPin}
        topupOtp={topupOtp}
        setTopupOtp={setTopupOtp}
        isTopupLoading={isTopupLoading}
        topupCountdown={topupCountdown}
        handleResendTopupOtp={handleResendTopupOtp}
        userProfile={userProfile}
        parseNumberFromCommas={parseNumberFromCommas}
        formatNumberWithCommas={formatNumberWithCommas}
        onBack={() => setTopupStep(1)}
        onClose={() => setModalType(null)}
        onReset={() => {
          setModalType(null)
          setTopupStep(1)
          setTopupPin('')
          setTopupOtp('')
          setTopupError('')
        }}
      />

      <WithdrawModal
        isOpen={modalType === 'withdraw'}
        withdrawStep={withdrawStep}
        withdrawError={withdrawError}
        modalAmount={modalAmount}
        setModalAmount={setModalAmount}
        handleWithdrawAmountSubmit={handleWithdrawAmountSubmit}
        handleVerifyWithdrawPin={handleVerifyWithdrawPin}
        handleVerifyWithdrawOtp={handleVerifyWithdrawOtp}
        withdrawPin={withdrawPin}
        setWithdrawPin={setWithdrawPin}
        withdrawOtp={withdrawOtp}
        setWithdrawOtp={setWithdrawOtp}
        isWithdrawLoading={isWithdrawLoading}
        withdrawCountdown={withdrawCountdown}
        handleResendWithdrawOtp={handleResendWithdrawOtp}
        wallet={wallet}
        userProfile={userProfile}
        parseNumberFromCommas={parseNumberFromCommas}
        formatNumberWithCommas={formatNumberWithCommas}
        onBack={() => setWithdrawStep(1)}
        onClose={() => setModalType(null)}
        onReset={() => {
          setModalType(null)
          setWithdrawStep(1)
          setWithdrawPin('')
          setWithdrawOtp('')
          setWithdrawError('')
        }}
      />

      <PasswordModal
        isOpen={modalType === 'password'}
        onClose={() => setModalType(null)}
        modalPassword={modalPassword}
        setModalPassword={setModalPassword}
        handlePasswordChangeSubmit={handlePasswordChangeSubmit}
      />

      <PinModal
        isOpen={modalType === 'pin'}
        onClose={() => setModalType(null)}
        modalPin={modalPin}
        setModalPin={setModalPin}
        handlePinChangeSubmit={handlePinChangeSubmit}
      />

      <UnlinkBankModal
        isOpen={unlinkBankTarget !== null}
        onClose={() => {
          setUnlinkBankTarget(null)
          setUnlinkOtp('')
          setUnlinkError('')
        }}
        userProfile={userProfile}
        unlinkBankTarget={unlinkBankTarget}
        unlinkError={unlinkError}
        unlinkOtp={unlinkOtp}
        setUnlinkOtp={setUnlinkOtp}
        isUnlinkingLoading={isUnlinkingLoading}
        handleResendUnlinkOtp={handleResendUnlinkOtp}
        handleVerifyUnlinkOtp={handleVerifyUnlinkOtp}
        unlinkCountdown={unlinkCountdown}
      />

      <TransferConfirmModal
        isOpen={showTransferConfirm}
        transferOtpStep={transferOtpStep}
        onClose={() => {
          if (!isTransferConfirmLoading) {
            setShowTransferConfirm(false)
            setTransferOtpStep(false)
            setTransferPin('')
            setTransferOtp('')
            setTransferConfirmError('')
          }
        }}
        onCancel={() => {
          if (!isTransferConfirmLoading) {
            setShowTransferConfirm(false)
            setTransferOtpStep(false)
            setTransferPin('')
            setTransferOtp('')
            setTransferConfirmError('')
          }
        }}
        transferPhone={transferPhone}
        transferAmount={transferAmount}
        transferNote={transferNote}
        transferConfirmError={transferConfirmError}
        transferPin={transferPin}
        setTransferPin={setTransferPin}
        transferOtp={transferOtp}
        setTransferOtp={setTransferOtp}
        isTransferConfirmLoading={isTransferConfirmLoading}
        transferCountdown={transferCountdown}
        handleVerifyTransferPin={handleVerifyTransferPin}
        handleVerifyTransferOtp={handleVerifyTransferOtp}
        handleResendTransferOtp={handleResendTransferOtp}
        parseNumberFromCommas={parseNumberFromCommas}
        userProfile={userProfile}
      />

      <QrScannerModal
        isOpen={modalType === 'qrscanner'}
        onClose={() => {
          setModalType(null)
          setQrFile(null)
          setScanSuccess(false)
        }}
        qrFile={qrFile}
        setQrFile={setQrFile}
        scanSuccess={scanSuccess}
        setScanSuccess={setScanSuccess}
        showToast={showToast}
        setTransferPhone={setTransferPhone}
        setTransferAmount={setTransferAmount}
        setTransferNote={setTransferNote}
        setActiveTab={setActiveTab}
        setModalType={setModalType}
        userProfile={userProfile}
      />

      <TransactionSuccessModal
        isOpen={successTx !== null}
        tx={successTx}
        onClose={() => setSuccessTx(null)}
        userProfile={userProfile}
        showToast={showToast}
      />
    </div>
  )
}

export default Dashboard
