import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, EnvelopeSimple, LockSimple, ShieldCheck } from '@phosphor-icons/react'

import FormInput from '../components/ui/FormInput.jsx'
import useAuth from '../features/auth/hooks/useAuth.js'

import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const { login, loading, error, setError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Reset lỗi tổng quan của AuthContext khi component bị unmount (chuyển trang)
  useEffect(() => {
    return () => setError("")
  }, [setError])

  const validateForm = () => {
    const errors = {}

    if (!email) {
      errors.email = 'Vui lòng nhập địa chỉ email.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Địa chỉ email không đúng định dạng.'
    }

    // Trang đăng nhập chỉ cần kiểm tra xem đã nhập hay chưa
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    const result = await login(email, password)
    if (!result.success) return

    // Phân quyền điều hướng sau khi đăng nhập thành công
    if (result.user.role === "ADMIN") {
      navigate("/admin")
    } else {
      navigate("/dashboard")
    }
  }

  return (
      <div className="auth-page">
        {/* Left Visual Pane */}
        <div className="auth-visual">
          <div className="auth-visual-header">
            <Link to="/" className="auth-brand">
              <img src="/VTPayLogo-Transparent.png" alt="VT Pay Logo" />
              <span>VT Pay</span>
            </Link>
          </div>

          <div className="auth-visual-body">
            <h1 className="auth-visual-title">
              Ví điện tử cho mỗi ngày<span> chuyển tiền tức thì.</span>
            </h1>

            <div className="auth-card-preview">
              <div className="auth-card-top">
                <span className="auth-card-logo">VT Pay</span>
                <div className="auth-card-chip" />
              </div>
              <div className="auth-card-middle">
                <span className="auth-card-number">•••• •••• •••• 8686</span>
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
          <span>
            <ShieldCheck size={18} weight="fill" color="#27c8ff" /> Bảo mật chuẩn AES-256
          </span>
            <span>© 2026 VT Pay.</span>
          </div>
        </div>

        {/* Right Form Pane */}
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
                  <div className="error-message" style={{ fontSize: "0.9rem", marginBottom: "8px", color: "red" }}>
                    {error}
                  </div>
              )}

              <FormInput
                  label="Địa chỉ Email"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors(prev => ({ ...prev, email: "" })) // Xóa lỗi khi gõ lại
                    setError("") // Xóa lỗi tổng quan
                  }}
                  disabled={loading}
                  icon={EnvelopeSimple}
                  error={fieldErrors.email}
              />

              <FormInput
                  label="Mật khẩu"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors(prev => ({ ...prev, password: "" })) // Xóa lỗi khi gõ lại
                    setError("") // Xóa lỗi tổng quan
                  }}
                  disabled={loading}
                  icon={LockSimple}
                  showPasswordToggle
                  error={fieldErrors.password}
              />

              <div className="auth-forgot-password">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : "Đăng nhập"}
              </button>

              <div className="auth-switch">
                Chưa có tài khoản ví? <Link to="/register"> Mở tài khoản ngay</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}

export default Login