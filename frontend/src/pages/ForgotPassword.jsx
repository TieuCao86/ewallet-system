import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Phone, LockSimple, Key, UserFocus, ShieldCheck, CheckCircle, Warning, ChatCenteredText } from '@phosphor-icons/react'
import FormInput from '../components/ui/FormInput.jsx'
import './Auth.css'

function ForgotPassword() {
  const [step, setStep] = useState(1) // Steps 1 to 7
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [cccd, setCccd] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Face scanning states
  const [scanState, setScanState] = useState('idle') // idle, detecting, action_blink, action_smile, analyzing, success

  const otpRefs = useRef([])

  // Step 1: Validate Phone Number
  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone)) {
      setError('Số điện thoại không đúng định dạng (VD: 0912345678).')
      return
    }

    setLoading(true)
    setTimeout(() => {
      // Step 2: System sends OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(randomOtp)
      setLoading(false)
      setStep(3) // Advance to Step 3 (OTP verification)
    }, 1200)
  }

  // Step 3: Handle OTP Change & Verification
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Focus next input box
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus()
    }
  }

  const handleOtpVerify = (e) => {
    e.preventDefault()
    setError('')
    const enteredOtp = otp.join('')
    
    if (enteredOtp.length < 6) {
      setError('Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.')
      return
    }

    if (enteredOtp !== generatedOtp) {
      setError('Mã OTP không chính xác. Vui lòng kiểm tra lại.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(4) // Move to Step 4 (CCCD)
    }, 800)
  }

  // Step 4: Validate CCCD
  const handleCccdSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!cccd) {
      setError('Vui lòng nhập số CCCD.')
      return
    }
    // CCCD has exactly 12 digits
    if (!/^[0-9]{12}$/.test(cccd)) {
      setError('Số CCCD không hợp lệ (Phải bao gồm đúng 12 chữ số).')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(5) // Move to Step 5 (Face Verification)
    }, 1000)
  }

  // Step 5: Face Verification simulation
  const startFaceScan = () => {
    setScanState('detecting')
  }

  useEffect(() => {
    if (scanState === 'idle') return

    let timer
    if (scanState === 'detecting') {
      timer = setTimeout(() => {
        setScanState('action_blink')
      }, 1500)
    } else if (scanState === 'action_blink') {
      timer = setTimeout(() => {
        setScanState('action_smile')
      }, 1500)
    } else if (scanState === 'action_smile') {
      timer = setTimeout(() => {
        setScanState('analyzing')
      }, 1500)
    } else if (scanState === 'analyzing') {
      timer = setTimeout(() => {
        setScanState('success')
      }, 1500)
    } else if (scanState === 'success') {
      timer = setTimeout(() => {
        setStep(6) // Move to Step 6 (new password)
      }, 1500)
    }

    return () => clearTimeout(timer)
  }, [scanState])

  // Step 6: Validate and Reset Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!password) {
      setError('Vui lòng nhập mật khẩu mới.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu bảo mật phải chứa ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(7) // Move to Step 7 (Success notification)
    }, 1200)
  }

  // Get active step dot for visual indicator
  const getProgressStep = () => {
    if (step <= 2) return 1
    if (step === 3) return 2
    if (step === 4) return 3
    if (step === 5) return 4
    return 5
  }

  return (
    <div className="auth-page">
      {/* Left visual pane */}
      <div className="auth-visual">
        <div className="auth-visual-header">
          <Link to="/" className="auth-brand">
            <img src="/VTPayLogo-Transparent.png" alt="VT Pay Logo" />
            <span>VT Pay</span>
          </Link>
        </div>
        
        <div className="auth-visual-body">
          <h1 className="auth-visual-title">
            Ví điện tử cho mỗi ngày <span>chuyển tiền tức thì.</span>
          </h1>
          
          <div className="auth-card-preview">
            <div className="auth-card-top">
              <span className="auth-card-logo">VT Pay</span>
              <div className="auth-card-chip" />
            </div>
            <div className="auth-card-middle">
              <span className="auth-card-number">••••  ••••  ••••  8686</span>
            </div>
            <div className="auth-card-bottom">
              <div className="auth-card-holder">
                <span>Chủ ví</span>
                <strong>NGUYEN BA VIET</strong>
              </div>
              <div className="auth-card-expiry">
                <span>Hết hạn</span>
                <strong>06/30</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span><ShieldCheck size={18} weight="fill" color="#27c8ff" /> Bảo mật chuẩn AES-256</span>
          <span>© 2026 VT Pay.</span>
        </div>
      </div>

      {/* Right form pane */}
      <div className="auth-content">
        <div className="auth-card">
          {step < 7 && (
            <div className="auth-card-header">
              <Link to="/login" className="auth-back-link">
                <ArrowLeft size={16} weight="bold" /> Quay lại Đăng nhập
              </Link>
              <h2>Khôi phục mật khẩu</h2>
              <p>Thực hiện các bước xác thực bảo mật để thiết lập mật khẩu ví mới.</p>
            </div>
          )}

          {/* Progress Indicator */}
          {step < 7 && (
            <div className="forgot-step-indicator">
              <div className={`forgot-step-dot ${getProgressStep() >= 1 ? (getProgressStep() > 1 ? 'completed' : 'active') : ''}`}>
                {getProgressStep() > 1 ? '✓' : '1'}
              </div>
              <div className={`forgot-step-dot ${getProgressStep() >= 2 ? (getProgressStep() > 2 ? 'completed' : 'active') : ''}`}>
                {getProgressStep() > 2 ? '✓' : '2'}
              </div>
              <div className={`forgot-step-dot ${getProgressStep() >= 3 ? (getProgressStep() > 3 ? 'completed' : 'active') : ''}`}>
                {getProgressStep() > 3 ? '✓' : '3'}
              </div>
              <div className={`forgot-step-dot ${getProgressStep() >= 4 ? (getProgressStep() > 4 ? 'completed' : 'active') : ''}`}>
                {getProgressStep() > 4 ? '✓' : '4'}
              </div>
              <div className={`forgot-step-dot ${getProgressStep() >= 5 ? 'active' : ''}`}>
                5
              </div>
            </div>
          )}

          {/* STEP 1: Enter Phone Number */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handlePhoneSubmit}>
              {error && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {error}</div>}

            <FormInput
              label="Số điện thoại đăng ký ví"
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại ví của bạn"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              icon={Phone}
            />

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {/* STEP 2 & 3: SMS Simulation & Enter OTP */}
          {step === 3 && (
            <form className="auth-form" onSubmit={handleOtpVerify}>
              {/* SMS simulation toast */}
              <div className="sms-simulation">
                <span className="sms-simulation-icon">
                  <ChatCenteredText size={20} />
                </span>
                <div className="sms-simulation-content">
                  <div>[VT Pay SMS] Mã xác thực OTP của bạn là:</div>
                  <strong>{generatedOtp}</strong> (Hiệu lực trong 2 phút)
                </div>
              </div>

              {error && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {error}</div>}

              <div className="input-group">
                <label className="input-label">Nhập mã xác thực OTP</label>
                <div className="otp-input-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      className="otp-box"
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (otpRefs.current[index] = el)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : 'Xác nhận OTP'}
              </button>
              
              <div className="auth-switch">
                Không nhận được mã?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  onClick={() => {
                    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString()
                    setGeneratedOtp(randomOtp)
                    setOtp(['', '', '', '', '', ''])
                    alert('Đã gửi lại mã OTP mới!')
                  }}
                >
                  Gửi lại
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Enter CCCD */}
          {step === 4 && (
            <form className="auth-form" onSubmit={handleCccdSubmit}>
              {error && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {error}</div>}

            <FormInput
              label="Số Căn cước công dân (CCCD)"
              id="cccd"
              placeholder="Nhập 12 số CCCD của bạn"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              disabled={loading}
              icon={ShieldCheck}
            />

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : 'Tiếp tục'}
              </button>
            </form>
          )}

          {/* STEP 5: Face Verification */}
          {step === 5 && (
            <div className="scanner-container">
              <div className={`scanner-view ${scanState !== 'idle' ? 'scanning' : ''} ${scanState === 'success' ? 'success' : ''}`}>
                <UserFocus
                  className={`scanner-contour ${scanState !== 'idle' ? 'active' : ''} ${scanState === 'success' ? 'success' : ''}`}
                  weight={scanState === 'success' ? 'fill' : 'thin'}
                />
                <div className={`scanner-laser ${scanState !== 'idle' ? 'active' : ''} ${scanState === 'success' ? 'success' : ''}`} />
              </div>

              <div className={`scanner-status ${scanState === 'success' ? 'success' : ''}`}>
                {scanState === 'idle' && 'Nhấn bắt đầu để tiến hành nhận diện'}
                {scanState === 'detecting' && 'Đang dò tìm khuôn mặt...'}
                {scanState === 'action_blink' && 'Vui lòng chớp mắt để xác thực...'}
                {scanState === 'action_smile' && 'Vui lòng mỉm cười...'}
                {scanState === 'analyzing' && 'Đang phân tích cấu trúc sinh trắc...'}
                {scanState === 'success' && 'Xác thực khuôn mặt thành công!'}
              </div>

              {scanState === 'idle' && (
                <button className="auth-btn" onClick={startFaceScan}>
                  Bắt đầu quét khuôn mặt
                </button>
              )}
            </div>
          )}

          {/* STEP 6: Enter New Password */}
          {step === 6 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              {error && <div className="error-message" style={{ fontSize: '0.9rem' }}><Warning size={16} /> {error}</div>}

            <FormInput
              label="Mật khẩu mới"
              id="password"
              placeholder="Mật khẩu ví mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              icon={LockSimple}
              showPasswordToggle={true}
            />

            <FormInput
              label="Xác nhận mật khẩu"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              icon={Key}
              showPasswordToggle={true}
            />

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {/* STEP 7: Success Notification */}
          {step === 7 && (
            <div className="success-panel">
              <div className="success-icon-wrapper">
                <CheckCircle size={40} weight="fill" />
              </div>
              <h2>Khôi phục thành công!</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 0 16px', lineHeight: 1.6 }}>
                Mật khẩu tài khoản ví VT Pay của bạn đã được cập nhật thành công.
                Vui lòng sử dụng mật khẩu mới này khi đăng nhập.
              </p>
              <Link className="auth-btn" to="/login" style={{ textDecoration: 'none' }}>
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
