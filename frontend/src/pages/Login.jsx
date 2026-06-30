import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, EnvelopeSimple, LockSimple, ShieldCheck } from '@phosphor-icons/react'
import FormInput from '../components/FormInput.jsx'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    if (!email) {
      errors.email = 'Vui lòng nhập địa chỉ email.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Địa chỉ email không đúng định dạng.'
    }
    
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.'
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const resData = await response.json()

      if (!response.ok) {
        // Đọc mã lỗi nghiệp vụ trực tiếp từ ApiError của Backend
        const code = resData.errorCode

        if (code === 1001 || code === 2001) {
          setError('Email hoặc mật khẩu không chính xác.')
        } else if (code === 1002) {
          setError('Tài khoản này hiện đang bị khóa.')
        } else if (code === 1003) {
          setError('Tài khoản này đã bị vô hiệu hóa.')
        } else {
          setError(resData.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.')
        }
      } else {
        // Đăng nhập thành công -> Trích xuất dữ liệu từ lớp bọc ApiResponse (.data)
        const userData = resData.data

        // Lưu thông tin định danh cơ bản phục vụ hiển thị (Token nằm an toàn trong HttpOnly Cookie)
        localStorage.setItem('userId', userData.userId)
        localStorage.setItem('email', userData.email)
        localStorage.setItem('role', userData.role)

        alert('Đăng nhập thành công!')

        if (userData.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      console.error(err)
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.')
    } finally {
      setLoading(false)
    }
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
          <div className="auth-card-header">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={16} weight="bold" /> Quay lại trang chủ
            </Link>
            <h2>Đăng nhập ví</h2>
            <p>Nhập thông tin tài khoản của bạn để tiếp tục sử dụng dịch vụ.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                {error}
              </div>
            )}

            <FormInput
              label="Địa chỉ Email"
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              icon={EnvelopeSimple}
              error={fieldErrors.email}
            />

            <FormInput
              label="Mật khẩu"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              icon={LockSimple}
              showPasswordToggle={true}
              error={fieldErrors.password}
            />

            <div className="auth-forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <div className="btn-spinner" /> : 'Đăng nhập'}
            </button>

            <div className="auth-switch">
              Chưa có tài khoản ví? <Link to="/register">Mở tài khoản ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
