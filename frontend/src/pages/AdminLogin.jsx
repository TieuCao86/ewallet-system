import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ArrowLeft, EnvelopeSimple, LockSimple, ShieldCheck, Warning } from '@phosphor-icons/react'
import FormInput from '../components/FormInput.jsx'
import ToastAlert from '../components/ToastAlert'
import './Auth.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [toast, setToast] = useState(null)

  const {
    login,
    loading,
    error,
    setError
  } = useAuth()
  
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    if (!email) {
      errors.email = 'Vui lòng nhập địa chỉ email quản trị.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Địa chỉ email quản trị không đúng định dạng.'
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

    setError("")

    if (!validateForm()) return

    const result = await login(email, password)

    if (!result.success) return

    if (result.user.role !== "ADMIN") {
      setError("Tài khoản này không có đặc quyền truy cập trang quản trị.")
      return
    }

    setToast({
      message: "Đăng nhập QTV thành công!",
      type: "success"
    })

    setTimeout(() => {
      navigate("/admin")
    }, 1000)
  }

  const handleLoginDemoAdmin = () => {

    localStorage.setItem("role", "ADMIN")
    localStorage.setItem("email", "admin@vtpay.local")
    localStorage.setItem("userId", "1")

    setToast({
      message: "Đăng nhập Admin Demo thành công!",
      type: "success"
    })

    setTimeout(() => {
      navigate("/admin")
    }, 1000)
  }

  return (
    <div className="auth-page" style={{ background: '#030712' }}>
      {/* Visual Side bar for Admin login */}
      <div className="auth-visual" style={{ background: 'linear-gradient(180deg, #070e1b 0%, #030712 100%)', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '80%', height: '80%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '80%', height: '80%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 106, 255, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <div className="auth-visual-header">
          <Link to="/" className="auth-brand">
            <img src="/VTPayLogo-Transparent.png" alt="VT Pay Logo" />
            <span style={{ color: '#ffffff' }}>VT Pay <span style={{ fontSize: '0.8rem', background: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', marginLeft: '6px', fontWeight: 600, verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</span></span>
          </Link>
        </div>
        
        <div className="auth-visual-body">
          <h1 className="auth-visual-title" style={{ maxWidth: '18ch' }}>
            Hệ thống Quản trị <span>VT Pay Control Panel.</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '400px', margin: 0 }}>
            Cổng thông tin quản lý ví điện tử, duyệt KYC khách hàng, xử lý khiếu nại giao dịch và cấu hình tham số hệ thống VT Pay.
          </p>
        </div>

        <div className="auth-visual-footer">
          <span><ShieldCheck size={18} weight="fill" color="#dc2626" /> Kênh kết nối QTV an toàn mã hóa SSL</span>
          <span>© 2026 VT Pay Admin Portal.</span>
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="auth-content">
        <div className="auth-card" style={{ background: '#0b0f19', borderColor: 'rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' }}>
          <div className="auth-card-header">
            <Link to="/" className="auth-back-link" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              <ArrowLeft size={16} weight="bold" /> Quay lại Trang chủ
            </Link>
            <h2 style={{ color: '#ffffff' }}>Đăng nhập Admin</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Vui lòng nhập thông tin xác thực quản trị viên.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 14px', borderRadius: '12px', color: '#f87171', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Warning size={16} weight="bold" />
                <span>{error}</span>
              </div>
            )}

            <FormInput
              label={<span style={{ color: '#e2e8f0' }}>Địa chỉ Email Quản trị</span>}
              id="email"
              type="email"
              placeholder="admin@vtpay.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              icon={EnvelopeSimple}
              error={fieldErrors.email}
              inputStyle={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
            />

            <FormInput
              label={<span style={{ color: '#e2e8f0' }}>Mật khẩu QTV</span>}
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              icon={LockSimple}
              showPasswordToggle={true}
              error={fieldErrors.password}
              inputStyle={{ background: '#111827', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
            />

            <button className="auth-btn" type="submit" disabled={loading} style={{ background: '#dc2626', boxShadow: '0 10px 25px rgba(220, 38, 38, 0.25)', marginTop: '8px' }}>
              {loading ? <div className="btn-spinner" /> : 'Đăng nhập Quản trị'}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 600, textTransform: 'uppercase' }}>Hoặc dùng thử</span>
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            </div>

            <button
              className="auth-btn"
              type="button"
              onClick={handleLoginDemoAdmin}
              disabled={loading}
              style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', boxShadow: 'none' }}
            >
              Đăng nhập nhanh Admin Demo
            </button>
          </form>
        </div>
      </div>
      {toast && <ToastAlert message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
