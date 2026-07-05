import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, EnvelopeSimple, LockSimple, User, Phone, ShieldCheck } from '@phosphor-icons/react'
import FormInput from '../components/FormInput.jsx'
import './Auth.css'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // Kiểm tra email trùng
  const checkEmail = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return true;

    try {
      const { data: result } = await axios.get(`http://localhost:8080/api/auth/check-email?email=${encodeURIComponent(email)}`);

      if (result.data) {
        setFieldErrors(prev => ({
          ...prev,
          email: "Địa chỉ email này đã được sử dụng."
        }));
        return false;
      }
    } catch (err) {
      console.error('Lỗi kiểm tra email:', err);
    }

    setFieldErrors(prev => ({
      ...prev,
      email: ""
    }));
    return true;
  };

  // Kiểm tra số điện thoại trùng
  const checkPhone = async () => {
    if (!phone || !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone)) return true;

    try {
      const { data: result } = await axios.get(`http://localhost:8080/api/auth/check-phone?phone=${encodeURIComponent(phone)}`);

      if (result.data) {
        setFieldErrors(prev => ({
          ...prev,
          phone: "Số điện thoại này đã được đăng ký."
        }));
        return false;
      }
    } catch (err) {
      console.error('Lỗi kiểm tra số điện thoại:', err);
    }

    setFieldErrors(prev => ({
      ...prev,
      phone: ""
    }));
    return true;
  };

  const validateForm = () => {
    const errors = {}

    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên.'
    } else if (fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Vui lòng nhập đầy đủ cả họ và tên.'
    }

    if (!email) {
      errors.email = 'Vui lòng nhập địa chỉ email.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Địa chỉ email không đúng định dạng.'
    }

    if (!phone) {
      errors.phone = 'Vui lòng nhập số điện thoại.'
    } else if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone)) {
      errors.phone = 'Số điện thoại không đúng định dạng (VD: 0912345678).'
    }

    if (!password) {
      errors.password = 'Vui lòng thiết lập mật khẩu.'
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu bảo mật phải chứa ít nhất 6 ký tự.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return;

    const emailOk = await checkEmail();
    const phoneOk = await checkPhone();

    if (!emailOk || !phoneOk) {
      return;
    }

    setLoading(true)

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        fullName,
        email,
        phone,
        password
      })

      alert('Chúc mừng! Bạn đã đăng ký tài khoản ví VT Pay thành công.')
      navigate('/login')

    } catch (err) {
      console.error(err)

      if (err.response && err.response.data) {
        const resData = err.response.data
        const code = resData.errorCode

        if (code === 2002) {
          setError('Địa chỉ email này đã được sử dụng cho một tài khoản khác.')
        } else if (code === 2003) {
          setError('Số điện thoại này đã được đăng ký sử dụng.')
        } else if (code === 4000) {
          setError(resData.message || 'Dữ liệu nhập vào không hợp lệ.')
        } else {
          setError(resData.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại.')
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.')
      }
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
              <h2>Mở tài khoản ví</h2>
              <p>Đăng ký tài khoản VT Pay ngay hôm nay để nhận nhiều ưu đãi thanh toán.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && (
                  <div className="error-message" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    {error}
                  </div>
              )}

              <FormInput
                  label="Họ và tên"
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  icon={User}
                  error={fieldErrors.fullName}
              />

              <FormInput
                  label="Địa chỉ Email"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors(prev => ({ ...prev, email: "" }))
                  }}
                  disabled={loading}
                  icon={EnvelopeSimple}
                  error={fieldErrors.email}
                  onBlur={checkEmail}
              />

              <FormInput
                  label="Số điện thoại"
                  id="phone"
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setFieldErrors(prev => ({ ...prev, phone: "" }))
                  }}
                  disabled={loading}
                  icon={Phone}
                  error={fieldErrors.phone}
                  onBlur={checkPhone}
              />

              <FormInput
                  label="Mật khẩu"
                  id="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  icon={LockSimple}
                  showPasswordToggle={true}
                  error={fieldErrors.password}
              />

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <div className="btn-spinner" /> : 'Đăng ký tài khoản'}
              </button>

              <div className="auth-switch">
                Đã có tài khoản ví? <Link to="/login">Đăng nhập ngay</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}

export default Register